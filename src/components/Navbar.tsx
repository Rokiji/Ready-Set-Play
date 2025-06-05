import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Gamepad, LogIn, LogOut, UserPlus, Moon, Sun, Menu, X, Settings } from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { GoogleOAuthProvider, GoogleLogin, googleLogout } from 'react-oauth-google';
import jwt_decode from 'jwt-decode';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';

const API_URL = 'http://192.168.0.74:3001';

const Navbar: React.FC = () => {
  // Auth state
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Signup form state
  const [signupUsername, setSignupUsername] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");

  // Add avatar upload state
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [isDark, setIsDark] = useState(() => {
    return document.documentElement.classList.contains('dark');
  });

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Add a state to track Google login
  const [isGoogleUser, setIsGoogleUser] = useState(false);

  // Add state for profile dialog
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileAvatarFile, setProfileAvatarFile] = useState<File | null>(null);
  const [profileAvatarPreview, setProfileAvatarPreview] = useState<string | null>(user?.avatar_url || null);

  // Add state for profile fields
  const [profileUsername, setProfileUsername] = useState(user?.username || '');
  const [profileEmail, setProfileEmail] = useState(user?.email || '');
  const [profilePassword, setProfilePassword] = useState('');

  const toggleDarkMode = () => {
    setIsDark((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
      return next;
    });
  };

  useEffect(() => {
    // On mount, set theme from localStorage
    const theme = localStorage.getItem('theme');
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    } else {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    }
  }, []);

  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const storedUser = localStorage.getItem('user');
    setIsLoggedIn(loggedIn);
    setUser(storedUser ? JSON.parse(storedUser) : null);
    setIsGoogleUser(localStorage.getItem('isGoogleUser') === 'true');
  }, []);

  // Login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      toast.error("Login failed", { description: "Please enter email and password." });
      return;
    }
    try {
      const res = await fetch(`${API_URL}/profiles/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });
      if (!res.ok) {
        const data = await res.json();
        let errorMsg = "Invalid credentials.";
        if (typeof data.error === 'string') errorMsg = data.error;
        else if (data.error && data.error.sqlMessage) errorMsg = data.error.sqlMessage;
        toast.error("Login failed", { description: errorMsg });
        return;
      }
      const user = await res.json();
      // Defensive: ensure avatar_url is null if falsy
      const safeUser = { ...user, avatar_url: user.avatar_url || null };
      setIsLoggedIn(true);
      setUser(safeUser);
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('user', JSON.stringify(safeUser));
      setIsLoginOpen(false);
      toast.success("Successfully logged in!", { description: `Welcome back, ${user.username}!` });
      setLoginEmail("");
      setLoginPassword("");
    } catch (err) {
      toast.error("Login failed", { description: "Server error." });
    }
  };

  // Signup handler
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupUsername || !signupEmail || !signupPassword) {
      toast.error("Signup failed", { description: "Please fill out all required fields." });
      return;
    }
    let avatar_url = '';
    if (avatarFile) {
      const formData = new FormData();
      formData.append('avatar', avatarFile);
      const res = await fetch('http://localhost:3001/upload/avatar', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      avatar_url = data.url;
    }
    try {
      const res = await fetch(`${API_URL}/profiles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: signupUsername, email: signupEmail, password: signupPassword, avatar_url }),
      });
      if (!res.ok) {
        const data = await res.json();
        let errorMsg = "Unknown error.";
        if (typeof data.error === 'string') errorMsg = data.error;
        else if (data.error && data.error.sqlMessage) errorMsg = data.error.sqlMessage;
        toast.error("Signup failed", { description: errorMsg });
        return;
      }
      const data = await res.json();
      // Defensive: ensure avatar_url is null if falsy
      const safeUser = { ...data, avatar_url: data.avatar_url || null, password: signupPassword };
      setIsLoggedIn(true);
      setUser(safeUser);
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('user', JSON.stringify(safeUser));
      setIsSignupOpen(false);
      toast.success("Account created successfully!", { description: `Welcome, ${signupUsername}!` });
      setSignupUsername("");
      setSignupEmail("");
      setSignupPassword("");
      setAvatarFile(null);
      setAvatarPreview(null);
    } catch (err) {
      toast.error("Signup failed", { description: "Server error." });
    }
  };

  // Logout handler
  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user');
    toast.info("You have been logged out.");
  };

  // Helper to require login for navigation
  const requireLogin = (e: React.MouseEvent, page: string) => {
    if (!isLoggedIn && (page === 'games' || page === 'music' || page === 'leaderboard')) {
      e.preventDefault();
      toast.error("Please log in or sign up first to access the app.");
    }
  };

  // Google login handler
  const handleGoogleLoginSuccess = async (credentialResponse: any) => {
    if (credentialResponse.credential) {
      const decoded: any = jwt_decode(credentialResponse.credential);
      // Sync with backend
      const res = await fetch('http://localhost:3001/profiles/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: decoded.email,
          name: decoded.name,
          picture: decoded.picture
        })
      });
      const user = await res.json();
      // Defensive: ensure avatar_url is null if falsy
      const safeUser = { ...user, avatar_url: user.avatar_url || null };
      setUser(safeUser);
      setIsLoggedIn(true);
      setIsGoogleUser(true);
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('user', JSON.stringify(safeUser));
      localStorage.setItem('isGoogleUser', 'true');
      setIsLoginOpen(false);
      setIsSignupOpen(false);
      toast.success('Successfully logged in with Google!', { description: `Welcome, ${user.username}!` });
    }
  };

  const handleGoogleLogout = () => {
    googleLogout();
    setIsLoggedIn(false);
    setUser(null);
    setIsGoogleUser(false);
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user');
    localStorage.removeItem('isGoogleUser');
    toast.info('You have been logged out.');
  };

  // Add handler for avatar change in profile dialog
  const handleAvatarChange = async () => {
    if (!profileAvatarFile || !user) return;
    const formData = new FormData();
    formData.append('avatar', profileAvatarFile);
    const res = await fetch(`http://localhost:3001/profiles/${user.id}/avatar`, {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    // Update user in state and localStorage
    const updatedUser = { ...user, avatar_url: data.avatar_url };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setProfileAvatarFile(null);
    setProfileAvatarPreview(data.avatar_url);
    toast.success('Avatar updated!');
    setIsProfileOpen(false);
  };

  // Add handler for profile info update
  const handleProfileUpdate = async () => {
    if (!user) return;
    const body: Record<string, string> = {};
    if (profileUsername.trim() && profileUsername !== user.username) {
      body.username = profileUsername;
    }
    if (profileEmail.trim() && profileEmail !== user.email) {
      body.email = profileEmail;
    }
    if (profilePassword) {
      body.password = profilePassword;
    }
    if (Object.keys(body).length === 0) {
      toast.info('No changes to update.');
      return;
    }
    console.log('Updating profile with:', body); // Debug log
    const res = await fetch(`http://localhost:3001/profiles/${user.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      setUser({ ...user, ...body, password: undefined });
      localStorage.setItem('user', JSON.stringify({ ...user, ...body, password: undefined }));
      toast.success('Profile updated!');
      setIsProfileOpen(false);
      setProfilePassword('');
    } else {
      const data = await res.json();
      toast.error('Failed to update profile', { description: data.error || 'Unknown error' });
    }
  };

  // Helper to get the correct avatar URL
  const getAvatarUrl = (userObj: any) => {
    if (!userObj) return '';
    if (userObj.avatar_url) {
      if (userObj.avatar_url.startsWith('http')) return userObj.avatar_url;
      return `http://localhost:3001${userObj.avatar_url}`;
    }
    return `https://api.dicebear.com/7.x/identicon/svg?seed=${userObj.username || userObj.name}`;
  };

  return (
    <GoogleOAuthProvider clientId="668033698905-d175r2tdsg72kjjmvj49l34es6ion76r.apps.googleusercontent.com">
      <nav className="bg-game-primary dark:bg-gray-900 text-white py-4 px-0 shadow-md h-20 min-h-20 flex items-center">
        <div className="container mx-auto px-6 flex justify-between items-center relative h-full">
          {/* Left: Logo */}
          <div className="flex items-center gap-2 h-full">
            <Link to="/" className="flex items-center gap-2 h-full">
              <Gamepad size={28} className="text-game-secondary" />
              <h1 className="text-2xl font-bold">Ready, Set, Play</h1>
            </Link>
          </div>

          {/* Center: Nav Links (Desktop Only) */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 gap-6 items-center h-full hidden md:flex">
            <Link to="/" className="hover:text-game-secondary transition-colors transform hover:scale-110 duration-200">Home</Link>
            <Link to="/games" className="hover:text-game-secondary transition-colors transform hover:scale-110 duration-200" onClick={e => requireLogin(e, 'games')}>Games</Link>
            <Link to="/music" className="hover:text-game-secondary transition-colors transform hover:scale-110 duration-200" onClick={e => requireLogin(e, 'music')}>Music</Link>
            <Link to="/leaderboard" className="hover:text-game-secondary transition-colors transform hover:scale-110 duration-200" onClick={e => requireLogin(e, 'leaderboard')}>Leaderboard</Link>
            <Link to="/about" className="hover:text-game-secondary transition-colors transform hover:scale-110 duration-200">About</Link>
          </div>

          {/* Hamburger Menu (Mobile Only) */}
          <button
            className="md:hidden flex items-center justify-center p-2 rounded hover:bg-game-secondary/20 transition-colors"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={28} />
          </button>

          {/* Right: User Actions (Desktop Only) */}
          <div className="flex items-center gap-2 min-w-[220px] justify-end h-full hidden md:flex">
            {isLoggedIn ? (
              <>
                {user && (
                  <img
                    src={getAvatarUrl(user)}
                    alt="User Avatar"
                    className="w-8 h-8 rounded-full mr-2 border border-white object-cover"
                  />
                )}
                <span className="mr-2">What's up, {user?.username || user?.name}!</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-white hover:text-game-secondary">
                      <Settings size={22} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={toggleDarkMode}>
                      {isDark ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />} {isDark ? 'Light Mode' : 'Dark Mode'}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setIsProfileOpen(true)}>
                      <UserPlus className="mr-2 h-4 w-4" /> Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={isGoogleUser ? handleGoogleLogout : handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" /> Log Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-white hover:text-game-secondary">
                    <Settings size={22} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={toggleDarkMode}>
                    {isDark ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />} {isDark ? 'Light Mode' : 'Dark Mode'}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setIsLoginOpen(true)}>
                    <LogIn className="mr-2 h-4 w-4" /> Log In
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setIsSignupOpen(true)}>
                    <UserPlus className="mr-2 h-4 w-4" /> Sign Up
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 flex flex-col items-center justify-center md:hidden transition-all">
            <button
              className="absolute top-6 right-6 p-2 rounded hover:bg-game-secondary/20 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close menu"
            >
              <X size={32} />
            </button>
            <nav className="flex flex-col gap-8 text-2xl items-center">
              <Link to="/" onClick={() => setMobileMenuOpen(false)} className="hover:text-game-secondary transition-colors">Home</Link>
              <Link to="/games" onClick={e => { requireLogin(e, 'games'); setMobileMenuOpen(false); }} className="hover:text-game-secondary transition-colors">Games</Link>
              <Link to="/music" onClick={e => { requireLogin(e, 'music'); setMobileMenuOpen(false); }} className="hover:text-game-secondary transition-colors">Music</Link>
              <Link to="/leaderboard" onClick={e => { requireLogin(e, 'leaderboard'); setMobileMenuOpen(false); }} className="hover:text-game-secondary transition-colors">Leaderboard</Link>
              <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="hover:text-game-secondary transition-colors">About</Link>
            </nav>
            <div className="flex flex-col gap-4 mt-12 w-full items-center">
              {!isLoggedIn && (
                <div className="flex flex-col items-center w-full gap-2 mb-2">
                  <div className="w-48 flex justify-center">
                    <GoogleLogin
                      onSuccess={handleGoogleLoginSuccess}
                      onError={() => toast.error('Google Login Failed')}
                      useOneTap
                      text="signin_with"
                    />
                  </div>
                </div>
              )}
              {isLoggedIn ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-white hover:text-game-secondary">
                      <Settings size={22} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={toggleDarkMode}>
                      {isDark ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />} {isDark ? 'Light Mode' : 'Dark Mode'}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setIsProfileOpen(true)}>
                      <UserPlus className="mr-2 h-4 w-4" /> Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={isGoogleUser ? handleGoogleLogout : handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" /> Log Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-white hover:text-game-secondary">
                        <Settings size={22} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={toggleDarkMode}>
                        {isDark ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />} {isDark ? 'Light Mode' : 'Dark Mode'}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setIsLoginOpen(true)}>
                        <LogIn className="mr-2 h-4 w-4" /> Log In
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setIsSignupOpen(true)}>
                        <UserPlus className="mr-2 h-4 w-4" /> Sign Up
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}
              <Button
                variant="ghost"
                size="lg"
                className="text-white hover:text-game-secondary w-48"
                onClick={() => { toggleDarkMode(); setMobileMenuOpen(false); }}
                aria-label="Toggle dark mode"
              >
                {isDark ? <Sun size={22} /> : <Moon size={22} />}
              </Button>
            </div>
          </div>
        )}

        {/* Login Dialog */}
        <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
          <DialogContent className="sm:max-w-[425px] bg-card text-card-foreground">
            <DialogHeader>
              <DialogTitle>Log In</DialogTitle>
              <DialogDescription>
                Enter your credentials to access your account.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleLogin}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="example@email.com" 
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="bg-background"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="bg-background"
                  />
                </div>
                <div className="flex items-center my-2">
                  <div className="flex-grow h-px bg-muted" />
                  <span className="mx-2 text-muted-foreground text-xs font-medium">or</span>
                  <div className="flex-grow h-px bg-muted" />
                </div>
                <div className="flex justify-center mt-2">
                  <div className="w-48 flex justify-center">
                    <GoogleLogin
                      onSuccess={handleGoogleLoginSuccess}
                      onError={() => toast.error('Google Login Failed')}
                      useOneTap
                      text="signin_with"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-center mt-4">
                <Button type="submit" className="bg-game-primary hover:bg-game-primary/90 w-48">Log In</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Signup Dialog */}
        <Dialog open={isSignupOpen} onOpenChange={setIsSignupOpen}>
          <DialogContent className="sm:max-w-[425px] bg-card text-card-foreground">
            <DialogHeader>
              <DialogTitle>Create an Account</DialogTitle>
              <DialogDescription>
                Fill out the form below to create your account.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSignup}>
              <div className="grid gap-4 py-4">
                <div className="flex flex-col items-center gap-2">
                  <img
                    src={avatarPreview || getAvatarUrl({ username: signupUsername })}
                    alt="Avatar Preview"
                    className="w-24 h-24 rounded-full border mb-2 object-cover"
                  />
                  <input
                    id="avatar"
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={e => {
                      const file = e.target.files?.[0] || null;
                      setAvatarFile(file);
                      setAvatarPreview(file ? URL.createObjectURL(file) : null);
                    }}
                  />
                  <Button
                    type="button"
                    className="w-48"
                    onClick={() => document.getElementById('avatar')?.click()}
                  >
                    Upload Image
                  </Button>
                  <span className="text-xs text-muted-foreground mt-1">
                    {avatarFile ? avatarFile.name : 'No file chosen'}
                  </span>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="username">Username</Label>
                  <Input 
                    id="username" 
                    value={signupUsername}
                    onChange={(e) => setSignupUsername(e.target.value)}
                    placeholder="GameMaster" 
                    className="bg-background"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input 
                    id="signup-email" 
                    type="email" 
                    placeholder="example@email.com" 
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    className="bg-background"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input 
                    id="signup-password" 
                    type="password"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    className="bg-background"
                  />
                </div>
                <div className="flex items-center my-2">
                  <div className="flex-grow h-px bg-muted" />
                  <span className="mx-2 text-muted-foreground text-xs font-medium">or</span>
                  <div className="flex-grow h-px bg-muted" />
                </div>
                <div className="flex justify-center mt-2">
                  <div className="w-48 flex justify-center">
                    <GoogleLogin
                      onSuccess={handleGoogleLoginSuccess}
                      onError={() => toast.error('Google Signup Failed')}
                      useOneTap
                      text="signup_with"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-center mt-4">
                <Button type="submit" className="bg-game-secondary hover:bg-game-secondary/90 text-game-background w-48">
                  Create Account
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Profile Dialog */}
        <Dialog open={isProfileOpen} onOpenChange={(open) => {
          setIsProfileOpen(open);
          if (open && user) {
            setProfileUsername(user.username || '');
            setProfileEmail(user.email || '');
            setProfilePassword('');
            setProfileAvatarPreview(user.avatar_url || null);
            setProfileAvatarFile(null);
          }
        }}>
          <DialogContent className="sm:max-w-[425px] bg-card text-card-foreground">
            <DialogHeader>
              <DialogTitle>Profile Settings</DialogTitle>
              <DialogDescription>Update your avatar and profile information below.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="flex flex-col items-center gap-2">
                <img
                  src={profileAvatarPreview || getAvatarUrl(user)}
                  alt="Avatar Preview"
                  className="w-24 h-24 rounded-full border mb-2 object-cover"
                />
                <input
                  id="profile-avatar"
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={e => {
                    const file = e.target.files?.[0] || null;
                    setProfileAvatarFile(file);
                    setProfileAvatarPreview(file ? URL.createObjectURL(file) : user?.avatar_url || null);
                  }}
                />
                <Button
                  type="button"
                  className="w-48"
                  onClick={() => document.getElementById('profile-avatar')?.click()}
                >
                  Upload Image
                </Button>
                <span className="text-xs text-muted-foreground mt-1">
                  {profileAvatarFile ? profileAvatarFile.name : 'No file chosen'}
                </span>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="profile-username">Username</Label>
                <Input id="profile-username" value={profileUsername} onChange={e => setProfileUsername(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="profile-email">Email</Label>
                <Input id="profile-email" value={profileEmail} onChange={e => setProfileEmail(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="profile-password">New Password (optional)</Label>
                <Input id="profile-password" type="password" value={profilePassword} onChange={e => setProfilePassword(e.target.value)} />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAvatarChange} disabled={!profileAvatarFile} className="bg-game-primary hover:bg-game-primary/90">
                Update Avatar
              </Button>
              <Button onClick={handleProfileUpdate} className="bg-game-primary hover:bg-game-primary/90">
                Update Profile
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </nav>
    </GoogleOAuthProvider>
  );
};

export default Navbar;