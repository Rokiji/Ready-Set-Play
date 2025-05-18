
export interface Song {
  id: string;
  title: string;
  artist: string;
  duration: string;
  genre: string;
}

export const songsData: Song[] = [
  {
    id: "song1",
    title: "Gaming Beats",
    artist: "DJ Player",
    duration: "3:45",
    genre: "Electronic"
  },
  {
    id: "song2",
    title: "Epic Adventure",
    artist: "Game Soundtracks",
    duration: "4:20",
    genre: "Orchestral"
  },
  {
    id: "song3",
    title: "Focus Mode",
    artist: "Concentration Mix",
    duration: "5:10",
    genre: "Ambient"
  },
  {
    id: "song4",
    title: "Victory Celebration",
    artist: "Win Composers",
    duration: "2:55",
    genre: "Pop"
  },
  {
    id: "song5",
    title: "8-Bit Nostalgia",
    artist: "Retro Players",
    duration: "3:30",
    genre: "Chiptune"
  },
  {
    id: "song6",
    title: "Battle Ready",
    artist: "Gaming Warriors",
    duration: "4:15",
    genre: "Rock"
  }
];
