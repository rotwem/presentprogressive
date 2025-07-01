import React, { useEffect, useRef, useState } from 'react';

function SimpleCameraTest() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string>('');
  const [cameraStarted, setCameraStarted] = useState(false);

  useEffect(() => {
    const startCamera = async () => {
      try {
        console.log('Requesting camera access...');
        
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: 'user'
          }
        });
        
        console.log('Camera access granted, stream:', stream);
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            console.log('Video metadata loaded');
            videoRef.current?.play();
            setCameraStarted(true);
          };
        }
      } catch (err) {
        console.error('Camera error:', err);
        setError(`Camera error: ${err}`);
      }
    };

    startCamera();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => {
          console.log('Stopping track:', track);
          track.stop();
        });
      }
    };
  }, []);

  if (error) {
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        <h3>Error:</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Reload</button>
      </div>
    );
  }

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      padding: '20px',
      backgroundColor: '#000',
      minHeight: '100vh',
      color: 'white'
    }}>
      <h2>Simple Camera Test</h2>
      <p>Camera Started: {cameraStarted ? 'Yes' : 'No'}</p>
      
      <video
        ref={videoRef}
        style={{
          width: '640px',
          height: '480px',
          border: '2px solid #00ff00',
          borderRadius: '8px',
          transform: 'scaleX(-1)' // Flip horizontally
        }}
        autoPlay
        muted
        playsInline
      />
      
      <p style={{ marginTop: '20px', color: '#00ff00' }}>
        If you see yourself above, the camera is working!
      </p>
    </div>
  );
}

export default SimpleCameraTest;