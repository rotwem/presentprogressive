import React from 'react';

interface LoadingStageProps {
  error?: string;
}

const LoadingStage: React.FC<LoadingStageProps> = ({ error }) => {
  if (error) {
    return (
      <div className="app">
        <div className="error-message">
          <h3>Error</h3>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Reload Page</button>
        </div>
      </div>
    );
  }

  return (
    <div className="loading">
      <div className="spinner"></div>
      Loading eye tracking system...
    </div>
  );
};

export default LoadingStage;