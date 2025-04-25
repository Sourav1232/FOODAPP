import React, { useRef, useEffect } from 'react';
import './LiveCam.css';

const LiveCam = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        console.log("✅ Webcam stream started");
        videoRef.current.srcObject = stream;
      })
      .catch(err => console.error("❌ Error accessing webcam:", err));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (videoRef.current && canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        ctx.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
        canvasRef.current.toBlob(blob => {
          if (blob) {
            const formData = new FormData();
            formData.append('frame', blob);

            console.log("📤 Sending frame to backend...");

            fetch('http://localhost:5000/detect', {
              method: 'POST',
              body: formData
            })
              .then(res => {
                if (!res.ok) {
                  console.error("❌ Backend returned error status:", res.status);
                }
                return res.blob();
              })
              .then(blob => {
                console.log("✅ Received processed frame from backend");
                const url = URL.createObjectURL(blob);
                document.getElementById('detection-output').src = url;
              })
              .catch(err => console.error("❌ Detection error:", err));
          } else {
            console.error("❌ Blob creation failed from canvas");
          }
        }, 'image/jpeg');
      } else {
        console.warn("⚠️ videoRef or canvasRef not ready");
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
