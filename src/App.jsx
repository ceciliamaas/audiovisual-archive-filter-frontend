import { useState, useEffect } from 'react';
import { archiveAPI } from './services/api';
import SearchBar from './components/SearchBar';
import ImageUpload from './components/ImageUpload';
import VideoUpload from './components/VideoUpload';
import VideoStatus from './components/VideoStatus';
import VideoFilter from './components/VideoFilter';
import ResultsDisplay from './components/ResultsDisplay';
import './App.css';

function App() {
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('search'); // 'search' or 'upload'
  const [searchMode, setSearchMode] = useState('text'); // 'text' or 'image'
  const [processingVideos, setProcessingVideos] = useState([]);
  const [resultsLimit, setResultsLimit] = useState(20); // Default: show 20 results
  const [selectedVideos, setSelectedVideos] = useState([]); // Video filter

  // Load processing videos on mount
  useEffect(() => {
    const loadProcessingVideos = async () => {
      try {
        console.log('Fetching processing videos...');
        const response = await fetch('http://localhost:8000/api/videos/list');
        console.log('Response status:', response.status);
        if (response.ok) {
          const data = await response.json();
          console.log('Videos data:', data);
          // Filter for videos that are still processing
          const processing = data.videos.filter(v => 
            v.status !== 'completed' && v.status !== 'failed'
          );
          console.log('Processing videos:', processing);
          if (processing.length > 0) {
            setProcessingVideos(processing.map(v => v.video_name));
            // Automatically switch to upload tab if there are processing videos
            setActiveTab('upload');
          }
        }
      } catch (err) {
        console.error('Failed to load processing videos:', err);
      }
    };

    loadProcessingVideos();
  }, []);

  const handleTextSearch = async ({ query, searchFrames, searchObjects }) => {
    setIsLoading(true);
    setError(null);
    setSearchQuery(query);
    
    try {
      const data = await archiveAPI.searchByText({
        query,
        searchFrames,
        searchObjects,
        maxResults: 50,
        videoNames: selectedVideos.length > 0 ? selectedVideos : null,
      });
      setResults(data.results || []);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to search. Please try again.');
      console.error('Search error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageSearch = async (imageFile, searchFrames = true, searchObjects = true) => {
    setIsLoading(true);
    setError(null);
    setSearchQuery('image search');
    
    try {
      const data = await archiveAPI.searchByImage(
        imageFile, 
        50,
        selectedVideos.length > 0 ? selectedVideos : null,
        searchFrames,
        searchObjects
      );
      setResults(data.results || []);
    } catch (err) {
      // Handle validation errors from FastAPI
      let errorMessage = 'Failed to search by image. Please try again.';
      if (err.response?.data?.detail) {
        if (Array.isArray(err.response.data.detail)) {
          // FastAPI validation errors are arrays of objects
          errorMessage = err.response.data.detail
            .map(e => `${e.loc.join('.')}: ${e.msg}`)
            .join('; ');
        } else {
          errorMessage = err.response.data.detail;
        }
      }
      setError(errorMessage);
      console.error('Image search error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVideoProcessing = (videoName) => {
    // Add video to tracking list
    if (!processingVideos.includes(videoName)) {
      setProcessingVideos([...processingVideos, videoName]);
    }
  };

  const handleDeleteVideo = (videoName) => {
    // Remove from tracking list after deletion
    setProcessingVideos(processingVideos.filter(v => v !== videoName));
  };

  const handleRemoveVideo = async (videoName) => {
    // Check if video is actually completed or failed before removing
    try {
      const encodedVideoName = encodeURIComponent(videoName);
      const response = await fetch(`http://localhost:8000/api/videos/status/${encodedVideoName}`);
      if (response.ok) {
        const data = await response.json();
        // Only allow removal if completed or failed
        if (data.status === 'completed' || data.status === 'failed') {
          setProcessingVideos(processingVideos.filter(v => v !== videoName));
        }
      }
    } catch (err) {
      // If can't fetch status, allow removal
      setProcessingVideos(processingVideos.filter(v => v !== videoName));
    }
  };

  const handleVideoStatusChange = (videoName, status) => {
    // Automatically remove from processing list when completed or failed
    if (status === 'completed' || status === 'failed') {
      setTimeout(() => {
        setProcessingVideos(prevVideos => prevVideos.filter(v => v !== videoName));
      }, 5000); // Remove after 5 seconds to allow user to see final status
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1> Asistente para reconstrucciones audiovisuales</h1>
      </header>

      <main className="app-main">
        <div className="main-tabs">
          <button
            className={`tab-button ${activeTab === 'search' ? 'active' : ''}`}
            onClick={() => setActiveTab('search')}
          >
            🔍 Buscar
          </button>
          <button
            className={`tab-button ${activeTab === 'upload' ? 'active' : ''}`}
            onClick={() => setActiveTab('upload')}
          >
            📹 Procesar Video
          </button>
        </div>

        {activeTab === 'search' ? (
          <>
            <div style={{ textAlign: 'center' }}>
              <div className="search-mode-toggle">
                <button
                  className={`mode-button ${searchMode === 'text' ? 'active' : ''}`}
                  onClick={() => setSearchMode('text')}
                >
                  📝 Búsqueda por texto
                </button>
                <button
                  className={`mode-button ${searchMode === 'image' ? 'active' : ''}`}
                  onClick={() => setSearchMode('image')}
                >
                  🖼️ Búsqueda por imagen
                </button>
              </div>
            </div>

            <VideoFilter 
              selectedVideos={selectedVideos}
              onChange={setSelectedVideos}
            />

            <div className="search-container">
              {searchMode === 'text' ? (
                <SearchBar onSearch={handleTextSearch} isLoading={isLoading} />
              ) : (
                <ImageUpload onSearch={handleImageSearch} isLoading={isLoading} />
              )}
            </div>

            {error && (
              <div className="error-message">
                ⚠️ {error}
              </div>
            )}

            {results.length > 0 && (
              <div className="results-controls">
                <label className="results-slider-label">
                  <span>Mostrar resultados: {resultsLimit}</span>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    step="5"
                    value={resultsLimit}
                    onChange={(e) => setResultsLimit(Number(e.target.value))}
                    className="results-slider"
                  />
                  <div className="slider-markers">
                    <span>5</span>
                    <span>25</span>
                    <span>50</span>
                  </div>
                </label>
              </div>
            )}

            <ResultsDisplay 
              results={results} 
              query={searchQuery}
              isLoading={isLoading}
              resultsLimit={resultsLimit}
            />
          </>
        ) : (
          <>
            <VideoUpload 
              onVideoProcessing={handleVideoProcessing}
              hasProcessingVideos={processingVideos.length > 0}
            />
            
            {processingVideos.length > 0 && (
              <div className="processing-videos-section">
                <h2>Videos en Procesamiento</h2>
                {processingVideos.map((videoName) => (
                  <VideoStatus 
                    key={videoName} 
                    videoName={videoName}
                    onClose={() => handleRemoveVideo(videoName)}
                    onDelete={handleDeleteVideo}
                    onStatusChange={handleVideoStatusChange}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <footer className="app-footer">
        <p> </p>
      </footer>
    </div>
  );
}

export default App;
