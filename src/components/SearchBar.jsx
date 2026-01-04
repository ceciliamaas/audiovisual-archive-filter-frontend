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
            placeholder="Search videos by text description..."
            className="search-input"
            disabled={isLoading}
          />
          <button 
            type="submit" 
            className="search-button"
            disabled={isLoading || !query.trim()}
          >
            {isLoading ? '🔄' : '🔍'} Search
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
            <span>Search frames</span>
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={searchObjects}
              onChange={(e) => setSearchObjects(e.target.checked)}
              disabled={isLoading}
            />
            <span>Search objects</span>
          </label>
        </div>
      </form>
    </div>
  );
}

export default SearchBar;
