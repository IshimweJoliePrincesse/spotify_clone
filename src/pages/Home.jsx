import React, { useState, useEffect } from "react";
import { songsAPI, playlistsAPI, preferencesAPI } from "../services/api";
import SongItem from "../components/SongItem";
import AlbumItem from "../components/AlbumItem";

const Home = () => {
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const [favoriteSongs, setFavoriteSongs] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [recentResponse, favoritesResponse, playlistsResponse] = await Promise.all([
          preferencesAPI.getRecentlyPlayed(),
          songsAPI.getAll({ favorite: true }),
          playlistsAPI.getUserPlaylists()
        ]);

        setRecentlyPlayed(recentResponse.data);
        setFavoriteSongs(favoritesResponse.data.songs);
        setPlaylists(playlistsResponse.data);
      } catch (error) {
        console.error("Error fetching home data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="text-white">Loading...</div>;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-white mb-4">Recently Played</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {recentlyPlayed.map((song) => (
          <SongItem key={song.id} song={song} />
        ))}
      </div>

      <h2 className="text-2xl font-bold text-white mb-4">Your Favorites</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {favoriteSongs.map((song) => (
          <SongItem key={song.id} song={song} />
        ))}
      </div>

      <h2 className="text-2xl font-bold text-white mb-4">Your Playlists</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {playlists.map((playlist) => (
          <div key={playlist.id} className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-white font-semibold">{playlist.name}</h3>
            <p className="text-gray-400">{playlist.songs?.length || 0} songs</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home; 