
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTokenFromUrl } from '@/utils/spotify';

const SpotifyCallback: React.FC = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    const hash = getTokenFromUrl();
    const token = hash.access_token;
    
    if (token) {
      // Store the token in localStorage
      localStorage.setItem('spotify_token', token);
      
      // Clear the hash from the URL
      window.location.hash = '';
      
      // Redirect back to the page they were on before login
      const returnPath = localStorage.getItem('spotify_return_path') || '/';
      navigate(returnPath);
    } else {
      // Authentication failed or was canceled
      navigate('/');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Connecting to Spotify...</h1>
        <p>Please wait while we complete the authentication.</p>
      </div>
    </div>
  );
};

export default SpotifyCallback;
