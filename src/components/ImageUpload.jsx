import { useState } from 'react';
import './ImageUpload.css';

function ImageUpload({ onSearch, isLoading }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    handleFile(file);
  };

  const handleFile = (file) => {
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
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
                ✕ Remove
              </button>
            </div>
          ) : (
            <div className="upload-prompt">
              <div className="upload-icon">📷</div>
              <p>Drag and drop an image here, or</p>
              <label className="file-input-label">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="file-input"
                  disabled={isLoading}
                />
                <span className="file-input-button">Choose File</span>
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
            {isLoading ? '🔄 Searching...' : '🔍 Search by Image'}
          </button>
        )}
      </form>
    </div>
  );
}

export default ImageUpload;
