import React, { useRef, useEffect, useState } from 'react';
import './LiveCam.css';

const LiveCam = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [speed, setSpeed] = useState(70); // Default speed is 70%

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

  const sendCommand = (command) => {
    console.log(`📤 Sending command: ${command}`);
    fetch('https://your-firebase-link.firebaseio.com/command.json', { // replace with your actual Firebase link
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(command)
    })
    .then(res => {
      if (res.ok) {
        console.log("✅ Command sent successfully");
      } else {
        console.error("❌ Failed to send command");
      }
    })
    .catch(err => console.error("❌ Error sending command:", err));
  };

  const handleSpeedChange = (e) => {
    const newSpeed = parseInt(e.target.value, 10);
    setSpeed(newSpeed);
  };

  const handleSpeedSubmit = () => {
    sendCommand(`s:${speed}`);
  };

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

      {/* Conveyor Belt Controls */}
      <div className="conveyor-controls">
        <h2>Conveyor Belt Controls</h2>
        <div className="control-buttons">
          <button onClick={() => sendCommand("1")}>Start</button>
          <button onClick={() => sendCommand("0")}>Stop</button>
          <button onClick={() => sendCommand("2")}>Reverse</button>
        </div>
        <div className="speed-control">
          <label>
            Speed: {speed}%
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={speed} 
              onChange={handleSpeedChange} 
            />
          </label>
          <button onClick={handleSpeedSubmit}>Set Speed</button>
        </div>
      </div>
    </div>
  );
};

export default LiveCam;
