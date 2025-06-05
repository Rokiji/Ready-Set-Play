const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Update these with your XAMPP MySQL credentials
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', // default XAMPP password is empty
  database: 'ready_set_play'
});

db.connect(err => {
  if (err) {
    console.error('MySQL connection error:', err);
    process.exit(1);
  } else {
    console.log('Connected to MySQL database.');
  }
});

// Set up storage for avatars
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/avatars'));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  }
});
const upload = multer({ storage });

// Get all profiles
app.get('/profiles', (req, res) => {
  db.query('SELECT id, username, email, created_at FROM profiles', (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

// Get a profile by id
app.get('/profiles/:id', (req, res) => {
  const { id } = req.params;
  db.query('SELECT id, username, email, created_at FROM profiles WHERE id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    if (results.length === 0) return res.status(404).json({ error: 'Profile not found' });
    res.json(results[0]);
  });
});

// Add a new profile (signup)
app.post('/profiles', async (req, res) => {
  const { username, email, password, avatar_url } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Username, email, and password are required.' });
  }
  try {
    const hash = await bcrypt.hash(password, 10);
    const avatar = avatar_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(username)}`;
    db.query(
      'INSERT INTO profiles (username, email, password, avatar_url) VALUES (?, ?, ?, ?)',
      [username, email, hash, avatar],
      (err, result) => {
        if (err) {
          if (err.code === 'ER_DUP_ENTRY') {
            if (err.sqlMessage.includes('email')) {
              return res.status(400).json({ error: 'Email is already in use.' });
            }
            if (err.sqlMessage.includes('username')) {
              return res.status(400).json({ error: 'Username is already in use.' });
            }
            return res.status(400).json({ error: 'Email or username is already in use.' });
          }
          return res.status(500).json({ error: err.sqlMessage || 'Database error.' });
        }
        res.json({ id: result.insertId, username, email, avatar_url: avatar });
      }
    );
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// Update profile info (username, email, password)
app.put('/profiles/:id', async (req, res) => {
  const { id } = req.params;
  const { username, email, password } = req.body;

  // Build dynamic query and params
  let updates = [];
  let params = [];

  if (username !== undefined) {
    updates.push('username = ?');
    params.push(username);
  }
  if (email !== undefined) {
    updates.push('email = ?');
    params.push(email);
  }
  if (password) {
    const hash = await bcrypt.hash(password, 10);
    updates.push('password = ?');
    params.push(hash);
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: 'No fields to update.' });
  }

  params.push(id);
  const query = `UPDATE profiles SET ${updates.join(', ')} WHERE id = ?`;

  db.query(query, params, (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ success: true });
  });
});

// Delete a profile
app.delete('/profiles/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM profiles WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Profile not found' });
    res.json({ success: true });
  });
});

// Login endpoint
app.post('/profiles/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }
  db.query(
    'SELECT * FROM profiles WHERE email = ?',
    [email],
    async (err, results) => {
      if (err) {
        console.error('Login SQL error:', err);
        return res.status(500).json({ error: err.sqlMessage || 'Database error.' });
      }
      if (results.length === 0) return res.status(401).json({ error: 'Invalid email or password.' });
      const user = results[0];
      try {
        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(401).json({ error: 'Invalid email or password.' });
        res.json({ id: user.id, username: user.username, email: user.email, avatar_url: user.avatar_url });
      } catch (e) {
        console.error('Bcrypt error:', e);
        return res.status(500).json({ error: 'Server error.' });
      }
    }
  );
});

// Get leaderboard for a game
app.get('/leaderboard/:gameId', (req, res) => {
  const { gameId } = req.params;
  console.log('Leaderboard request for gameId:', gameId);
  db.query(
    'SELECT username, score, created_at FROM leaderboard WHERE game_id = ? ORDER BY score DESC, created_at ASC LIMIT 20',
    [gameId],
    (err, results) => {
      if (err) {
        console.error('Leaderboard query error:', err);
        return res.status(500).json({ error: err });
      }
      res.json(results);
    }
  );
});

// Add a new score
app.post('/leaderboard', (req, res) => {
  const { game_id, user_id, username, score } = req.body;
  if (!game_id || !user_id || !username || typeof score !== 'number') {
    return res.status(400).json({ error: 'Missing required fields.' });
  }
  db.query(
    'INSERT INTO leaderboard (game_id, user_id, username, score) VALUES (?, ?, ?, ?)',
    [game_id, user_id, username, score],
    (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ success: true, id: result.insertId });
    }
  );
});

// Google login/signup (create or fetch user)
app.post('/profiles/google', (req, res) => {
  const { email, name, picture } = req.body;
  if (!email || !name) {
    return res.status(400).json({ error: 'Email and name are required.' });
  }
  db.query(
    'SELECT id, username, email, avatar_url FROM profiles WHERE email = ?',
    [email],
    (err, results) => {
      if (err) return res.status(500).json({ error: err });
      if (results.length > 0) {
        // If avatar_url is missing, update it
        if (!results[0].avatar_url && picture) {
          db.query(
            'UPDATE profiles SET avatar_url = ? WHERE id = ?',
            [picture, results[0].id]
          );
          results[0].avatar_url = picture;
        }
        return res.json(results[0]);
      }
      // User does not exist, create it
      db.query(
        'INSERT INTO profiles (username, email, password, avatar_url) VALUES (?, ?, ?, ?)',
        [name, email, 'GOOGLE_AUTH', picture || null],
        (err, result) => {
          if (err) return res.status(500).json({ error: err });
          res.json({ id: result.insertId, username: name, email, avatar_url: picture });
        }
      );
    }
  );
});

// Avatar upload endpoint
app.post('/upload/avatar', upload.single('avatar'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  // Return the public URL to the uploaded avatar
  res.json({ url: `/avatars/${req.file.filename}` });
});

// Avatar update for existing user
app.post('/profiles/:id/avatar', upload.single('avatar'), (req, res) => {
  const { id } = req.params;
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const avatarUrl = `/avatars/${req.file.filename}`;
  db.query(
    'UPDATE profiles SET avatar_url = ? WHERE id = ?',
    [avatarUrl, id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ avatar_url: avatarUrl });
    }
  );
});

// Serve static avatars
app.use('/avatars', express.static(path.join(__dirname, '../public/avatars')));

// Get all feedback comments
app.get('/feedback', (req, res) => {
  db.query('SELECT id, comment, username, avatar_url, created_at FROM feedback ORDER BY created_at DESC', (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

// Add a new feedback comment
app.post('/feedback', (req, res) => {
  const { comment, username, avatar_url } = req.body;
  console.log('Received feedback:', { comment, username, avatar_url }); // Debug log
  db.query('INSERT INTO feedback (comment, username, avatar_url) VALUES (?, ?, ?)', [comment, username || 'Anonymous', avatar_url || null], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ id: result.insertId, comment, username: username || 'Anonymous', avatar_url: avatar_url || null });
  });
});

const PORT = 3001;
app.listen(PORT, () => console.log(`API server running on port ${PORT}`)); 