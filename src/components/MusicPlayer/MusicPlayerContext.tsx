
import React, { createContext, useState, useEffect, useRef, useContext } from 'react';
import { songsData } from '@/data/musicData';
import { toast } from "sonner";
import { formatDuration } from '@/services/musicApi';
import type { Track } from '@/services/musicApi';

interface MusicPlayerContextProps {
  currentTrackIndex: number;
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  currentTime: number;
  duration: number;
  apiTrack: Track | null;
  musicSource: 'local' | 'api';
  audioReady: boolean;
  audioRef: React.RefObject<HTMLAudioElement>;
  currentTrack: any;
  togglePlay: () => void;
  nextTrack: () => void;
  previousTrack: () => void;
  handleVolumeChange: (value: number[]) => void;
  handleSeekChange: (value: number[]) => void;
  toggleMute: () => void;
  getCurrentTrackInfo: () => {
    title: string;
    artist: string;
    image: string;
  };
}

const MusicPlayerContext = createContext<MusicPlayerContextProps | undefined>(undefined);

export const MusicPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [apiTrack, setApiTrack] = useState<Track | null>(null);
  const [musicSource, setMusicSource] = useState<'local' | 'api'>('local');
  const [audioReady, setAudioReady] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Get current track from songs data (for local tracks)
  const currentTrack = songsData[currentTrackIndex];

  useEffect(() => {
    // Check localStorage for previously selected track source
    const storedSource = localStorage.getItem('music_source');
    if (storedSource === 'api') {
      const storedTrack = localStorage.getItem('api_track');
      if (storedTrack) {
        try {
          setApiTrack(JSON.parse(storedTrack));
          setMusicSource('api');
        } catch (e) {
          console.error('Failed to parse stored API track', e);
        }
      }
    } else {
      // Check localStorage for previously selected song index
      const storedSongIndex = localStorage.getItem('current_song_index');
      if (storedSongIndex) {
        const parsedIndex = parseInt(storedSongIndex, 10);
        if (!isNaN(parsedIndex) && parsedIndex >= 0 && parsedIndex < songsData.length) {
          setCurrentTrackIndex(parsedIndex);
          setMusicSource('local');
        }
      }
    }

    // Create audio element
    const audio = new Audio();
    audioRef.current = audio;
    
    // Setup event listeners for audio
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('canplaythrough', handleCanPlayThrough);
    audio.addEventListener('ended', handleTrackEnded);
    audio.addEventListener('error', handleAudioError);
    
    // Listen for custom events to play songs
    window.addEventListener('play-song', handlePlaySongEvent);
    window.addEventListener('play-api-track', handlePlayApiTrackEvent);
    
    // Cleanup function
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeEventListener('timeupdate', handleTimeUpdate);
        audioRef.current.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audioRef.current.removeEventListener('canplaythrough', handleCanPlayThrough);
        audioRef.current.removeEventListener('ended', handleTrackEnded);
        audioRef.current.removeEventListener('error', handleAudioError);
      }
      window.removeEventListener('play-song', handlePlaySongEvent);
      window.removeEventListener('play-api-track', handlePlayApiTrackEvent);
    };
  }, []);
  
  // Update audio source when track changes
  useEffect(() => {
    if (musicSource === 'api' && apiTrack) {
      updateAudioSource(apiTrack.audio);
    } else if (musicSource === 'local' && currentTrack) {
      updateAudioSource(currentTrack.url);
    }
  }, [musicSource, apiTrack, currentTrackIndex, currentTrack]);
  
  const updateAudioSource = (src: string) => {
    if (!audioRef.current) return;
    
    // Reset audio ready state
    setAudioReady(false);
    
    const wasPlaying = !audioRef.current.paused;
    
    // Update source
    audioRef.current.src = src;
    audioRef.current.load();
    
    // Set volume
    audioRef.current.volume = isMuted ? 0 : volume / 100;
    
    // Play if it was already playing and it's not a fresh load
    if (wasPlaying) {
      setTimeout(() => {
        playTrack();
      }, 100);
    }
  };
  
  // Handle canplaythrough event for audio element
  const handleCanPlayThrough = () => {
    setAudioReady(true);
  };
  
  // Handle custom play-song event for local library
  const handlePlaySongEvent = (event: Event) => {
    const customEvent = event as CustomEvent;
    if (customEvent.detail && typeof customEvent.detail.songIndex === 'number') {
      setCurrentTrackIndex(customEvent.detail.songIndex);
      setMusicSource('local');
      setApiTrack(null);
      localStorage.setItem('music_source', 'local');
      localStorage.setItem('current_song_index', customEvent.detail.songIndex.toString());
      
      // Auto-play the selected song after a small delay to let source update
      setIsPlaying(true);
      setTimeout(() => {
        playTrack();
      }, 100);
    }
  };
  
  // Handle custom play-api-track event
  const handlePlayApiTrackEvent = (event: Event) => {
    const customEvent = event as CustomEvent;
    if (customEvent.detail && customEvent.detail.track) {
      setApiTrack(customEvent.detail.track);
      setMusicSource('api');
      localStorage.setItem('music_source', 'api');
      localStorage.setItem('api_track', JSON.stringify(customEvent.detail.track));
      
      // Auto-play the selected song after a small delay to let source update
      setIsPlaying(true);
      setTimeout(() => {
        playTrack();
      }, 100);
    }
  };
  
  // Play current track
  const playTrack = () => {
    if (!audioRef.current) return;
    
    if (!audioRef.current.src) {
      toast.error("No audio source available");
      setIsPlaying(false);
      return;
    }
    
    audioRef.current.play()
      .then(() => {
        setIsPlaying(true);
      })
      .catch(error => {
        console.error("Error playing audio:", error);
        toast.error("Couldn't play audio. Please try another track.");
        setIsPlaying(false);
      });
  };
  
  // Handle audio errors
  function handleAudioError(e: ErrorEvent) {
    console.error("Audio error:", e);
    toast.error("There was a problem playing this track. Please try another one.");
    setIsPlaying(false);
  }
  
  // Handle time update event
  function handleTimeUpdate() {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
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
    if (musicSource === 'local') {
      nextTrack();
    } else {
      setIsPlaying(false);
      setCurrentTime(0);
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
      }
    }
  }
  
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
  
  // Next track (only for local library)
  function nextTrack() {
    if (musicSource === 'api') return;
    
    const newIndex = (currentTrackIndex + 1) % songsData.length;
    setCurrentTrackIndex(newIndex);
    localStorage.setItem('current_song_index', newIndex.toString());
  }
  
  // Previous track (only for local library)
  function previousTrack() {
    if (musicSource === 'api') return;
    
    const newIndex = (currentTrackIndex - 1 + songsData.length) % songsData.length;
    setCurrentTrackIndex(newIndex);
    localStorage.setItem('current_song_index', newIndex.toString());
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
    if (!audioRef.current) return;
    
    const seekTime = value[0];
    audioRef.current.currentTime = seekTime;
    setCurrentTime(seekTime);
  }
  
  // Toggle mute
  function toggleMute() {
    if (!audioRef.current) return;
    
    const newMuteState = !isMuted;
    setIsMuted(newMuteState);
    audioRef.current.volume = newMuteState ? 0 : volume / 100;
  }

  // Get current track info based on source
  const getCurrentTrackInfo = () => {
    if (musicSource === 'api' && apiTrack) {
      return {
        title: apiTrack.name,
        artist: apiTrack.artist_name,
        image: apiTrack.image
      };
    } else if (musicSource === 'local' && currentTrack) {
      return {
        title: currentTrack.title,
        artist: currentTrack.artist,
        image: '' // Local tracks don't have images in our current setup
      };
    }
    
    return {
      title: 'No track selected',
      artist: '',
      image: ''
    };
  };

  const contextValue: MusicPlayerContextProps = {
    currentTrackIndex,
    isPlaying,
    volume,
    isMuted,
    currentTime,
    duration,
    apiTrack,
    musicSource,
    audioReady,
    audioRef,
    currentTrack,
    togglePlay,
    nextTrack,
    previousTrack,
    handleVolumeChange,
    handleSeekChange,
    toggleMute,
    getCurrentTrackInfo
  };

  return (
    <MusicPlayerContext.Provider value={contextValue}>
      {children}
    </MusicPlayerContext.Provider>
  );
};

export const useMusicPlayer = () => {
  const context = useContext(MusicPlayerContext);
  if (context === undefined) {
    throw new Error('useMusicPlayer must be used within a MusicPlayerProvider');
  }
  return context;
};
