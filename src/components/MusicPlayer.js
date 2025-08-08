import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Music, ExternalLink } from 'lucide-react';
import './MusicPlayer.css';
import MusicVisualizer from './MusicVisualizer';

function MusicPlayer({ artist, onChangeArtist }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [playerReady, setPlayerReady] = useState(false);
  const [apiReady, setApiReady] = useState(false);
  const [volume, setVolume] = useState(50);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playerState, setPlayerState] = useState(null);
  const [userInteracted, setUserInteracted] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const playerRef = useRef(null);
  const timeUpdateInterval = useRef(null);
  const bufferingWatchdog = useRef(null);
  const playerInitialized = useRef(false);
  const currentVideoId = useRef(null);

  const currentSong = artist.songs[currentSongIndex];

  const handleNextSong = useCallback(() => {
    const nextIndex = (currentSongIndex + 1) % artist.songs.length;
    setCurrentSongIndex(nextIndex);
    setCurrentTime(0);
    setIsLoading(true);
  }, [currentSongIndex, artist.songs.length]);

  const handlePreviousSong = useCallback(() => {
    const prevIndex = currentSongIndex === 0 ? artist.songs.length - 1 : currentSongIndex - 1;
    setCurrentSongIndex(prevIndex);
    setCurrentTime(0);
    setIsLoading(true);
  }, [currentSongIndex, artist.songs.length]);

  const handleUserInteraction = useCallback(() => {
    if (!userInteracted) {
      setUserInteracted(true);
    }
    if (playerReady && playerRef.current) {
      try {
        if (isMuted) {
          playerRef.current.unMute();
          playerRef.current.setVolume(volume);
          setIsMuted(false);
        }
        setIsPlaying(true);
        playerRef.current.playVideo();
      } catch {}
    }
  }, [userInteracted, playerReady, isMuted, volume]);

  useEffect(() => {
    if (currentSong?.thumbnail) {
      setBackgroundImage(currentSong.thumbnail);
    }
  }, [currentSong]);

  // Load YT API
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }
    window.onYouTubeIframeAPIReady = () => setApiReady(true);
    return () => { window.onYouTubeIframeAPIReady = null; };
  }, []);

  // Buffering watchdog: if stuck > 6s, retry once, then skip
  const startBufferingWatchdog = useCallback(() => {
    clearTimeout(bufferingWatchdog.current);
    bufferingWatchdog.current = setTimeout(() => {
      if (!playerRef.current) return;
      try {
        // Try a small seek to kick buffering
        const t = playerRef.current.getCurrentTime();
        playerRef.current.seekTo(Math.max(0, t - 0.25), true);
        playerRef.current.playVideo();
        // If still buffering after 4s, skip track
        clearTimeout(bufferingWatchdog.current);
        bufferingWatchdog.current = setTimeout(() => {
          if (playerState === window.YT?.PlayerState?.BUFFERING) {
            setIsLoading(false);
            handleNextSong();
          }
        }, 4000);
      } catch {
        handleNextSong();
      }
    }, 6000);
  }, [handleNextSong, playerState]);

  // Init player
  useEffect(() => {
    if (!apiReady || !currentSong) return;

    if (!playerRef.current || currentVideoId.current !== currentSong.youtubeId) {
      try {
        if (playerRef.current) playerRef.current.destroy();
        new window.YT.Player('youtube-player', {
          height: '0',
          width: '0',
          videoId: currentSong.youtubeId,
          playerVars: {
            autoplay: 1,
            controls: 0,
            disablekb: 1,
            enablejsapi: 1,
            fs: 0,
            iv_load_policy: 3,
            modestbranding: 1,
            rel: 0,
            playsinline: 1
          },
          events: {
            onReady: (event) => {
              playerRef.current = event.target;
              currentVideoId.current = currentSong.youtubeId;
              setPlayerReady(true);
              playerInitialized.current = true;
              setIsLoading(true);
              try { event.target.setPlaybackQuality('small'); } catch {}
              try { event.target.setVolume(volume); } catch {}
              try {
                if (!userInteracted) { event.target.mute(); setIsMuted(true); }
                setIsPlaying(true);
                event.target.playVideo();
                startBufferingWatchdog();
              } catch {
                setIsPlaying(false);
              }
            },
            onStateChange: (event) => {
              setPlayerState(event.data);
              if (event.data === window.YT.PlayerState.ENDED) {
                setIsLoading(false);
                handleNextSong();
              } else if (event.data === window.YT.PlayerState.PLAYING) {
                setIsPlaying(true);
                setIsLoading(false);
                clearTimeout(bufferingWatchdog.current);
              } else if (event.data === window.YT.PlayerState.PAUSED) {
                setIsPlaying(false);
                setIsLoading(false);
                clearTimeout(bufferingWatchdog.current);
              } else if (event.data === window.YT.PlayerState.BUFFERING) {
                setIsLoading(true);
                startBufferingWatchdog();
              }
            },
            onError: () => {
              setIsLoading(false);
              handleNextSong();
            }
          }
        });
      } catch (e) {
        console.error('YT init error', e);
      }
    }
  }, [apiReady, currentSong, handleNextSong, volume, userInteracted, startBufferingWatchdog]);

  // Song change
  useEffect(() => {
    if (playerReady && playerRef.current && currentSong && currentVideoId.current !== currentSong.youtubeId) {
      try {
        setIsLoading(true);
        playerRef.current.loadVideoById(currentSong.youtubeId);
        currentVideoId.current = currentSong.youtubeId;
        try { playerRef.current.setPlaybackQuality('small'); } catch {}
        if (!userInteracted) { playerRef.current.mute(); setIsMuted(true); }
        setIsPlaying(true);
        playerRef.current.playVideo();
        startBufferingWatchdog();
        setCurrentTime(0);
      } catch (error) {
        setIsLoading(false);
      }
    }
  }, [currentSongIndex, playerReady, currentSong, userInteracted, startBufferingWatchdog]);

  // Play/pause
  useEffect(() => {
    if (playerReady && playerRef.current) {
      try {
        if (isPlaying) {
          if (playerState !== window.YT.PlayerState.PLAYING) playerRef.current.playVideo();
        } else {
          if (playerState !== window.YT.PlayerState.PAUSED) playerRef.current.pauseVideo();
        }
      } catch {}
    }
  }, [isPlaying, playerReady, playerState]);

  // Volume
  useEffect(() => {
    if (playerReady && playerRef.current && !isMuted) {
      try { playerRef.current.setVolume(volume); } catch {}
    }
  }, [volume, playerReady, isMuted]);

  // Time updates
  useEffect(() => {
    if (playerReady && playerRef.current) {
      timeUpdateInterval.current = setInterval(() => {
        try {
          setCurrentTime(playerRef.current.getCurrentTime());
          setDuration(playerRef.current.getDuration());
        } catch {}
      }, 700);
    }
    return () => { if (timeUpdateInterval.current) clearInterval(timeUpdateInterval.current); };
  }, [playerReady]);

  const handlePlayPause = () => { handleUserInteraction(); setIsPlaying(!isPlaying); };
  const handleSongClick = (index) => { handleUserInteraction(); setCurrentSongIndex(index); setIsPlaying(true); setCurrentTime(0); };
  const handleOpenYouTube = () => { if (currentSong?.url) window.open(currentSong.url, '_blank'); };
  const handleVolumeChange = (e) => { handleUserInteraction(); const v = parseInt(e.target.value,10); setVolume(v); if (playerRef.current && !isMuted) playerRef.current.setVolume(v); };
  const handleVolumeToggle = () => { handleUserInteraction(); setShowVolumeSlider(!showVolumeSlider); };
  const handleUnmute = () => { if (playerRef.current) { try { playerRef.current.unMute(); playerRef.current.setVolume(volume); setIsMuted(false); setUserInteracted(true); setIsPlaying(true); playerRef.current.playVideo(); } catch {} } };

  const formatTime = (seconds) => { const m = Math.floor(seconds/60); const s = Math.floor(seconds%60); return `${m}:${s.toString().padStart(2,'0')}`; };

  if (!apiReady) {
    return (
      <div className="music-player">
        <div className="container">
          <div className="player-header">
            <h1 className="title">🎵 Mezwed Radio</h1>
            <p className="subtitle">Initializing player...</p>
            <div className="loading-pill"><span className="spinner" /> Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="music-player" onClick={handleUserInteraction}>
      {backgroundImage && (
        <div className="dynamic-background" style={{ backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }} />
      )}
      <div className="container">
        <div className="player-header">
          <h1 className="title">🎵 Mezwed Radio</h1>
          <p className="subtitle">Now Playing: {artist.name}</p>
          {isLoading && (<div className="loading-pill"><span className="spinner" /> Loading...</div>)}
          {!isLoading && isMuted && (<button className="autoplay-notice" onClick={handleUnmute}>Playing muted — Click to unmute</button>)}
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

        <div id="youtube-player" style={{ display: 'none' }}></div>
      </div>

      <div className="bottom-visualizer"><MusicVisualizer isPlaying={isPlaying} /></div>
    </div>
  );
}

export default MusicPlayer;
