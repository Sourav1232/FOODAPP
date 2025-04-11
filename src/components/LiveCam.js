import React, { useRef, useEffect } from 'react';
import './LiveCam.css';

const LiveCam = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Start webcam on mount
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        videoRef.current.srcObject = stream;
      })
      .catch(err => console.error("Error accessing webcam:", err));
  }, []);

  return (
    <div className="livecam-container">
      <header className="livecam-header">
        <h1>Live Freshness Detection</h1>
      </header>

      <p className="livecam-description">
        Camera is analyzing in real time using YOLOv8. Please ensure good lighting.
      </p>

      <div className="livecam-feed">
        <video ref={videoRef} autoPlay muted playsInline className="livecam-video" />
        <canvas ref={canvasRef} width="640" height="480" style={{ display: 'none' }} />
        <img
          id="detection-output"
          alt="Processed Frame"
          className="livecam-video"
          src="https://yawa-px5z.onrender.com/stream"
        />
      </div>
    </div>
  );
};

export default LiveCam;
