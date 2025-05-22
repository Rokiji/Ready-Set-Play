import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Minus, Maximize2 } from 'lucide-react';
import { songsData } from '@/data/musicData'; // Ensure this contains playlists
import { toast } from "sonner";

// Create a static audio element outside of component to persist across renders and navigation
const audioElement = new Audio();
let isAudioPlaying = false;
let persistentCurrentTrackIndex = 0;
let lastPlayedPosition = 0;
let endCheckTimerId: number | null = null;
let lastProgressCheck = 0;
let errorCount = 0;

// Load previously selected song from localStorage if available
try {
  const storedIndex = localStorage.getItem('current_song_index');
  if (storedIndex) {
    const parsedIndex = parseInt(storedIndex, 10);
    if (!isNaN(parsedIndex) && parsedIndex >= 0 && parsedIndex < songsData.length) {
      persistentCurrentTrackIndex = parsedIndex;
      audioElement.src = songsData[parsedIndex].url;
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
  const [currentPlaylistIndex, setCurrentPlaylistIndex] = useState(0);
  const [playlists, setPlaylists] = useState(songsData); // Assuming songsData is an array of playlists
  const [hasMounted, setHasMounted] = useState(false);
  const [lastProgressTime, setLastProgressTime] = useState(0);
  const lastErrorTrackIndex = useRef<number | null>(null);
  
  const audioRef = useRef<HTMLAudioElement>(audioElement);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const songEndTimerRef = useRef<number | null>(null);
  
  // Get current track from the selected playlist
  const currentTrack = playlists[currentPlaylistIndex]?.songs[currentTrackIndex];

  // Setup a timer to check if the song has ended for Spotify tracks
  useEffect(() => {
    if (endCheckTimerId) {
      window.clearInterval(endCheckTimerId);
      endCheckTimerId = null;
    }
    
    if (isSpotifyTrack && isPlaying) {
      endCheckTimerId = window.setInterval(() => {
        const now = Date.now();
        const progressDiff = currentTime - lastProgressTime;
        
        if (progressDiff === 0 && currentTime > 0 && currentTime > duration - 10) {
          console.log('Spotify track appears to have ended, advancing to next track');
          nextTrack();
        }
        
        setLastProgressTime(currentTime);
      }, 5000);
    }
    
    return () => {
      if (endCheckTimerId) {
        window.clearInterval(endCheckTimerId);
        endCheckTimerId = null;
      }
    };
  }, [isSpotifyTrack, isPlaying, currentTime, lastProgressTime, duration]);

  useEffect(() => {
    setHasMounted(true);
    const audio = audioRef.current;
    
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleTrackEnded);
    audio.addEventListener('error', handleAudioError);
    
    window.addEventListener('play-song', handlePlaySongEvent);
    
    if (isAudioPlaying && !isSpotifyTrack) {
      setIsPlaying(true);
      if (audio.paused) {
        audio.currentTime = lastPlayedPosition;
        const playPromise = audio.play();
        
        if (playPromise !== undefined) {
          playPromise.catch(err => {
            console.error("Failed to resume audio:", err);
            const resumePlayback = () => {
              audio.play().catch(e => console.error("Still failed to play:", e));
              document.removeEventListener('click', resumePlayback);
            };
            document.addEventListener('click', resumePlayback, { once: true });
          });
        }
      }
    }
    
    return () => {
      if (audio) {
        lastPlayedPosition = audio.currentTime;
        isAudioPlaying = !audio.paused;
      }
      
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleTrackEnded);
      audio.removeEventListener('error', handleAudioError);
      window.removeEventListener('play-song', handlePlaySongEvent);
      
      if (songEndTimerRef.current) {
        window.clearInterval(songEndTimerRef.current);
      }
    };
  }, [isSpotifyTrack]);
  
  useEffect(() => {
    if (!currentTrack) return;
    
    console.log(`Switching to track ${currentTrackIndex}: ${currentTrack.title}`);
    
    errorCount = 0;
    
    localStorage.setItem('current_song_index', currentTrackIndex.toString());
    
    const isSpotify = currentTrack.url.includes('spotify');
    setIsSpotifyTrack(isSpotify);
    
    if (!isSpotify && audioRef.current) {
      const wasPlaying = isAudioPlaying || !audioRef.current.paused;
      
      audioRef.current.src = currentTrack.url;
      audioRef.current.load();
      
      audioRef.current.volume = isMuted ? 0 : volume / 100;
      
      if (wasPlaying) {
        playTrack();
      }
    } else {
      if (!isSpotifyTrack && isAudioPlaying) {
        audioRef.current.pause();
        isAudioPlaying = false;
      }
      
      if (isPlaying) {
        setTimeout(() => {
          console.log('Auto-playing Spotify track after track change');
          setIsPlaying(true);
          isAudioPlaying = true;
        }, 1000);
      }
    }
  }, [currentTrackIndex, currentTrack, currentPlaylistIndex]);
  
  const handlePlaySongEvent = (event: Event) => {
    const customEvent = event as CustomEvent;
    if (customEvent.detail && typeof customEvent.detail.songIndex === 'number') {
      setCurrentTrackIndex(customEvent.detail.songIndex);
      setIsPlaying(true);
      setTimeout(() => {
        playTrack();
      }, 100);
    }
  };
  
  let lastSpotifyTrackIndex: number | null = null;
  
  const playTrack = () => {
    if (isSpotifyTrack) {
      setIsPlaying(true);
      isAudioPlaying = true;
      if (iframeRef.current) {
        try {
          const spotifyFrame = iframeRef.current as any;
          if (spotifyFrame.contentDocument) {
            const playButton = spotifyFrame.contentDocument.querySelector('[data-testid="play-button"]');
            if (playButton) playButton.click();
          }
        } catch (error) {
          console.log('Cannot interact with Spotify iframe due to security restrictions');
        }
      }
      
      startSpotifyEndCheck();
      
      return;
    }
    
    if (audioRef.current) {
      const playPromise = audioRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            isAudioPlaying = true;
            errorCount = 0;
          })
          .catch(error => {
            console.error("Error playing audio:", error);
            errorCount++;
            
            if (errorCount < 3) {
              setTimeout(() => playTrack(), 1000);
            } else {
              toast.error("Couldn't play audio. Moving to next track.");
              setIsPlaying(false);
              isAudioPlaying = false;
              nextTrack();
            }
            
            const resumePlayback = () => {
              audioRef.current.play()
                .then(() => {
                  setIsPlaying(true);
                  isAudioPlaying = true;
                })
                .catch(e => console.error("Still failed to play:", e));
              document.removeEventListener('click', resumePlayback);
            };
            document.addEventListener('click', resumePlayback, { once: true });
          });
      }
    }
  };
  
  const startSpotifyEndCheck = () => {
    if (songEndTimerRef.current) {
      window.clearInterval(songEndTimerRef.current);
    }
    
    if (isSpotifyTrack && currentTrack) {
      console.log(`Setting up auto-advance for Spotify track: ${currentTrack.title}`);
      
      const durationParts = currentTrack.duration.split(':');
      const durationInSeconds = parseInt(durationParts[0]) * 60 + parseInt(durationParts[1]);
      
      if (!isNaN(durationInSeconds) && durationInSeconds > 0) {
        console.log(`Track duration: ${durationInSeconds} seconds, setting timer for auto-advance`);
        
        songEndTimerRef.current = window.setTimeout(() => {
          console.log('Spotify track timer ended, advancing to next track');
          nextTrack();
        }, (durationInSeconds + 1) * 1000);
      }
    }
  };
  
  function handleAudioError(e: ErrorEvent) {
    console.error("Audio error:", e);
    setIsPlaying(false);
    isAudioPlaying = false;
    
    nextTrack();
  }
  
  function handleTimeUpdate() {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      lastPlayedPosition = audioRef.current.currentTime;
      
      if (isSpotifyTrack) {
        lastProgressCheck = Date.now();
      }
    }
  }
  
  function handleLoadedMetadata() {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  }
  
  function handleTrackEnded() {
    console.log('Track ended event triggered, advancing to next track');
    nextTrack();
  }
  
  function formatTime(time: number) {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }
  
  const togglePlay = () => {
    if (isSpotifyTrack) {
      const newPlayingState = !isPlaying;
      setIsPlaying(newPlayingState);
      isAudioPlaying = newPlayingState;
      
      if (newPlayingState) {
        startSpotifyEndCheck();
      } else if (songEndTimerRef.current) {
        clearTimeout(songEndTimerRef.current);
        songEndTimerRef.current = null;
      }
      
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
  
  function nextTrack() {
    console.log('Moving to next track');
    
    if (songEndTimerRef.current) {
      clearTimeout(songEndTimerRef.current);
      songEndTimerRef.current = null;
    }
    
    const newIndex = (currentTrackIndex + 1) % playlists[currentPlaylistIndex].songs.length;
    setCurrentTrackIndex(newIndex);
    
    // This will trigger the useEffect that changes the song
  }
  
  function previousTrack() {
    if (songEndTimerRef.current) {
      clearTimeout(songEndTimerRef.current);
      songEndTimerRef.current = null;
    }
    
    const newIndex = (currentTrackIndex - 1 + playlists[currentPlaylistIndex].songs.length) % playlists[currentPlaylistIndex].songs.length;
    setCurrentTrackIndex(newIndex);
  }
  
  function handleVolumeChange(value: number[]) {
    if (!audioRef.current) return;
    
    const newVolume = value[0];
    setVolume(newVolume);
    audioRef.current.volume = isMuted ? 0 : newVolume / 100;
    
    if (isMuted && newVolume > 0) {
      setIsMuted(false);
    }
  }
  
  function handleSeekChange(value: number[]) {
    if (!audioRef.current || isSpotifyTrack) return;
    
    const seekTime = value[0];
    audioRef.current.currentTime = seekTime;
    setCurrentTime(seekTime);
    lastPlayedPosition = seekTime;
  }
  
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
            <div className="w-full mb-4 mt-5 flex items-center justify-between">
              <button 
                className="btn-icon mr-2" 
                aria-label="Previous song"
                onClick={previousTrack}
              >
                <SkipBack size={20} className="text-white" />
              </button>
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
              {!isSpotifyTrack && (
                <>
                  <button 
                    className="btn-icon" 
                    aria-label="Previous song"
                    onClick={previousTrack}
                  >
                    <SkipBack size={20} className="text-white" />
                  </button>
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
