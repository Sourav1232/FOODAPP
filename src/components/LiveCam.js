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

  // Send frames to backend every 500ms
  useEffect(() => {
    const interval = setInterval(() => {
      if (videoRef.current && canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        ctx.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
        canvasRef.current.toBlob(blob => {
          if (blob) {
            const formData = new FormData();
            formData.append('frame', blob);

            fetch('http://localhost:5000/detect', {
              method: 'POST',
              body: formData
            })
            .then(res => res.blob())
            .then(blob => {
              const url = URL.createObjectURL(blob);
              document.getElementById('detection-output').src = url;
            })
            .catch(err => console.error("Detection error:", err));
          }
        }, 'image/jpeg');
      }
    }, 500);

    return () => clearInterval(interval);
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
        <img id="detection-output" alt="Processed Frame" className="livecam-video" />
      </div>
    </div>
  );
};

export default LiveCam;
