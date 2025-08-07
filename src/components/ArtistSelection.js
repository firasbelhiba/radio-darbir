import React, { useState } from 'react';
import './ArtistSelection.css';
import mezwedData from '../data/mezwed-data.json';

function ArtistSelection({ onArtistSelect }) {
  const [selectedArtist, setSelectedArtist] = useState(null);

  // Convert the JSON data to the format expected by the component
  const mezwedArtists = Object.values(mezwedData.artists).map(artist => ({
    id: artist.name, // Use name as ID for simplicity
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
  }));

  const handleArtistClick = (artist) => {
    setSelectedArtist(artist);
  };

  const handleConfirmSelection = () => {
    if (selectedArtist) {
      onArtistSelect(selectedArtist);
    }
  };

  return (
    <div className="artist-selection">
      <div className="container">
        <h1 className="title">🎵 Mezwed</h1>
        <p className="subtitle">Choose your favorite Tunisian Mezwed artist</p>
        
        <div className="artists-grid">
          {mezwedArtists.map((artist) => (
            <div
              key={artist.id}
              className={`artist-card ${selectedArtist?.id === artist.id ? 'selected' : ''}`}
              onClick={() => handleArtistClick(artist)}
            >
              <div className="artist-image">
                <img src={artist.image} alt={artist.name} />
              </div>
              <div className="artist-info">
                <h3>{artist.name}</h3>
                <p>{artist.description}</p>
                <div className="artist-stats">
                  <span>{artist.songs.length} songs available</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {selectedArtist && (
          <div className="selection-actions">
            <button className="btn" onClick={handleConfirmSelection}>
              Start Listening to {selectedArtist.name}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ArtistSelection;
