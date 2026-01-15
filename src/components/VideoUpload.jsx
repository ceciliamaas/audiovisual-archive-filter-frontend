import { useState } from 'react';
import './VideoUpload.css';

function VideoUpload({ onVideoProcessing, hasProcessingVideos = false }) {
  const [sourceType, setSourceType] = useState('upload'); // 'upload', 'youtube', 'drive'
  const [videoName, setVideoName] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [fps, setFps] = useState(1);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Sanitize video name to match backend naming convention
  const sanitizeVideoName = (name) => {
    // Replace spaces and special chars with underscores
    let safeName = name.replace(/ /g, '_');
    safeName = safeName.replace(/[^a-zA-Z0-9_-]/g, '');
    // Remove leading/trailing underscores
    safeName = safeName.replace(/^_+|_+$/g, '');
    // Convert to lowercase for consistency
    safeName = safeName.toLowerCase();
    return safeName;
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      // Auto-generate video name from filename
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
      setVideoName(nameWithoutExt);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Por favor seleccioná un archivo de video');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setSuccessMessage(null);

    const formData = new FormData();
    formData.append('file', selectedFile);
    
    // Generate expected video name from file (sanitized to match backend)
    const rawName = selectedFile.name.replace(/\.[^/.]+$/, '');
    const expectedVideoName = sanitizeVideoName(rawName);

    try {
      // Add to processing state immediately
      if (onVideoProcessing) {
        onVideoProcessing(expectedVideoName);
      }
      
      const response = await fetch('http://localhost:8000/api/videos/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Fallo la subida');
      }

      const data = await response.json();
      setSuccessMessage(`✅ ${data.message}`);
      setSelectedFile(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProcessUrl = async () => {
    if (!videoName.trim()) {
      setError('Por favor ingresá un nombre de video');
      return;
    }
    if (!sourceUrl.trim()) {
      setError('Por favor ingresá una URL de video');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setSuccessMessage(null);

    // Sanitize video name to match backend convention
    const sanitizedVideoName = sanitizeVideoName(videoName);

    try {
      // Add to processing state immediately
      if (onVideoProcessing) {
        onVideoProcessing(sanitizedVideoName);
      }
      
      const response = await fetch('http://localhost:8000/api/videos/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          video_name: sanitizedVideoName,
          source_type: sourceType,
          source_url: sourceUrl,
          fps: fps,
          force: false,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Fallo el procesamiento');
      }

      const data = await response.json();
      setSuccessMessage(`✅ ${data.message}`);
      setVideoName('');
      setSourceUrl('');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="video-upload-container">
      <h2>📹 Procesar nuevo video</h2>
      <p className="video-upload-description">
        Subí un video para extraer fotogramas, detectar objetos y generar descripciones de texto utilizando nuestro pipeline automatizado. Podés subir un archivo directamente o proporcionar un enlace de YouTube o Google Drive.
      </p>

      {hasProcessingVideos && (
        <div className="warning-message" style={{
          backgroundColor: '#fff3cd',
          border: '1px solid #ffc107',
          borderRadius: '4px',
          padding: '12px',
          marginBottom: '20px',
          color: '#856404'
        }}>
          ⚠️ Un video se está procesando actualmente. Por favor esperá a que se complete antes de procesar otro video.
        </div>
      )}

      <div className="source-type-selector">
        <button
          className={`source-button ${sourceType === 'upload' ? 'active' : ''}`}
          onClick={() => setSourceType('upload')}
          disabled={hasProcessingVideos}
        >
          📤 Subir Archivo
        </button>
        <button
          className={`source-button ${sourceType === 'youtube' ? 'active' : ''}`}
          onClick={() => setSourceType('youtube')}
          disabled={hasProcessingVideos}
        >
          ▶️ YouTube
        </button>
        <button
          className={`source-button ${sourceType === 'drive' ? 'active' : ''}`}
          onClick={() => setSourceType('drive')}
          disabled={hasProcessingVideos}
        >
          💾 Google Drive
        </button>
      </div>

      {sourceType === 'upload' ? (
        <div className="upload-section">
          <div className="file-input-wrapper">
            <input
              type="file"
              accept="video/*"
              onChange={handleFileSelect}
              id="video-file"
              disabled={isProcessing || hasProcessingVideos}
            />
            <label htmlFor="video-file" className="file-input-label">
              {selectedFile ? (
                <>
                  📹 {selectedFile.name}
                  <span className="file-size">
                    ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                  </span>
                </>
              ) : (
                '📁 Elegir Archivo de Video'
              )}
            </label>
          </div>

          {selectedFile && (
            <button
              className="process-button"
              onClick={handleUpload}
              disabled={isProcessing || hasProcessingVideos}
            >
              {isProcessing ? '⏳ Subiendo...' : '🚀 Subir y Procesar'}
            </button>
          )}
        </div>
      ) : (
        <div className="url-section">
          <div className="form-group">
            <label htmlFor="video-name">Nombre del Video:</label>
            <input
              type="text"
              id="video-name"
              value={videoName}
              onChange={(e) => setVideoName(e.target.value)}
              placeholder="mi_video"
              disabled={isProcessing || hasProcessingVideos}
            />
          </div>

          <div className="form-group">
            <label htmlFor="source-url">
              {sourceType === 'youtube' ? 'URL de YouTube:' : 'URL de Google Drive:'}
            </label>
            <input
              type="url"
              id="source-url"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              placeholder={
                sourceType === 'youtube'
                  ? 'https://youtube.com/watch?v=...'
                  : 'https://drive.google.com/file/d/...'
              }
              disabled={isProcessing || hasProcessingVideos}
            />
          </div>

          <div className="form-group">
            <label htmlFor="fps">Fotogramas por Segundo (FPS):</label>
            <input
              type="number"
              id="fps"
              value={fps}
              onChange={(e) => setFps(parseInt(e.target.value) || 1)}
              min="1"
              max="30"
              disabled={isProcessing || hasProcessingVideos}
            />
            <small>Cuántos fotogramas extraer por segundo (1-30)</small>
          </div>

          <button
            className="process-button"
            onClick={handleProcessUrl}
            disabled={isProcessing || hasProcessingVideos}
          >
            {isProcessing ? '⏳ Procesando...' : '🚀 Procesar Video'}
          </button>
        </div>
      )}

      {error && (
        <div className="message error-message">
          ⚠️ {error}
        </div>
      )}

      {successMessage && (
        <div className="message success-message">
          {successMessage}
        </div>
      )}

      <div className="pipeline-info">
        <h3>📋 Pasos del Pipeline:</h3>
        <ol>
          <li>📥 Descargar video (si es URL) o subir</li>
          <li>🎞️ Extraer fotogramas a FPS especificado</li>
          <li>🔍 Detectar objetos usando YOLO</li>
          <li>🧮 Calcular embeddings CLIP con timestamps</li>
          <li>☁️ Subir al almacenamiento en la nube</li>
        </ol>
      </div>
    </div>
  );
}

export default VideoUpload;
