import { useState } from 'react';
import './SearchBar.css';

function SearchBar({ onSearch, isLoading }) {
  const [query, setQuery] = useState('');
  const [searchFrames, setSearchFrames] = useState(true);
  const [searchObjects, setSearchObjects] = useState(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch({ query: query.trim(), searchFrames, searchObjects });
    }
  };

  return (
    <div className="search-bar">
      <form onSubmit={handleSubmit}>
        <div className="search-input-container">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar videos por descripción de texto..."
            className="search-input"
            disabled={isLoading}
          />
          <button 
            type="submit" 
            className="search-button"
            disabled={isLoading || !query.trim()}
          >
            {isLoading ? '🔄' : '🔍'} Buscar
          </button>
        </div>
        
        <div className="search-options">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={searchFrames}
              onChange={(e) => setSearchFrames(e.target.checked)}
              disabled={isLoading}
            />
            <span>Buscar fotogramas</span>
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={searchObjects}
              onChange={(e) => setSearchObjects(e.target.checked)}
              disabled={isLoading}
            />
            <span>Buscar objetos</span>
          </label>
        </div>
      </form>
    </div>
  );
}

export default SearchBar;
