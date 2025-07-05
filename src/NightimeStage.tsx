import React, { useEffect, useRef, useState } from 'react';
import { GazePoint } from './types';
import { getFileUrl } from './config';

interface NightimeStageProps {
  faceDetected: boolean;
  mappedPoint: GazePoint;
  onResetCalibration: () => void;
  blinkDetected: boolean;
  blinkDuration: number;
  onStageComplete: () => void;
}

interface GridCell {
  id: string;
  row: number;
  col: number;
  imageName: string;
}

interface VisibleImage {
  cellId: string;
  timeoutId: number;
}

const GRID_COLS = 48;
const GRID_ROWS = 27;
const IMAGE_SIZE = 250; // Size in pixels for the images
const AVAILABLE_IMAGES = [
  'aluminium sculpture.png',
  'baby tower.png',
  'ballsgirl.png',
  'baloon girl.png',
  'balooncar.png',
  'baloontits.png',
  'bedman.png',
  'bendman.png',
  'bomberxray.png',
  'chairs.png',
  'chastity belt.png',
  'cozy place.png',
  'cube.png',
  'dagger.png',
  'dalmaties.png',
  'diamond skoll.png',
  'doebaby.png',
  'doorcut.png',
  'greekarch.png',
  'heart star.png',
  'honeyface.png',
  'horse back.png',
  'iam.png',
  'ice bucket.png',
  'ice hold.png',
  'icegoat.png',
  'iris.gif',
  'jesus.png',
  'keyboard.png',
  'kinkbride.png',
  'manwithboobs.png',
  'margiala barbie.png',
  'matches.png',
  'megirot.png',
  'melting_silver.png',
  'minisculpture.png',
  'moonbag.png',
  'nail.png',
  'nailedpigeon.png',
  'nipllesss.png',
  'no way out02.png',
  'nononoplate.png',
  'nowayout.png',
  'oldscaryman.png',
  'pain.png',
  'philosophcalstone.png',
  'pigeons crazy.png',
  'pilowman.png',
  'popsicle.png',
  'rippledcanvas.png',
  'sheerblob.png',
  'sheercube.png',
  'shellhat.png',
  'silver drop.png',
  'silverbed.png',
  'silverdotsman.png',
  'smokehead.png',
  'spike hands.png',
  'spikegirl.png',
  'star_pony.png',
  'stonebag.png',
  'stoneman.png',
  'stringhands.png',
  'swallen creature.png',
  'tanktop.png',
  'teethfall.png',
  'teethmwtal.png',
  'toad.png',
  'toiletpaperr.png',
  'turtle.png',
  'upsode down snowman.png',
  'whiteflowers.png',
  'whitesperm.png',
  'צקבישמןב גםע.png'
];

const NightimeStage: React.FC<NightimeStageProps> = ({
  faceDetected,
  mappedPoint,
  onResetCalibration,
  blinkDetected,
  blinkDuration,
  onStageComplete
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const thunderRef = useRef<HTMLAudioElement>(null);
  const [visibleImages, setVisibleImages] = useState<Record<string, boolean>>({});
  const gridRef = useRef<HTMLDivElement>(null);
  const [showWink, setShowWink] = useState(false);
  const [isVideoInverted, setIsVideoInverted] = useState(false);
  const [textIndex, setTextIndex] = useState(0);

  // Create grid cells with random image assignments
  const [gridCells] = useState<GridCell[]>(() => {
    const cells: GridCell[] = [];
    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        cells.push({
          id: `cell-${row}-${col}`,
          row,
          col,
          imageName: AVAILABLE_IMAGES[Math.floor(Math.random() * AVAILABLE_IMAGES.length)]
        });
      }
    }
    return cells;
  });

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(error => {
        console.error("Error playing video:", error);
      });
    }
  }, []);

  // Text cycling effect
  useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex(prev => (prev + 1) % 3);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Check if gaze point is hovering over any grid cell
  useEffect(() => {
    if (!gridRef.current || !faceDetected) return;

    const grid = gridRef.current;
    const gridRect = grid.getBoundingClientRect();
    const cellWidth = gridRect.width / GRID_COLS;
    const cellHeight = gridRect.height / GRID_ROWS;

    // Calculate which cell we're hovering over
    const col = Math.floor((mappedPoint.x - gridRect.left) / cellWidth);
    const row = Math.floor((mappedPoint.y - gridRect.top) / cellHeight);

    // Check if we're within grid bounds
    if (col >= 0 && col < GRID_COLS && row >= 0 && row < GRID_ROWS) {
      const cellId = `cell-${row}-${col}`;
      
      if (!visibleImages[cellId]) {
        // Show the new image
        setVisibleImages(prev => ({
          ...prev,
          [cellId]: true
        }));
        
        // Set timeout to hide the image after 1 second
        setTimeout(() => {
          setVisibleImages(prev => ({
            ...prev,
            [cellId]: false
          }));
        }, 1000);
      }
    }
  }, [mappedPoint, faceDetected]);

  // Add effect for blink detection
  useEffect(() => {
    if (blinkDetected) {
      setShowWink(true);
      setIsVideoInverted(true);
      
      // Play thunder sound
      if (thunderRef.current) {
        thunderRef.current.currentTime = 0; // Reset the audio to start
        thunderRef.current.play().catch(error => {
          console.error("Error playing thunder sound:", error);
        });
      }

      // Check if eyes have been closed for 5 seconds
      if (blinkDuration >= 4) {
        console.log('Eyes closed for 5 seconds, completing stage');
        onStageComplete();
      }
      
      // Reset after 500ms
      setTimeout(() => {
        setShowWink(false);
        setIsVideoInverted(false);
      }, 500);
    }
  }, [blinkDetected, blinkDuration, onStageComplete]);

  const renderGazeDot = () => {
    if (!faceDetected) return null;
    
    return (
      <div
        className="gaze-dot"
        style={{ 
          left: mappedPoint.x, 
          top: mappedPoint.y,
          position: 'absolute',
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          background: '#ff0000',
          transform: 'translate(-50%, -50%)',
          boxShadow: '0 0 10px rgba(255, 0, 0, 0.6)',
          zIndex: 1000,
          pointerEvents: 'none'
        }}
      />
    );
  };

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {/* Thunder Sound */}
      <audio ref={thunderRef} src={getFileUrl("/thunder-307513.mp3")} preload="auto" />

      {/* Video Background */}
      <video
        ref={videoRef}
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          backgroundColor: '#000000',
          zIndex: 0,
          filter: isVideoInverted ? 'invert(1)' : 'none',
          transition: 'filter 0.2s ease-in-out'
        }}
        autoPlay
        loop
        muted={false}
      >
        <source src={getFileUrl("/nigitime_comp01.mp4")} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Grid Container */}
      <div
        ref={gridRef}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: '100%',
          height: '100%',
          display: 'grid',
          gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`,
          gridTemplateRows: `repeat(${GRID_ROWS}, 1fr)`,
          zIndex: 2,
          pointerEvents: 'none'
        }}
      >
        {gridCells.map(cell => {
          const cellRect = gridRef.current?.getBoundingClientRect();
          const cellWidth = cellRect ? cellRect.width / GRID_COLS : 0;
          const cellHeight = cellRect ? cellRect.height / GRID_ROWS : 0;
          
          return (
            <div
              key={cell.id}
              style={{
                width: '100%',
                height: '100%',
                position: 'relative',
                // background: 'rgba(255,0,0,0.1)', // Uncomment to see grid cells while testing
              }}
            >
              {visibleImages[cell.id] && (
                <img
                  src={getFileUrl(`/nightime_pngs02/${cell.imageName}`)}
                  alt={`Grid Image ${cell.row}-${cell.col}`}
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: `${IMAGE_SIZE}px`,
                    height: `${IMAGE_SIZE}px`,
                    objectFit: 'contain',
                    zIndex: 2,
                    pointerEvents: 'none'
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Tracking overlay */}
      <div className="tracking-overlay" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1000 }}>
        {renderGazeDot()}
      </div>

      {/* Wink Text */}
      {showWink && (
        <div className="wink-text">
          WINK
        </div>
      )}

      {/* Minimal controls - just reset calibration */}
      <div className="timer" style={{ 
        color: '#ff0000',
        zIndex: 1
      }}>
        {textIndex === 0 && "to be done"}
        {textIndex === 1 && "close your eye"}
        {textIndex === 2 && "for 5 seconds"}
      </div>
    </div>
  );
};

export default NightimeStage;