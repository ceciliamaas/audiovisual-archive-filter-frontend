import { useState, useEffect } from 'react';
import './ImageUpload.css';

const MAX_HISTORY_ITEMS = 10;
const STORAGE_KEY = 'imageSearchHistory';

function ImageUpload({ onSearch, isLoading }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [imageHistory, setImageHistory] = useState([]);

  // Load image history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const history = JSON.parse(stored);
        setImageHistory(history);
      }
    } catch (error) {
      console.error('Error loading image history:', error);
    }
  }, []);

  // Save image to history
  const saveToHistory = (file, dataUrl) => {
    try {
      const newItem = {
        id: Date.now(),
        name: file.name,
        dataUrl: dataUrl,
        timestamp: new Date().toISOString(),
      };

      const stored = localStorage.getItem(STORAGE_KEY);
      let history = stored ? JSON.parse(stored) : [];
      
      // Add new item at the beginning
      history = [newItem, ...history];
      
      // Keep only the most recent items
      history = history.slice(0, MAX_HISTORY_ITEMS);
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
      setImageHistory(history);
    } catch (error) {
      console.error('Error saving to history:', error);
    }
  };

  // Remove item from history
  const removeFromHistory = (id) => {
    try {
      const updated = imageHistory.filter(item => item.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setImageHistory(updated);
    } catch (error) {
      console.error('Error removing from history:', error);
    }
  };

  // Convert data URL back to File object
  const dataUrlToFile = async (dataUrl, filename) => {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    return new File([blob], filename, { type: blob.type });
  };

  // Handle selecting an image from history
  const handleHistorySelect = async (item) => {
    try {
      const file = await dataUrlToFile(item.dataUrl, item.name);
      setSelectedImage(file);
      setPreview(item.dataUrl);
    } catch (error) {
      console.error('Error loading history item:', error);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    handleFile(file);
  };

  const handleFile = (file) => {
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result;
        setPreview(dataUrl);
        saveToHistory(file, dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedImage) {
      onSearch(selectedImage);
    }
  };

  const handleClear = () => {
    setSelectedImage(null);
    setPreview(null);
  };

  return (
    <div className="image-upload">
      {imageHistory.length > 0 && (
        <div className="image-history">
          <h3 className="history-title">Búsquedas recientes</h3>
          <div className="history-grid">
            {imageHistory.map((item) => (
              <div key={item.id} className="history-item">
                <img
                  src={item.dataUrl}
                  alt={item.name}
                  className="history-thumbnail"
                  onClick={() => handleHistorySelect(item)}
                  title={`Usar: ${item.name}`}
                />
                <button
                  type="button"
                  className="history-remove"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFromHistory(item.id);
                  }}
                  title="Eliminar de historial"
                >✕</button>
              </div>
            ))}
          </div>
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div 
          className={`upload-area ${dragActive ? 'drag-active' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {preview ? (
            <div className="preview-container">
              <img src={preview} alt="Preview" className="preview-image" />
              <button 
                type="button" 
                onClick={handleClear} 
                className="clear-button"
                disabled={isLoading}
              >
                ✕ Eliminar
              </button>
            </div>
          ) : (
            <div className="upload-prompt">
              <div className="upload-icon">📷</div>
              <p>Arrastra y suelta una imagen aquí, o</p>
              <label className="file-input-label">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="file-input"
                  disabled={isLoading}
                />
                <span className="file-input-button">Elegir Archivo</span>
              </label>
            </div>
          )}
        </div>
        
        {selectedImage && (
          <button 
            type="submit" 
            className="search-button"
            disabled={isLoading}
          >
            {isLoading ? '🔄 Buscando...' : '🔍 Buscar por Imagen'}
          </button>
        )}
      </form>
    </div>
  );
}

export default ImageUpload;
