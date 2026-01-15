import { useState, useEffect } from 'react';
import './VideoFilter.css';

function VideoFilter({ selectedVideos, onChange }) {
  const [availableVideos, setAvailableVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [playingVideo, setPlayingVideo] = useState(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        // Use the lightweight /names endpoint with status filter
        const response = await fetch('http://localhost:8000/api/videos/names?status=completed');
        if (!response.ok) {
          throw new Error('Failed to fetch videos');
        }
        const data = await response.json();
        setAvailableVideos(data.video_names || []);
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to load videos:', err);
        setError(err.message);
        setIsLoading(false);
      }
    };

    fetchVideos();
  }, []);

  const handleToggleVideo = (videoName) => {
    if (selectedVideos.includes(videoName)) {
      onChange(selectedVideos.filter(v => v !== videoName));
    } else {
      onChange([...selectedVideos, videoName]);
    }
  };

  const handleSelectAll = () => {
    onChange(availableVideos);
  };

  const handleSelectNone = () => {
    onChange([]);
  };

  const handlePlayVideo = (videoName, event) => {
    event.preventDefault();
    event.stopPropagation();
    setPlayingVideo(videoName);
  };

  const handleCloseModal = () => {
    setPlayingVideo(null);
  };

  if (isLoading) {
    return <div className="video-filter">Cargando videos...</div>;
  }

  if (error) {
    return <div className="video-filter error">Error: {error}</div>;
  }

  if (availableVideos.length === 0) {
    return (
      <div className="video-filter">
        <p>No hay videos procesados disponibles para buscar.</p>
      </div>
    );
  }

  const allSelected = selectedVideos.length === availableVideos.length;
  const noneSelected = selectedVideos.length === 0;

  return (
    <div className="video-filter">
      <div className="filter-header" onClick={() => setIsExpanded(!isExpanded)}>
        <span className="filter-title">
          Filtrar por videos
        </span>
        <span className="filter-toggle">{isExpanded ? '▼' : '▶'}</span>
      </div>

      {isExpanded && (
        <div className="filter-content">
          <div className="filter-actions">
            <button
              onClick={handleSelectAll}
              disabled={allSelected}
              className="filter-action-btn"
            >
              Seleccionar todos
            </button>
            <button
              onClick={handleSelectNone}
              disabled={noneSelected}
              className="filter-action-btn"
            >
              Deseleccionar todos
            </button>
          </div>

          <div className="video-list">
            {availableVideos.map(videoName => (
              <div key={videoName} className="video-item">
                <label className="video-checkbox-label">
                  <input
                    type="checkbox"
                    checked={selectedVideos.includes(videoName)}
                    onChange={() => handleToggleVideo(videoName)}
                    className="video-checkbox"
                  />
                  <span className="video-name">{videoName}</span>
                </label>
                <button
                  onClick={(e) => handlePlayVideo(videoName, e)}
                  className="play-video-btn"
                  title="Reproducir video"
                >
                  ▶️
                </button>
              </div>
            ))}
          </div>

          {!noneSelected && (
            <div className="filter-summary">
              Buscando en {selectedVideos.length} de {availableVideos.length} videos
            </div>
          )}
        </div>
      )}

      {playingVideo && (
        <div className="video-modal" onClick={handleCloseModal}>
          <div className="video-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="video-modal-close" onClick={handleCloseModal}>
              ✕
            </button>
            <h3 className="video-modal-title">{playingVideo}</h3>
            <video
              controls
              autoPlay
              key={playingVideo}
              className="video-player"
              src={`http://localhost:8000/api/videos/stream/${encodeURIComponent(playingVideo)}?t=${Date.now()}`}
            >
              Tu navegador no soporta el elemento de video.
            </video>
          </div>
        </div>
      )}
    </div>
  );
}

export default VideoFilter;
