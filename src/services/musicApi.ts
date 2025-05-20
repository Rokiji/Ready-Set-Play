
// Music API service using the Jamendo API (free music platform with open API)
const JAMENDO_CLIENT_ID = '2c53c27c'; // Updated to a working client ID

export interface Track {
  id: string;
  name: string;
  artist_name: string;
  album_name: string;
  duration: number; // in seconds
  audio: string; // stream URL
  image: string; // album art
  genre?: string;
}

export interface ApiResponse {
  results: Track[];
  headers: {
    'X-Total-Count': string;
    'X-RateLimit-Limit': string;
    'X-RateLimit-Remaining': string;
  };
}

export const fetchTracks = async (limit: number = 20, offset: number = 0): Promise<Track[]> => {
  try {
    const response = await fetch(
      `https://api.jamendo.com/v3.0/tracks/?client_id=${JAMENDO_CLIENT_ID}&format=json&limit=${limit}&offset=${offset}&audioformat=mp32&include=musicinfo&boost=popularity_total`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch music tracks');
    }

    const data = await response.json();
    
    // Check if the response contains results
    if (data.headers?.status === 'failed') {
      console.error('API Error:', data.headers.error_message);
      return [];
    }
    
    // Map Jamendo response to our Track interface
    return data.results.map((track: any) => ({
      id: track.id,
      name: track.name,
      artist_name: track.artist_name,
      album_name: track.album_name,
      duration: parseInt(track.duration),
      audio: track.audio,
      image: track.album_image,
      genre: track.musicinfo?.tags?.genres?.join(', ') || 'Unknown'
    }));
  } catch (error) {
    console.error('Error fetching music tracks:', error);
    return [];
  }
};

export const searchTracks = async (query: string, limit: number = 20): Promise<Track[]> => {
  try {
    const response = await fetch(
      `https://api.jamendo.com/v3.0/tracks/?client_id=${JAMENDO_CLIENT_ID}&format=json&limit=${limit}&namesearch=${encodeURIComponent(query)}&audioformat=mp32&include=musicinfo`
    );
    
    if (!response.ok) {
      throw new Error('Failed to search music tracks');
    }

    const data = await response.json();
    
    // Check if the response contains results
    if (data.headers?.status === 'failed') {
      console.error('API Error:', data.headers.error_message);
      return [];
    }
    
    return data.results.map((track: any) => ({
      id: track.id,
      name: track.name,
      artist_name: track.artist_name,
      album_name: track.album_name,
      duration: parseInt(track.duration),
      audio: track.audio,
      image: track.album_image,
      genre: track.musicinfo?.tags?.genres?.join(', ') || 'Unknown'
    }));
  } catch (error) {
    console.error('Error searching music tracks:', error);
    return [];
  }
};

export const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
};
