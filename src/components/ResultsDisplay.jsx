import './ResultsDisplay.css';

function ResultsDisplay({ results, query, isLoading }) {
  if (isLoading) {
    return (
      <div className="results-loading">
        <div className="spinner"></div>
        <p>Searching...</p>
      </div>
    );
  }

  if (!results || results.length === 0) {
    return query ? (
      <div className="results-empty">
        <p>No results found for "{query}"</p>
      </div>
    ) : null;
  }

  return (
    <div className="results-display">
      <div className="results-header">
        <h2>Search Results{query && ` for "${query}"`}</h2>
        <p className="results-count">{results.length} results found</p>
      </div>

      <div className="results-grid">
        {results.map((result, index) => (
          <div key={index} className="result-card">
            <div className="result-image-container">
              {result.url ? (
                <img 
                  src={result.url} 
                  alt={result.metadata?.video_id || 'Video frame'} 
                  className="result-image"
                  loading="lazy"
                />
              ) : (
                <div className="result-image-placeholder">
                  🎬
                </div>
              )}
              <div className="result-score">
                {(result.similarity * 100).toFixed(1)}% match
              </div>
            </div>

            <div className="result-info">
              <h3 className="result-title">
                {result.metadata?.video_name || result.path?.split('/').pop() || 'Untitled'}
              </h3>
              
              {result.metadata?.timestamp !== undefined && result.metadata?.timestamp !== null && (
                <p className="result-timestamp">
                  ⏱️ {formatTimestamp(result.metadata.timestamp)}
                </p>
              )}

              {result.metadata?.frame_index !== undefined && (
                <p className="result-detail">
                  📸 Frame {result.metadata.frame_index}
                </p>
              )}

              {result.metadata?.objects && result.metadata.objects.length > 0 && (
                <div className="result-objects">
                  <strong>Objects detected:</strong>
                  <div className="object-tags">
                    {result.metadata.objects.slice(0, 5).map((obj, i) => (
                      <span key={i} className="object-tag">
                        {obj.class_name} ({(obj.confidence * 100).toFixed(0)}%)
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {result.result_type && (
                <p className="result-type-badge">
                  {result.result_type === 'frame' ? '🎞️ Frame' : '🔍 Object'}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatTimestamp(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default ResultsDisplay;
