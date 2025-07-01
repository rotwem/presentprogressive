import React, { useEffect, useRef } from 'react';
import { getFileUrl } from './config';

interface OutroStageProps {
  onOutroComplete?: () => void;
}

const OutroStage: React.FC<OutroStageProps> = ({
  onOutroComplete
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(error => {
        console.error("Error playing video:", error);
      });
    }
  }, []);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {/* Video Background */}
      <video
        ref={videoRef}
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          backgroundColor: '#000000',
          zIndex: 0
        }}
        autoPlay
        loop={false}
        muted={false}
        onEnded={onOutroComplete}
      >
        <source src={getFileUrl("/credits.mp4")} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default OutroStage; 