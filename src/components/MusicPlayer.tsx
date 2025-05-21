
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Minus, Maximize2 } from 'lucide-react';
import { songsData } from '@/data/musicData';
import { toast } from "sonner";

// Create a static audio element outside of component to persist across renders and navigation
const audioElement = new Audio();
// Track if audio is currently playing (persisted across component mounts)
let isAudioPlaying = false;
// Keep track of current track index across component mounts
let persistentCurrentTrackIndex = 0;
// Last played position to resume from
let lastPlayedPosition = 0;

// Load previously selected song from localStorage if available
try {
  const storedIndex = localStorage.getItem('current_song_index');
  if (storedIndex) {
    const parsedIndex = parseInt(storedIndex, 10);
    if (!isNaN(parsedIndex) && parsedIndex >= 0 && parsedIndex < songsData.length) {
      persistentCurrentTrackIndex = parsedIndex;
      audioElement.src = songsData[parsedIndex].url;
      // Load the audio but don't play yet
      audioElement.load();
    }
  }
} catch (error) {
  console.error('Error reading from localStorage:', error);
}

const MusicPlayer: React.FC = () => {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(persistentCurrentTrackIndex);
  const [isPlaying, setIsPlaying] = useState(isAudioPlaying);
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isSpotifyTrack, setIsSpotifyTrack] = useState(false);
  const [minimized, setMinimized] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(audioElement);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  
  // Get current track from songs data
  const currentTrack = songsData[currentTrackIndex];

  useEffect(() => {
    // Setup event listeners for HTML5 audio
    const audio = audioRef.current;
    
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleTrackEnded);
    audio.addEventListener('error', handleAudioError);
    
    // Listen for custom event to play a specific song
    window.addEventListener('play-song', handlePlaySongEvent);
    
    // If audio was previously playing, restore that state
    if (isAudioPlaying && !isSpotifyTrack) {
      setIsPlaying(true);
      // Make sure audio is actually playing and resume from last position
      if (audio.paused) {
        audio.currentTime = lastPlayedPosition;
        audio.play().catch(err => console.error("Failed to resume audio:", err));
      }
    }
    
    // Save currentTime on unmount but don't pause the audio
    return () => {
      // Store the current playback position before unmounting
      if (audio) {
        lastPlayedPosition = audio.currentTime;
      }
      
      // Remove all event listeners but DON'T pause the audio
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleTrackEnded);
      audio.removeEventListener('error', handleAudioError);
      window.removeEventListener('play-song', handlePlaySongEvent);
    };
  }, []);
  
  // Update audio source when currentTrackIndex changes
  useEffect(() => {
    if (!currentTrack) return;
    
    // Update persistent track index
    persistentCurrentTrackIndex = currentTrackIndex;
    
    // Save track to localStorage
    localStorage.setItem('current_song_index', currentTrackIndex.toString());
    
    // Check if the track is a Spotify track
    const isSpotify = currentTrack.url.includes('spotify');
    setIsSpotifyTrack(isSpotify);
    
    if (!isSpotify && audioRef.current) {
      // Handle regular audio tracks
      const wasPlaying = isAudioPlaying || !audioRef.current.paused;
      
      // Update source
      audioRef.current.src = currentTrack.url;
      audioRef.current.load();
      
      // Set volume
      audioRef.current.volume = isMuted ? 0 : volume / 100;
      
      // Play if it was already playing
      if (wasPlaying) {
        playTrack();
      }
    } else {
      // For Spotify tracks, we'll use the iframe
      // If audio was playing, pause it when switching to Spotify
      if (!isSpotifyTrack && isAudioPlaying) {
        audioRef.current.pause();
        isAudioPlaying = false;
      }
    }
  }, [currentTrackIndex, currentTrack]);
  
  // Handle custom play-song event
  const handlePlaySongEvent = (event: Event) => {
    const customEvent = event as CustomEvent;
    if (customEvent.detail && typeof customEvent.detail.songIndex === 'number') {
      setCurrentTrackIndex(customEvent.detail.songIndex);
      // Auto-play the selected song immediately
      setIsPlaying(true);
      setTimeout(() => {
        playTrack();
      }, 100);
    }
  };
  
  // Play current track
  const playTrack = () => {
    if (isSpotifyTrack) {
      // For Spotify tracks, we rely on the iframe's built-in controls
      toast.info(`Playing ${currentTrack.title} on Spotify`, {
        description: `This track plays in the Spotify iframe`
      });
      setIsPlaying(true);
      isAudioPlaying = true;
      
      // Try to interact with Spotify iframe to autoplay
      if (iframeRef.current) {
        try {
          // This is a hack - we can't directly control the Spotify iframe
          // but we can try to simulate a click on its play button
          const spotifyFrame = iframeRef.current as any;
          if (spotifyFrame.contentDocument) {
            const playButton = spotifyFrame.contentDocument.querySelector('[data-testid="play-button"]');
            if (playButton) playButton.click();
          }
        } catch (error) {
          console.log('Cannot interact with Spotify iframe due to security restrictions');
        }
      }
      
      return;
    }
    
    if (audioRef.current) {
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
          isAudioPlaying = true;
        })
        .catch(error => {
          console.error("Error playing audio:", error);
          toast.error("Couldn't play audio. Please try another track.");
          setIsPlaying(false);
          isAudioPlaying = false;
        });
    }
  };
  
  // Handle audio errors
  function handleAudioError(e: ErrorEvent) {
    console.error("Audio error:", e);
    toast.error("There was a problem playing this track. Please try another one.");
    setIsPlaying(false);
    isAudioPlaying = false;
  }
  
  // Handle time update event
  function handleTimeUpdate() {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      // Update the lastPlayedPosition as well
      lastPlayedPosition = audioRef.current.currentTime;
    }
  }
  
  // Handle loaded metadata event
  function handleLoadedMetadata() {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  }
  
  // Handle track ended event
  function handleTrackEnded() {
    nextTrack();
  }
  
  // Format time in minutes:seconds
  function formatTime(time: number) {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }
  
  // Toggle play/pause
  const togglePlay = () => {
    if (isSpotifyTrack) {
      // For Spotify, we're just toggling the visual state as the iframe controls playback
      const newPlayingState = !isPlaying;
      setIsPlaying(newPlayingState);
      isAudioPlaying = newPlayingState;
      toast.info(newPlayingState ? `Playing ${currentTrack.title} on Spotify` : 'Paused Spotify track');
      return;
    }
    
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      isAudioPlaying = false;
    } else {
      playTrack();
    }
  };
  
  // Next track
  function nextTrack() {
    const newIndex = (currentTrackIndex + 1) % songsData.length;
    setCurrentTrackIndex(newIndex);
  }
  
  // Previous track
  function previousTrack() {
    const newIndex = (currentTrackIndex - 1 + songsData.length) % songsData.length;
    setCurrentTrackIndex(newIndex);
  }
  
  // Handle volume change
  function handleVolumeChange(value: number[]) {
    if (!audioRef.current) return;
    
    const newVolume = value[0];
    setVolume(newVolume);
    audioRef.current.volume = isMuted ? 0 : newVolume / 100;
    
    if (isMuted && newVolume > 0) {
      setIsMuted(false);
    }
  }
  
  // Handle seek change
  function handleSeekChange(value: number[]) {
    if (!audioRef.current || isSpotifyTrack) return;
    
    const seekTime = value[0];
    audioRef.current.currentTime = seekTime;
    setCurrentTime(seekTime);
    lastPlayedPosition = seekTime;
  }
  
  // Toggle mute
  function toggleMute() {
    if (!audioRef.current) return;
    
    const newMuteState = !isMuted;
    setIsMuted(newMuteState);
    audioRef.current.volume = newMuteState ? 0 : volume / 100;
  }

  return (
    <div className="music-player bg-gray-900/90 text-white py-4 fixed bottom-0 left-0 right-0 z-50">
      {/* Minimize button in upper right */}
      {!minimized && (
        <button
          className="absolute top-2 right-4 z-10 p-1 rounded hover:bg-gray-800 transition"
          aria-label="Minimize player"
          onClick={() => setMinimized(true)}
        >
          <Minus size={18} />
        </button>
      )}
      {minimized ? (
        <div className="flex items-center justify-between px-4 py-2 bg-gray-900/90 rounded shadow w-full">
          <span className="text-sm text-white/80">
            {currentTrack ? currentTrack.title : 'No track selected'}
          </span>
          <button
            className="ml-2 p-1 rounded hover:bg-gray-800 transition"
            aria-label="Restore player"
            onClick={() => setMinimized(false)}
          >
            <Maximize2 size={18} />
          </button>
        </div>
      ) : (
        <div className="container mx-auto flex flex-col justify-between items-center">
          {isSpotifyTrack && currentTrack?.spotifyId && (
            <div className="w-full mb-4 flex items-center justify-between">
              {/* Previous button on the left */}
              <button 
                className="btn-icon mr-2" 
                aria-label="Previous song"
                onClick={previousTrack}
              >
                <SkipBack size={20} className="text-white" />
              </button>
              {/* Spotify iframe in the center */}
              <iframe
                ref={iframeRef}
                src={`https://open.spotify.com/embed/track/${currentTrack.spotifyId}?utm_source=generator&autoplay=1`}
                width="100%"
                height="80"
                frameBorder="0"
                allowFullScreen
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                className="rounded-xl flex-1"
              ></iframe>
              {/* Next button on the right */}
              <button 
                className="btn-icon ml-2" 
                aria-label="Next song"
                onClick={nextTrack}
              >
                <SkipForward size={20} className="text-white" />
              </button>
            </div>
          )}
          <div className="container mx-auto flex justify-between items-center">
            <div className="flex items-center gap-4">
              {/* Music controls */}
              {/* Remove prev/next buttons for Spotify, keep for non-Spotify */}
              {!isSpotifyTrack && (
                <>
                  <button 
                    className="btn-icon" 
                    aria-label="Previous song"
                    onClick={previousTrack}
                  >
                    <SkipBack size={20} className="text-white" />
                  </button>
                  {/* Play/Pause button */}
                  <button 
                    className="btn-icon" 
                    aria-label={isPlaying ? "Pause" : "Play"}
                    onClick={togglePlay}
                  >
                    {isPlaying ? 
                      <Pause size={20} className="text-white" /> : 
                      <Play size={20} className="text-white" />}
                  </button>
                  <button 
                    className="btn-icon" 
                    aria-label="Next song"
                    onClick={nextTrack}
                  >
                    <SkipForward size={20} className="text-white" />
                  </button>
                </>
              )}
            </div>
            
            <div className="hidden md:block flex-1 px-8">
              <div className="flex flex-col items-center">
                {/* Remove title/artist text for Spotify tracks */}
                {(!isSpotifyTrack) && (
                  <div className="text-center mb-1">
                    <span className="font-medium text-white">
                      {currentTrack ? currentTrack.title : 'No track selected'}
                    </span>
                    {currentTrack && (
                      <>
                        <span className="mx-1 text-white/80">•</span>
                        <span className="text-white/80">
                          {currentTrack.artist}
                        </span>
                      </>
                    )}
                  </div>
                )}
                {!isSpotifyTrack && (
                  <div className="w-full flex items-center gap-2">
                    <span className="text-xs text-white/80 w-10 text-right">
                      {formatTime(currentTime)}
                    </span>
                    <Slider
                      value={[currentTime]}
                      max={duration || 100}
                      step={1}
                      onValueChange={handleSeekChange}
                      className="w-full"
                    />
                    <span className="text-xs text-white/80 w-10">
                      {formatTime(duration)}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            {!isSpotifyTrack && (
              <div className="flex items-center gap-2">
                <button 
                  className="btn-icon" 
                  onClick={toggleMute} 
                  aria-label={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? <VolumeX size={20} className="text-white" /> : <Volume2 size={20} className="text-white" />}
                </button>
                
                <div className="hidden md:block w-28">
                  <Slider
                    value={[isMuted ? 0 : volume]}
                    max={100}
                    step={1}
                    onValueChange={handleVolumeChange}
                    className="w-full"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MusicPlayer;
