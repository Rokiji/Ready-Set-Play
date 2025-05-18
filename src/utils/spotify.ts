
// Spotify API authentication helper

// Scopes for Spotify API permissions
const SPOTIFY_SCOPES = [
  'streaming',
  'user-read-email',
  'user-read-private',
  'user-read-playback-state',
  'user-modify-playback-state',
  'user-read-currently-playing'
].join('%20');

// Replace with your Spotify client ID
const CLIENT_ID = 'YOUR_SPOTIFY_CLIENT_ID';
const REDIRECT_URI = window.location.origin + '/callback';

/**
 * Generates a random string for state verification
 */
const generateRandomString = (length: number): string => {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

/**
 * Redirect to Spotify authorization page
 */
export const loginToSpotify = (): void => {
  const state = generateRandomString(16);
  localStorage.setItem('spotify_auth_state', state);

  const authUrl = 'https://accounts.spotify.com/authorize?' +
    `client_id=${CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
    `&scope=${SPOTIFY_SCOPES}` +
    '&response_type=token' +
    `&state=${state}`;

  window.location.href = authUrl;
};

/**
 * Parse the access token from URL hash after Spotify authorization
 */
export const getTokenFromUrl = (): { [key: string]: string } => {
  return window.location.hash
    .substring(1)
    .split('&')
    .reduce((initial: { [key: string]: string }, item) => {
      const parts = item.split('=');
      initial[parts[0]] = decodeURIComponent(parts[1]);
      return initial;
    }, {});
};

/**
 * Get the saved Spotify token from localStorage
 */
export const getStoredToken = (): string | null => {
  return localStorage.getItem('spotify_token');
};
