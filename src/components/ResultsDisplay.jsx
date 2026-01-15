import './ResultsDisplay.css';
import { useState, useEffect, useRef } from 'react';

function ResultsDisplay({ results, query, isLoading, resultsLimit = 20 }) {
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [videoTimestamp, setVideoTimestamp] = useState(0);
  const [copiedIndex, setCopiedIndex] = useState(null);

  if (isLoading) {
    return (
      <div className="results-loading">
        <div className="spinner"></div>
        <p>Buscando...</p>
      </div>
    );
  }

  if (!results || results.length === 0) {
    return query ? (
      <div className="results-empty">
        <p>No se encontraron resultados para "{query}"</p>
      </div>
    ) : null;
  }

  const displayedResults = results.slice(0, resultsLimit);

  const handlePlayVideo = (videoName, timestamp) => {
    // Subtract 2 seconds from timestamp, but don't go below 0
    const startTime = Math.max(0, timestamp - 2);
    setVideoTimestamp(startTime);
    setSelectedVideo(videoName);
  };

  const handleCloseVideo = () => {
    setSelectedVideo(null);
    setVideoTimestamp(0);
  };

  const handleCopyInfo = async (result, index) => {
    const videoName = result.metadata?.video_name || 'Video desconocido';
    const timestamp = result.metadata?.timestamp !== undefined 
      ? formatTimestamp(result.metadata.timestamp) 
      : 'Sin timestamp';
    const searchQuery = query || 'Sin búsqueda';
    
    const textToCopy = `Video: ${videoName}\nTimestamp: ${timestamp}\nBúsqueda: ${searchQuery}`;
    
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="results-display">
      {selectedVideo && (
        <VideoPlayer 
          videoName={selectedVideo}
          timestamp={videoTimestamp}
          onClose={handleCloseVideo}
        />
      )}

      <div className="results-header">
        <h2>Resultados de Búsqueda{query && ` para "${query}"`}</h2>
        <p className="results-count">
          Mostrando {displayedResults.length} de {results.length} resultados
        </p>
      </div>

      <div className="results-grid">
        {displayedResults.map((result, index) => {
          // Debug logging
          if (result.result_type === 'object') {
            console.log('Object result:', {
              index,
              hasUrl: !!result.url,
              hasFrameUrl: !!result.frame_url,
              hasBbox: !!result.metadata?.bbox,
              bbox: result.metadata?.bbox,
              frame_url: result.frame_url,
              url: result.url
            });
          }
          
          return (
          <div key={index} className="result-card">
            <div className="result-image-container">
              {result.url ? (
                result.result_type === 'object' && result.metadata?.bbox && result.frame_url ? (
                  <ImageWithBbox
                    src={result.frame_url}
                    alt={result.metadata?.video_id || 'Video frame'}
                    bbox={result.metadata.bbox}
                    className="result-image"
                  />
                ) : (
                  <img 
                    src={result.url} 
                    alt={result.metadata?.video_id || 'Video frame'} 
                    className="result-image"
                    loading="lazy"
                  />
                )
              ) : (
                <div className="result-image-placeholder">
                  🎬
                </div>
              )}
              <div className="result-score">
                {(result.similarity * 100).toFixed(1)}% coincidencia
              </div>
            </div>

            <div className="result-info">
              <h3 className="result-title">
                {result.metadata?.video_name || result.path?.split('/').pop() || 'Untitled'}
              </h3>
              
              {result.path && (
                <p className="result-detail result-path">
                  📁 {result.path.split('/').pop()}
                </p>
              )}

              {result.result_type && (
                <p className="result-type-badge">
                  {result.result_type === 'frame' 
                    ? `🎞️ Frame${result.metadata?.frame_index !== undefined ? ' ' + result.metadata.frame_index : ''}` 
                    : `🔍 Object${result.metadata?.object_index !== undefined ? ' ' + result.metadata.object_index : ''}`
                  }
                </p>
              )}
              
              {result.metadata?.timestamp !== undefined && result.metadata?.timestamp !== null && (
                <div className="result-timestamp-container">
                  <p className="result-timestamp">
                    ⏱️ {formatTimestamp(result.metadata.timestamp)}
                  </p>
                  <div className="result-actions">
                    {result.metadata?.video_name && (
                      <button 
                        className="play-video-button"
                        onClick={() => handlePlayVideo(result.metadata.video_name, result.metadata.timestamp)}
                        title="Reproducir video desde este momento (2 segundos antes)"
                      >
                        ▶️ Reproducir
                      </button>
                    )}
                    <button 
                      className={`copy-info-button ${copiedIndex === index ? 'copied' : ''}`}
                      onClick={() => handleCopyInfo(result, index)}
                      title="Copiar nombre del video, timestamp y búsqueda"
                    >
                      {copiedIndex === index ? '✓ Copiado!' : '📋 Copiar Info'}
                    </button>
                  </div>
                </div>
              )}

              {result.metadata?.objects && result.metadata.objects.length > 0 && (
                <div className="result-objects">
                  <strong>Objetos detectados:</strong>
                  <div className="object-tags">
                    {result.metadata.objects.slice(0, 5).map((obj, i) => (
                      <span key={i} className="object-tag">
                        {obj.class_name} ({(obj.confidence * 100).toFixed(0)}%)
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )})}
      </div>
    </div>
  );
}

function formatTimestamp(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Component to render image with bounding box overlay
function ImageWithBbox({ src, alt, bbox, className }) {
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  console.log('ImageWithBbox rendered:', { src: src?.substring(0, 100), bbox, imageLoaded });

  useEffect(() => {
    if (!imageLoaded || !bbox || !canvasRef.current || !imageRef.current) {
      return;
    }

    const canvas = canvasRef.current;
    const image = imageRef.current;
    const ctx = canvas.getContext('2d');

    // Set canvas size to match image display size
    canvas.width = image.offsetWidth;
    canvas.height = image.offsetHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Get the natural and display dimensions
    const scaleX = image.offsetWidth / image.naturalWidth;
    const scaleY = image.offsetHeight / image.naturalHeight;

    // Parse bbox - format from YOLO is [x1, y1, x2, y2] (top-left, bottom-right)
    let x1, y1, x2, y2;
    if (Array.isArray(bbox) && bbox.length === 4) {
      [x1, y1, x2, y2] = bbox;
    } else {
      return; // Invalid bbox format
    }

    // Calculate width and height
    const width = x2 - x1;
    const height = y2 - y1;

    // Scale bbox coordinates to match displayed image size
    const scaledX = x1 * scaleX;
    const scaledY = y1 * scaleY;
    const scaledWidth = width * scaleX;
    const scaledHeight = height * scaleY;

    // Draw bounding box
    ctx.strokeStyle = '#00ff00'; // Green color
    ctx.lineWidth = 3;
    ctx.strokeRect(scaledX, scaledY, scaledWidth, scaledHeight);

    // Draw semi-transparent background for label
    ctx.fillStyle = 'rgba(0, 255, 0, 0.7)';
    const labelText = 'Detected Object';
    ctx.font = '14px Arial';
    const textWidth = ctx.measureText(labelText).width;
    ctx.fillRect(scaledX, scaledY - 22, textWidth + 10, 22);

    // Draw label text
    ctx.fillStyle = '#000000';
    ctx.fillText(labelText, scaledX + 5, scaledY - 6);
  }, [imageLoaded, bbox]);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = (e) => {
    console.error('Image failed to load:', src, e);
    setImageError(true);
  };

  if (imageError) {
    return (
      <div className="result-image-placeholder">
        ⚠️ Error loading image
      </div>
    );
  }

  return (
    <div style={{ 
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%', 
      height: '100%' 
    }}>
      <img
        ref={imageRef}
        src={src}
        alt={alt}
        className={className}
        onLoad={handleImageLoad}
        onError={handleImageError}
        loading="lazy"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover'
        }}
      />
      {bbox && (
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
          }}
        />
      )}
    </div>
  );
}

function VideoPlayer({ videoName, timestamp, onClose }) {
  const videoUrl = `http://localhost:8000/api/videos/stream/${videoName}`;
  
  return (
    <div className="video-player-overlay" onClick={onClose}>
      <div className="video-player-container" onClick={(e) => e.stopPropagation()}>
        <div className="video-player-header">
          <h3>Reproduciendo: {videoName}</h3>
          <button className="close-video-button" onClick={onClose}>✕</button>
        </div>
        <video 
          controls 
          autoPlay
          className="video-player"
          src={`${videoUrl}#t=${timestamp}`}
        >
          Tu navegador no soporta la etiqueta de video.
        </video>
        <p className="video-timestamp-info">
          Iniciando en {formatTimestamp(timestamp)}
        </p>
      </div>
    </div>
  );
}

export default ResultsDisplay;
