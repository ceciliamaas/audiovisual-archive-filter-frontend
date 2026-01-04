import { useState } from 'react';
import { archiveAPI } from './services/api';
import SearchBar from './components/SearchBar';
import ImageUpload from './components/ImageUpload';
import ResultsDisplay from './components/ResultsDisplay';
import './App.css';

function App() {
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMode, setSearchMode] = useState('text'); // 'text' or 'image'

  const handleTextSearch = async ({ query, searchFrames, searchObjects }) => {
    setIsLoading(true);
    setError(null);
    setSearchQuery(query);
    
    try {
      const data = await archiveAPI.searchByText({
        query,
        searchFrames,
        searchObjects,
        maxResults: 20,
      });
      setResults(data.results || []);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to search. Please try again.');
      console.error('Search error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageSearch = async (imageFile) => {
    setIsLoading(true);
    setError(null);
    setSearchQuery('image search');
    
    try {
      const data = await archiveAPI.searchByImage(imageFile, 20);
      setResults(data.results || []);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to search by image. Please try again.');
      console.error('Image search error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🎬 Audiovisual Archive Search</h1>
        <p className="subtitle">AI-powered search using CLIP embeddings and object detection</p>
      </header>

      <main className="app-main">
        <div className="search-mode-toggle">
          <button
            className={`mode-button ${searchMode === 'text' ? 'active' : ''}`}
            onClick={() => setSearchMode('text')}
          >
            📝 Text Search
          </button>
          <button
            className={`mode-button ${searchMode === 'image' ? 'active' : ''}`}
            onClick={() => setSearchMode('image')}
          >
            🖼️ Image Search
          </button>
        </div>

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

        <ResultsDisplay 
          results={results} 
          query={searchQuery}
          isLoading={isLoading}
        />
      </main>

      <footer className="app-footer">
        <p>Powered by CLIP embeddings, YOLO object detection, and Qdrant vector database</p>
      </footer>
    </div>
  );
}

export default App;
