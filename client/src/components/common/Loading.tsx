import React from 'react';

interface LoadingProps {
  message?: string;
}

// loading component with spinner and optional message
// set up with aria content for screen readers
const Loading: React.FC<LoadingProps> = ({ message = 'Loading...' }) => {
  return (
    <div className="loading-container" role="status" aria-live="polite">
      <div className="loading-spinner" aria-hidden="true"></div>
      <p className="loading-message">{message}</p>
      <span className="sr-only">Loading content, please wait.</span>
    </div>
  );
};

export default Loading;
