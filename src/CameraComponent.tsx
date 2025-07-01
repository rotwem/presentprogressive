import React, { useRef, forwardRef, useImperativeHandle } from 'react';

export interface CameraRef {
  videoElement: HTMLVideoElement | null;
  canvasElement: HTMLCanvasElement | null;
}

interface CameraComponentProps {
  className?: string;
}

const CameraComponent = forwardRef<CameraRef, CameraComponentProps>(
  ({ className = "camera-feed" }, ref) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useImperativeHandle(ref, () => ({
      videoElement: videoRef.current,
      canvasElement: canvasRef.current,
    }));

    return (
      <div className="camera-container">
        <canvas
          ref={canvasRef}
          className={className}
        />
        <video
          ref={videoRef}
          style={{ display: 'none' }}
          autoPlay
          muted
          playsInline
        />
      </div>
    );
  }
);

CameraComponent.displayName = 'CameraComponent';

export default CameraComponent;