import React from 'react';
import './LiveCam.css';

const LiveCam = () => {
  return (
    <div className="livecam-container">
      {/* Header with background image */}
      <header className="livecam-header">
        <h1>Live Camera Feed</h1>
      </header>

      {/* Description */}
      <p className="livecam-description">
        This feed provides a real-time view from your inventory or kitchen camera. Monitor food freshness and storage conditions live.
      </p>

      {/* Camera Feed */}
      <div className="livecam-feed">
        <img
          src="http://192.168.1.101:8081/video" // Replace with your actual stream URL
          alt="Live Camera Feed"
          className="livecam-video"
        />
      </div>
    </div>
  );
};

export default LiveCam;
