import React, { useState, useEffect } from 'react';
import './App.css';
import ArtistSelection from './components/ArtistSelection';
import MusicPlayer from './components/MusicPlayer';
import mezwedData from './data/mezwed-data.json';

function App() {
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [isFirstVisit, setIsFirstVisit] = useState(true);

  // Helper function to get artist data by name
  const getArtistByName = (artistName) => {
    const artist = mezwedData.artists[artistName];
    if (!artist) return null;
    
    return {
      id: artist.name,
      name: artist.name,
      image: artist.image,
      description: artist.description,
      songs: artist.songs.map(song => ({
        title: song.title,
        url: song.url,
        youtubeId: song.youtubeId,
        thumbnail: song.thumbnail,
        channelTitle: song.channelTitle,
        publishedAt: song.publishedAt
      }))
    };
  };

  useEffect(() => {
    // Check if user has already selected an artist
    const savedArtistName = localStorage.getItem('selectedMezwedArtist');
    if (savedArtistName) {
      const artistData = getArtistByName(savedArtistName);
      if (artistData) {
        setSelectedArtist(artistData);
        setIsFirstVisit(false);
      } else {
        // If saved artist doesn't exist in JSON, clear localStorage
        localStorage.removeItem('selectedMezwedArtist');
      }
    }
  }, []);

  const handleArtistSelect = (artist) => {
    setSelectedArtist(artist);
    // Store only the artist name in localStorage
    localStorage.setItem('selectedMezwedArtist', artist.name);
    setIsFirstVisit(false);
  };

  const handleChangeArtist = () => {
    setSelectedArtist(null);
    setIsFirstVisit(true);
    localStorage.removeItem('selectedMezwedArtist');
  };

  return (
    <div className="App">
      {isFirstVisit ? (
        <ArtistSelection onArtistSelect={handleArtistSelect} />
      ) : (
        <MusicPlayer 
          artist={selectedArtist} 
          onChangeArtist={handleChangeArtist}
        />
      )}
    </div>
  );
}

export default App;
