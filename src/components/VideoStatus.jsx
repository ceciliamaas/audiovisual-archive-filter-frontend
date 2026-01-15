import { useState, useEffect } from 'react';
import './VideoStatus.css';

function VideoStatus({ videoName, onClose, onDelete, onStatusChange }) {
  const [status, setStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!videoName) return;

    const fetchStatus = async () => {
      try {
        console.log('Fetching status for:', videoName);
        // URL encode the video name to handle special characters
        const encodedVideoName = encodeURIComponent(videoName);
        const response = await fetch(`http://localhost:8000/api/videos/status/${encodedVideoName}`);
        console.log('Status response:', response.status);
        
        if (!response.ok) {
          throw new Error('Failed to fetch status');
        }

        const data = await response.json();
        console.log('Status data:', data);
        setStatus(data);
        setError(null);
        setIsLoading(false);
        
        // Notify parent of status change
        if (onStatusChange) {
          onStatusChange(videoName, data.status);
        }
      } catch (err) {
        console.error('Status fetch error:', err);
        setError(err.message);
        setIsLoading(false);
      }
    };

    // Initial fetch
    fetchStatus();
    
    // Poll for status updates every 3 seconds
    const interval = setInterval(() => {
      fetchStatus();
    }, 3000);

    return () => clearInterval(interval);
  }, [videoName]);

  // Stop polling when completed or failed
  useEffect(() => {
    if (status?.status === 'completed' || status?.status === 'failed') {
      // Polling will continue but that's ok for simplicity
    }
  }, [status?.status]);

  if (isLoading) {
    return (
      <div className="video-status-card">
        <div className="loading-spinner">⏳ Loading status...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="video-status-card">
        <div className="error">❌ {error}</div>
        {onClose && <button onClick={onClose} className="close-button">Close</button>}
      </div>
    );
  }

  if (!status) return null;

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return '⏸️';
      case 'downloading': return '📥';
      case 'extracting_frames': return '🎞️';
      case 'detecting_objects': return '🔍';
      case 'computing_embeddings': return '🧮';
      case 'uploading': return '☁️';
      case 'completed': return '✅';
      case 'failed': return '❌';
      default: return '🔄';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#27ae60';
      case 'failed': return '#e74c3c';
      default: return '#3498db';
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete "${videoName}"?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const encodedVideoName = encodeURIComponent(videoName);
      const response = await fetch(`http://localhost:8000/api/videos/${encodedVideoName}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete video');
      }

      if (onDelete) {
        onDelete(videoName);
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert(`Failed to delete: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="video-status-card">
      <div className="status-header">
        <h3>
          {getStatusIcon(status.status)} {status.video_name}
        </h3>
        {onClose && <button onClick={onClose} className="close-button-icon">✕</button>}
      </div>

      <div className="status-info">
        <div className="status-badge" style={{ background: getStatusColor(status.status) }}>
          {status.status.replace(/_/g, ' ').toUpperCase()}
        </div>
        
        <div className="progress-bar-container">
          <div 
            className="progress-bar" 
            style={{ 
              width: `${status.progress}%`,
              background: getStatusColor(status.status)
            }}
          />
          <span className="progress-text">{Math.round(status.progress)}%</span>
        </div>
      </div>

      {status.steps_completed && status.steps_completed.length > 0 && (
        <div className="steps-completed">
          <h4>Completed Steps:</h4>
          <ul>
            {status.steps_completed.map((step, index) => (
              <li key={index}>✓ {step.replace(/_/g, ' ')}</li>
            ))}
          </ul>
        </div>
      )}

      {(status.frame_count > 0 || status.object_count > 0) && (
        <div className="stats">
          {status.frame_count > 0 && (
            <div className="stat-item">
              <span className="stat-label">Frames:</span>
              <span className="stat-value">{status.frame_count}</span>
            </div>
          )}
          {status.object_count > 0 && (
            <div className="stat-item">
              <span className="stat-label">Objects:</span>
              <span className="stat-value">{status.object_count}</span>
            </div>
          )}
        </div>
      )}

      {status.error_message && (
        <div className="error-details">
          <strong>Error:</strong> {status.error_message}
        </div>
      )}

      {(status.status === 'completed' || status.status === 'failed') && (
        <button 
          onClick={handleDelete} 
          className="delete-button"
          disabled={isDeleting}
          style={{
            marginTop: '10px',
            padding: '8px 16px',
            backgroundColor: '#e74c3c',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isDeleting ? 'not-allowed' : 'pointer'
          }}
        >
          {isDeleting ? '⏳ Deleting...' : '🗑️ Delete'}
        </button>
      )}

      <div className="timestamps">
        <small>
          Created: {new Date(status.created_at).toLocaleString()}
        </small>
        {status.completed_at && (
          <small>
            Completed: {new Date(status.completed_at).toLocaleString()}
          </small>
        )}
      </div>
    </div>
  );
}

export default VideoStatus;
