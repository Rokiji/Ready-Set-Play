
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';
import SpotifyWebApi from 'spotify-web-api-js';

interface SpotifyPlayerProps {
  token: string | null;
}

const spotifyApi = new SpotifyWebApi();

const SpotifyPlayer: React.FC<SpotifyPlayerProps> = ({ token }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<any>(null);
  const [player, setPlayer] = useState<Spotify.Player | null>(null);
  const [deviceId, setDeviceId] = useState("");
  const [isReady, setIsReady] = useState(false);

  // Initialize Spotify Web Playback SDK
  useEffect(() => {
    if (!token) return;

    spotifyApi.setAccessToken(token);
    
    // Load Spotify Web Playback SDK script
    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;
    document.body.appendChild(script);

    // Initialize the player when the SDK is loaded
    window.onSpotifyWebPlaybackSDKReady = () => {
      const spotifyPlayer = new window.Spotify.Player({
        name: 'Ready, Set, Play',
        getOAuthToken: (cb) => {
          cb(token);
        },
        volume: volume / 100
      });

      // Error handling
      spotifyPlayer.addListener('initialization_error', ({ message }) => {
        console.error('Initialization error:', message);
      });
      spotifyPlayer.addListener('authentication_error', ({ message }) => {
        console.error('Authentication error:', message);
      });
      spotifyPlayer.addListener('account_error', ({ message }) => {
        console.error('Account error:', message);
      });
      spotifyPlayer.addListener('playback_error', ({ message }) => {
        console.error('Playback error:', message);
      });

      // Playback status updates
      spotifyPlayer.addListener('player_state_changed', (state) => {
        if (state) {
          setIsPlaying(!state.paused);
          if (state.track_window.current_track) {
            setCurrentTrack(state.track_window.current_track);
          }
        }
      });

      // Ready
      spotifyPlayer.addListener('ready', ({ device_id }) => {
        console.log('Ready with Device ID', device_id);
        setDeviceId(device_id);
        setIsReady(true);
        setPlayer(spotifyPlayer);
      });

      // Connect to the player!
      spotifyPlayer.connect();
    };

    return () => {
      // Clean up
      if (player) {
        player.disconnect();
      }
    };
  }, [token, volume]);

  // Handle play/pause
  const togglePlay = async () => {
    if (!player || !isReady) return;
    
    try {
      if (isPlaying) {
        await spotifyApi.pause();
      } else {
        await spotifyApi.play({
          device_id: deviceId
        });
      }
      setIsPlaying(!isPlaying);
    } catch (error) {
      console.error('Error toggling playback:', error);
    }
  };

  // Handle next track
  const nextTrack = async () => {
    if (!player || !isReady) return;
    
    try {
      await spotifyApi.skipToNext({
        device_id: deviceId
      });
    } catch (error) {
      console.error('Error skipping to next track:', error);
    }
  };

  // Handle previous track
  const previousTrack = async () => {
    if (!player || !isReady) return;
    
    try {
      await spotifyApi.skipToPrevious({
        device_id: deviceId
      });
    } catch (error) {
      console.error('Error skipping to previous track:', error);
    }
  };

  // Handle volume change
  const handleVolumeChange = (value: number[]) => {
    if (!player || !isReady) return;
    
    const newVolume = value[0];
    setVolume(newVolume);
    player.setVolume(newVolume / 100);
    
    if (isMuted && newVolume > 0) {
      setIsMuted(false);
    }
  };

  // Handle mute/unmute
  const toggleMute = () => {
    if (!player || !isReady) return;
    
    const newMuteState = !isMuted;
    setIsMuted(newMuteState);
    player.setVolume(newMuteState ? 0 : volume / 100);
  };

  if (!token) {
    return (
      <div className="music-player bg-gray-800 text-white py-4">
        <div className="container mx-auto text-center">
          <p>Please login to Spotify to use the music player</p>
          <Button className="mt-2">
            Login with Spotify
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="music-player bg-gray-800 text-white py-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-4">
          {/* Music controls */}
          <button 
            className="btn-icon" 
            aria-label="Previous song"
            onClick={previousTrack}
            disabled={!isReady}
          >
            <SkipBack size={20} />
          </button>
          
          <button 
            className="btn-icon p-3 bg-green-500 rounded-full" 
            onClick={togglePlay} 
            aria-label={isPlaying ? "Pause" : "Play"}
            disabled={!isReady}
          >
            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
          </button>
          
          <button 
            className="btn-icon" 
            aria-label="Next song"
            onClick={nextTrack}
            disabled={!isReady}
          >
            <SkipForward size={20} />
          </button>
        </div>
        
        <div className="hidden md:block flex-1 px-8">
          <div className="flex flex-col items-center">
            <div className="text-center mb-1">
              <span className="font-medium">
                {currentTrack ? currentTrack.name : 'No track playing'}
              </span>
              {currentTrack && (
                <>
                  <span className="mx-1 text-gray-300">•</span>
                  <span className="text-gray-300">
                    {currentTrack.artists.map((artist: any) => artist.name).join(', ')}
                  </span>
                </>
              )}
            </div>
            <Slider
              defaultValue={[33]}
              max={100}
              step={1}
              className="w-full"
              disabled={!isReady}
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            className="btn-icon" 
            onClick={toggleMute} 
            aria-label={isMuted ? "Unmute" : "Mute"}
            disabled={!isReady}
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
          
          <div className="hidden md:block w-28">
            <Slider
              value={[isMuted ? 0 : volume]}
              max={100}
              step={1}
              onValueChange={handleVolumeChange}
              className="w-full"
              disabled={!isReady}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpotifyPlayer;
