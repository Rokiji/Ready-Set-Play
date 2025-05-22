import React from 'react';
import Navbar from '@/components/Navbar';
import { spotifyPlaylistData, playlistTracks } from '@/data/musicData';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

const MusicPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="container mx-auto px-6 py-12 flex-grow">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-white">Music Library</h1>
          <p className="text-white">Find the perfect soundtrack for your gameplay</p>
        </div>
        <div className="mb-12">
          <div className="bg-card text-card-foreground rounded-xl shadow-lg overflow-hidden p-6 border border-violet-800/20">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-1/3 lg:w-1/4">
                <img
                  src={spotifyPlaylistData.imageUrl}
                  alt={spotifyPlaylistData.name}
                  className="w-full rounded-xl shadow-md border border-violet-800/30"
                />
              </div>
              <div className="md:w-2/3 lg:w-3/4">
                <h2 className="text-2xl font-bold mb-2 text-white">{spotifyPlaylistData.name}</h2>
                <p className="text-white/90 mb-6">{spotifyPlaylistData.description}</p>
                <div className="overflow-x-auto max-h-96 overflow-y-auto rounded-lg border border-violet-800/20 bg-violet-950/30">
                  <table className="w-full text-white/90">
                    <thead className="sticky top-0 bg-violet-900/80 z-10">
                      <tr>
                        <th className="py-3 px-4 text-left w-12">#</th>
                        <th className="py-3 px-4 text-left">Title</th>
                        <th className="py-3 px-4 text-left">Artist</th>
                        <th className="py-3 px-4 text-left">Duration</th>
                      </tr>
                    </thead>
                    <tbody>
                      {playlistTracks.map((track, idx) => (
                        <tr key={track.title + track.artist} className="border-b border-violet-800/20 hover:bg-violet-900/10">
                          <td className="py-3 px-4">{idx + 1}</td>
                          <td className="py-3 px-4 font-medium">{track.title}</td>
                          <td className="py-3 px-4">{track.artist}</td>
                          <td className="py-3 px-4">{track.duration}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-violet-900/30 rounded-xl p-8 border border-violet-800/30">
          <h2 className="text-2xl font-bold mb-4 text-center text-white">Create Your Perfect Playlist</h2>
          <p className="text-center text-white/90 mb-6">
            Want to add your own music? Upload your tracks to personalize your gaming experience.
          </p>
          <div className="flex justify-center">
            <Button className="bg-violet-600 hover:bg-violet-700 text-white">
              <Upload className="mr-2 h-4 w-4" /> Upload Your Music
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MusicPage;
