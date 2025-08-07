import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Music, ExternalLink } from 'lucide-react';
import './MusicPlayer.css';
import MusicVisualizer from './MusicVisualizer';

function MusicPlayer({ artist, onChangeArtist }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [playerReady, setPlayerReady] = useState(false);
  const [apiReady, setApiReady] = useState(false);
  const [volume, setVolume] = useState(50); // Default volume 50%
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playerState, setPlayerState] = useState(null);
  const [userInteracted, setUserInteracted] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState('');
  const playerRef = useRef(null);
  const timeUpdateInterval = useRef(null);
  const playerInitialized = useRef(false);
  const currentVideoId = useRef(null);

  const currentSong = artist.songs[currentSongIndex];

  // Define handleNextSong with useCallback to avoid recreation
  const handleNextSong = useCallback(() => {
    const nextIndex = (currentSongIndex + 1) % artist.songs.length;
    setCurrentSongIndex(nextIndex);
    setCurrentTime(0);
  }, [currentSongIndex, artist.songs.length]);

  const handlePreviousSong = useCallback(() => {
    const prevIndex = currentSongIndex === 0 ? artist.songs.length - 1 : currentSongIndex - 1;
    setCurrentSongIndex(prevIndex);
    setCurrentTime(0);
  }, [currentSongIndex, artist.songs.length]);

  // Handle user interaction to enable autoplay
  const handleUserInteraction = useCallback(() => {
    if (!userInteracted) {
      setUserInteracted(true);
      // Try to start playing if player is ready
      if (playerReady && playerRef.current) {
        try {
          setIsPlaying(true);
          playerRef.current.playVideo();
        } catch (error) {
          console.error('Error starting playback:', error);
        }
      }
    }
  }, [userInteracted, playerReady]);

  // Update background when song changes
  useEffect(() => {
    if (currentSong && currentSong.thumbnail) {
      setBackgroundImage(currentSong.thumbnail);
    }
  }, [currentSong]);

  // Load YouTube IFrame API
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    // Set up the API ready callback
    window.onYouTubeIframeAPIReady = () => {
      setApiReady(true);
    };

    // Cleanup function
    return () => {
      if (window.onYouTubeIframeAPIReady) {
        window.onYouTubeIframeAPIReady = null;
      }
    };
  }, []);

  // Initialize player when API is ready
  useEffect(() => {
    if (!apiReady || !currentSong) return;

    // Only initialize if we don't have a player or if the video ID changed
    if (!playerRef.current || currentVideoId.current !== currentSong.youtubeId) {
      try {
        // Destroy existing player if it exists
        if (playerRef.current) {
          playerRef.current.destroy();
        }

        new window.YT.Player('youtube-player', {
          height: '0',
          width: '0',
          videoId: currentSong.youtubeId,
          playerVars: {
            autoplay: 1, // Try to autoplay
            controls: 0,
            disablekb: 1,
            enablejsapi: 1,
            fs: 0,
            iv_load_policy: 3,
            modestbranding: 1,
            rel: 0,
            showinfo: 0
          },
          events: {
            onReady: (event) => {
              playerRef.current = event.target;
              currentVideoId.current = currentSong.youtubeId;
              setPlayerReady(true);
              playerInitialized.current = true;
              // Set initial volume
              event.target.setVolume(volume);
              // Try to start playing immediately
              setIsPlaying(true);
              try {
                event.target.playVideo();
              } catch (error) {
                console.log('Autoplay blocked, waiting for user interaction');
              }
            },
            onStateChange: (event) => {
              // Handle player state changes
              setPlayerState(event.data);
              
              if (event.data === window.YT.PlayerState.ENDED) {
                // Auto-play next song when current one ends
                handleNextSong();
              } else if (event.data === window.YT.PlayerState.PLAYING) {
                setIsPlaying(true);
              } else if (event.data === window.YT.PlayerState.PAUSED) {
                setIsPlaying(false);
              } else if (event.data === window.YT.PlayerState.BUFFERING) {
                // Keep current state during buffering
              }
            },
            onError: (event) => {
              console.error('YouTube player error:', event.data);
              // Try to play next song if there's an error
              handleNextSong();
            }
          }
        });
      } catch (error) {
        console.error('Error initializing YouTube player:', error);
      }
    }
  }, [apiReady, currentSong, handleNextSong, volume]);

  // Handle song changes
  useEffect(() => {
    if (playerReady && playerRef.current && currentSong && currentVideoId.current !== currentSong.youtubeId) {
      try {
        playerRef.current.loadVideoById(currentSong.youtubeId);
        currentVideoId.current = currentSong.youtubeId;
        // Always start playing when changing songs
        setIsPlaying(true);
        playerRef.current.playVideo();
        setCurrentTime(0);
      } catch (error) {
        console.error('Error loading video:', error);
      }
    }
  }, [currentSongIndex, playerReady, currentSong]);

  // Handle play/pause - Fixed to maintain position
  useEffect(() => {
    if (playerReady && playerRef.current) {
      try {
        if (isPlaying) {
          // Only play if not already playing
          if (playerState !== window.YT.PlayerState.PLAYING) {
            playerRef.current.playVideo();
          }
        } else {
          // Only pause if not already paused
          if (playerState !== window.YT.PlayerState.PAUSED) {
            playerRef.current.pauseVideo();
          }
        }
      } catch (error) {
        console.error('Error controlling player:', error);
      }
    }
  }, [isPlaying, playerReady, playerState]);

  // Handle volume changes
  useEffect(() => {
    if (playerReady && playerRef.current) {
      try {
        playerRef.current.setVolume(volume);
      } catch (error) {
        console.error('Error setting volume:', error);
      }
    }
  }, [volume, playerReady]);

  // Update current time and duration
  useEffect(() => {
    if (playerReady && playerRef.current) {
      timeUpdateInterval.current = setInterval(() => {
        try {
          const currentTime = playerRef.current.getCurrentTime();
          const duration = playerRef.current.getDuration();
          setCurrentTime(currentTime);
          setDuration(duration);
        } catch (error) {
          console.error('Error getting time:', error);
        }
      }, 1000);
    } else {
      if (timeUpdateInterval.current) {
        clearInterval(timeUpdateInterval.current);
      }
    }

    return () => {
      if (timeUpdateInterval.current) {
        clearInterval(timeUpdateInterval.current);
      }
    };
  }, [playerReady]);

  const handlePlayPause = () => {
    // Mark user interaction
    handleUserInteraction();
    // Toggle play/pause state
    setIsPlaying(!isPlaying);
  };

  const handleSongClick = (index) => {
    // Mark user interaction
    handleUserInteraction();
    setCurrentSongIndex(index);
    setIsPlaying(true);
    setCurrentTime(0);
  };

  const handleOpenYouTube = () => {
    if (currentSong && currentSong.url) {
      window.open(currentSong.url, '_blank');
    }
  };

  const handleVolumeChange = (e) => {
    // Mark user interaction
    handleUserInteraction();
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
  };

  const handleVolumeToggle = () => {
    // Mark user interaction
    handleUserInteraction();
    setShowVolumeSlider(!showVolumeSlider);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Show loading state if API is not ready
  if (!apiReady) {
    return (
      <div className="music-player">
        <div className="container">
          <div className="player-header">
            <h1 className="title">🎵 Mezwed Radio</h1>
            <p className="subtitle">Loading YouTube Player...</p>
          </div>
          <div className="loading-state">
            <p>Initializing player...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="music-player" onClick={handleUserInteraction}>
      {/* Dynamic Background */}
      {backgroundImage && (
        <div 
          className="dynamic-background"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        />
      )}
      
      <div className="container">
        <div className="player-header">
          <h1 className="title">🎵 Mezwed Radio</h1>
          <p className="subtitle">Now Playing: {artist.name}</p>
          {!userInteracted && (
            <p className="autoplay-notice">Click anywhere to start playing!</p>
          )}
        </div>

        <div className="player-content">
          <div className="artist-info">
            <div className="artist-image">
              <img src={artist.image} alt={artist.name} />
            </div>
            <div className="artist-details">
              <h2>{artist.name}</h2>
              <p>{artist.description}</p>
            </div>
          </div>

          <div className="song-info">
            <div className="song-title">
              <Music size={20} />
              <span>{currentSong.title}</span>
              <button 
                className="youtube-link-btn" 
                onClick={handleOpenYouTube}
                title="Open in YouTube"
              >
                <ExternalLink size={16} />
              </button>
            </div>
            <div className="song-meta">
              <span className="channel-title">{currentSong.channelTitle}</span>
              <span className="published-date">
                {new Date(currentSong.publishedAt).toLocaleDateString()}
              </span>
            </div>
            {/* Progress Bar */}
            <div className="progress-container">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                ></div>
              </div>
              <div className="time-display">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
          </div>

          <div className="player-controls">
            <button className="control-btn" onClick={handlePreviousSong}>
              <SkipBack size={24} />
            </button>
            
            <button className="play-btn" onClick={handlePlayPause}>
              {isPlaying ? <Pause size={32} /> : <Play size={32} />}
            </button>
            
            <button className="control-btn" onClick={handleNextSong}>
              <SkipForward size={24} />
            </button>

            {/* Volume Control */}
            <div className="volume-control">
              <button 
                className="volume-btn" 
                onClick={handleVolumeToggle}
                title="Volume"
              >
                <Volume2 size={20} />
              </button>
              {showVolumeSlider && (
                <div className="volume-slider-container">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="volume-slider"
                    title={`Volume: ${volume}%`}
                  />
                  <span className="volume-value">{volume}%</span>
                </div>
              )}
            </div>
          </div>

          <div className="playlist">
            <h3>Playlist</h3>
            <div className="song-list">
              {artist.songs.map((song, index) => (
                <div 
                  key={index}
                  className={`song-item ${index === currentSongIndex ? 'active' : ''}`}
                  onClick={() => handleSongClick(index)}
                >
                  <div className="song-thumbnail">
                    <img src={song.thumbnail} alt={song.title} />
                    {index === currentSongIndex && isPlaying && (
                      <div className="playing-overlay">▶</div>
                    )}
                  </div>
                  <div className="song-details">
                    <span className="song-name">{song.title}</span>
                    <span className="song-channel">{song.channelTitle}</span>
                  </div>
                  <button 
                    className="youtube-link-btn-small"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(song.url, '_blank');
                    }}
                    title="Open in YouTube"
                  >
                    <ExternalLink size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="player-actions">
            <button className="btn btn-secondary" onClick={onChangeArtist}>
              Change Artist
            </button>
          </div>
        </div>

        {/* Hidden YouTube player */}
        <div id="youtube-player" style={{ display: 'none' }}></div>
      </div>

      {/* Full-width visualizer at bottom */}
      <div className="bottom-visualizer">
        <MusicVisualizer isPlaying={isPlaying} />
      </div>
    </div>
  );
}

export default MusicPlayer;
