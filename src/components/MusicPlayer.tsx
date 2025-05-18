
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';
import { songsData } from '@/data/musicData';
import { toast } from "sonner";

const MusicPlayer: React.FC = () => {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Get current track from songs data
  const currentTrack = songsData[currentTrackIndex];

  useEffect(() => {
    // Check localStorage for previously selected song
    const storedSongIndex = localStorage.getItem('current_song_index');
    if (storedSongIndex) {
      const parsedIndex = parseInt(storedSongIndex, 10);
      if (!isNaN(parsedIndex) && parsedIndex >= 0 && parsedIndex < songsData.length) {
        setCurrentTrackIndex(parsedIndex);
      }
    }

    // Create audio element
    const audio = new Audio();
    audioRef.current = audio;
    
    // Setup event listeners
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleTrackEnded);
    audio.addEventListener('error', handleAudioError);
    
    // Listen for custom event to play a specific song
    window.addEventListener('play-song', handlePlaySongEvent);
    
    // Cleanup function
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeEventListener('timeupdate', handleTimeUpdate);
        audioRef.current.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audioRef.current.removeEventListener('ended', handleTrackEnded);
        audioRef.current.removeEventListener('error', handleAudioError);
      }
      window.removeEventListener('play-song', handlePlaySongEvent);
    };
  }, []);
  
  // Update audio source when currentTrackIndex changes
  useEffect(() => {
    if (audioRef.current && currentTrack) {
      // Save track to localStorage
      localStorage.setItem('current_song_index', currentTrackIndex.toString());
      
      // Check if audio is already playing
      const wasPlaying = !audioRef.current.paused;
      
      // Update source
      audioRef.current.src = currentTrack.url;
      audioRef.current.load();
      
      // Set volume
      audioRef.current.volume = isMuted ? 0 : volume / 100;
      
      // Play if it was already playing
      if (wasPlaying) {
        playTrack();
      }
    }
  }, [currentTrackIndex, currentTrack]);
  
  // Handle custom play-song event
  const handlePlaySongEvent = (event: Event) => {
    const customEvent = event as CustomEvent;
    if (customEvent.detail && typeof customEvent.detail.songIndex === 'number') {
      setCurrentTrackIndex(customEvent.detail.songIndex);
      setTimeout(playTrack, 100);
    }
  };
  
  // Play current track
  const playTrack = () => {
    if (audioRef.current) {
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch(error => {
          console.error("Error playing audio:", error);
          toast.error("Couldn't play audio. Please try another track.");
          setIsPlaying(false);
        });
    }
  };
  
  // Handle audio errors
  const handleAudioError = (e: ErrorEvent) => {
    console.error("Audio error:", e);
    toast.error("There was a problem playing this track. Please try another one.");
    setIsPlaying(false);
  };
  
  // Handle time update event
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };
  
  // Handle loaded metadata event
  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };
  
  // Handle track ended event
  const handleTrackEnded = () => {
    nextTrack();
  };
  
  // Format time in minutes:seconds
  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  
  // Toggle play/pause
  const togglePlay = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      playTrack();
    }
  };
  
  // Next track
  const nextTrack = () => {
    const newIndex = (currentTrackIndex + 1) % songsData.length;
    setCurrentTrackIndex(newIndex);
  };
  
  // Previous track
  const previousTrack = () => {
    const newIndex = (currentTrackIndex - 1 + songsData.length) % songsData.length;
    setCurrentTrackIndex(newIndex);
  };
  
  // Handle volume change
  const handleVolumeChange = (value: number[]) => {
    if (!audioRef.current) return;
    
    const newVolume = value[0];
    setVolume(newVolume);
    audioRef.current.volume = isMuted ? 0 : newVolume / 100;
    
    if (isMuted && newVolume > 0) {
      setIsMuted(false);
    }
  };
  
  // Handle seek change
  const handleSeekChange = (value: number[]) => {
    if (!audioRef.current) return;
    
    const seekTime = value[0];
    audioRef.current.currentTime = seekTime;
    setCurrentTime(seekTime);
  };
  
  // Toggle mute
  const toggleMute = () => {
    if (!audioRef.current) return;
    
    const newMuteState = !isMuted;
    setIsMuted(newMuteState);
    audioRef.current.volume = newMuteState ? 0 : volume / 100;
  };

  return (
    <div className="music-player bg-gray-800 text-white py-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-4">
          {/* Music controls */}
          <button 
            className="btn-icon" 
            aria-label="Previous song"
            onClick={previousTrack}
          >
            <SkipBack size={20} />
          </button>
          
          <button 
            className="btn-icon p-3 bg-green-500 rounded-full" 
            onClick={togglePlay} 
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
          </button>
          
          <button 
            className="btn-icon" 
            aria-label="Next song"
            onClick={nextTrack}
          >
            <SkipForward size={20} />
          </button>
        </div>
        
        <div className="hidden md:block flex-1 px-8">
          <div className="flex flex-col items-center">
            <div className="text-center mb-1">
              <span className="font-medium">
                {currentTrack ? currentTrack.title : 'No track selected'}
              </span>
              {currentTrack && (
                <>
                  <span className="mx-1 text-gray-300">•</span>
                  <span className="text-gray-300">
                    {currentTrack.artist}
                  </span>
                </>
              )}
            </div>
            <div className="w-full flex items-center gap-2">
              <span className="text-xs text-gray-400 w-10 text-right">
                {formatTime(currentTime)}
              </span>
              <Slider
                value={[currentTime]}
                max={duration || 100}
                step={1}
                onValueChange={handleSeekChange}
                className="w-full"
              />
              <span className="text-xs text-gray-400 w-10">
                {formatTime(duration)}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            className="btn-icon" 
            onClick={toggleMute} 
            aria-label={isMuted ? "Unmute" : "Mute"}
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
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusicPlayer;
