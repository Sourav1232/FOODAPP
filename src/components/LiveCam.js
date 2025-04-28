import React, { useRef, useEffect, useState } from 'react';
import './LiveCam.css';

const LiveCam = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [speed, setSpeed] = useState(20); // Default speed
  const [toastMessage, setToastMessage] = useState(''); // For Snackbar Toast

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
    console.log(`📤 Sending command to Firebase: "${command}"`);

    fetch('https://foodai-7ebf0-default-rtdb.firebaseio.com/command.json', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(command)
    })
    .then(res => {
      if (res.ok) {
        console.log(`✅ Command "${command}" sent successfully to Firebase`);
      } else {
        console.error(`❌ Failed to send command "${command}". Status:`, res.status);
      }
    })
    .catch(err => console.error(`❌ Error sending command "${command}":`, err));
  };

  const handleSpeedChange = (e) => {
    const newSpeed = parseInt(e.target.value, 10);
    setSpeed(newSpeed);
  };

  const handleSpeedSubmit = () => {
    sendCommand(`s:${speed}`);
    setToastMessage(`✅ Speed updated to ${speed}%`);

    setTimeout(() => {
      setToastMessage('');
    }, 2000);
  };

  const handleControlCommand = (command, label) => {
    console.log(`🕹️ ${label} clicked`);
    sendCommand(command);
    setToastMessage(`✅ ${label} command sent`);
    
    setTimeout(() => {
      setToastMessage('');
    }, 2000);
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
          <button onClick={() => handleControlCommand("1", "Start")}>Start</button>
          <button onClick={() => handleControlCommand("0", "Stop")}>Stop</button>
          <button onClick={() => handleControlCommand("2", "Reverse")}>Reverse</button>
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

      {/* Snackbar Toast */}
      {toastMessage && (
        <div className="toast">
          {toastMessage}
        </div>
      )}
    </div>
  );
};

export default LiveCam;
