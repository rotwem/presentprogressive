import React, { useEffect, useRef, useState, useCallback } from 'react';
import { FaceMesh } from '@mediapipe/face_mesh';
import { Camera } from '@mediapipe/camera_utils';
import './App.css';

// Import components and utilities
import CalibrationStage from './CalibrationStage';
import NightimeStage from './NightimeStage';
import IntroStage from './IntroStage';
import MorningStage from './MorningStage';
import OutroStage from './OutroStage';
import CameraComponent, { CameraRef } from './CameraComponent';
import {
  calculateEAR,
  getEyeCenter,
  enhancedMapToScreen,
  remapPoint
} from './eyeTrackingLogic';
import TestStage from './TestStage';
import MazeStage from './MazeStage';

// Import types and constants
import {
  Stage,
  GazePoint,
  PlacedDot,
  CalibrationTarget,
  FaceMeshResults,
  CALIBRATION_TARGETS,
  LEFT_EYE_INDICES,
  RIGHT_EYE_INDICES,
  LEFT_EYE_EAR_INDICES,
  RIGHT_EYE_EAR_INDICES,
  BLINK_THRESHOLD,
  MIN_BLINK_DURATION,
  EMA_ALPHA
} from './types';

function App() {
  // Refs
  const cameraRef = useRef<CameraRef>(null);
  const faceMeshRef = useRef<FaceMesh | null>(null);
  const mediaPipeCameraRef = useRef<Camera | null>(null);
  const currentTargetIndexRef = useRef<number>(0); // Use ref for immediate updates
  const stageRef = useRef<Stage>('calibration');
  const calibrationPointsRef = useRef<GazePoint[]>([]);

  // State - Start with intro
  const [stage, setStage] = useState<Stage>('intro');
  const [currentTargetIndex, setCurrentTargetIndex] = useState(0);
  const [calibrationRawGazePoints, setCalibrationRawGazePoints] = useState<GazePoint[]>([]); // Array of all raw gaze points
  const [gazePoint, setGazePoint] = useState<GazePoint>({ x: 0, y: 0 });
  const [mappedPoint, setMappedPoint] = useState<GazePoint>({ x: 0, y: 0 });
  const [error, setError] = useState<string>('');
  const [faceDetected, setFaceDetected] = useState(false);
  const [blinkDetected, setBlinkDetected] = useState(false);
  const [blinkDuration, setBlinkDuration] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);

  // Tracking variables
  const emaGazeRef = useRef<GazePoint | null>(null);
  const emaEarRef = useRef<number | null>(null);
  const blinkStateRef = useRef<'open' | 'closed'>('open');
  const blinkStartTimeRef = useRef<number | null>(null);
  const calibrationBoundsRef = useRef({ minX: 0, maxX: 0, minY: 0, maxY: 0 });

  const targetKeys = Object.keys(CALIBRATION_TARGETS) as CalibrationTarget[];

  // Initialize MediaPipe
  const initializeMediaPipe = useCallback(async () => {
    try {
      console.log('Initializing MediaPipe FaceMesh...');
      
      // Check if we're on HTTPS
      if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
        throw new Error('Camera access requires HTTPS');
      }
      
      const faceMesh = new FaceMesh({
        locateFile: (file) => {
          console.log('Loading MediaPipe file:', file);
          return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
        }
      });

      faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      faceMesh.onResults(onResults);
      faceMeshRef.current = faceMesh;
      
      console.log('MediaPipe FaceMesh initialized successfully');
      setIsInitialized(true);
      await startCamera();
    } catch (err) {
      console.error('MediaPipe initialization error:', err);
      if (err instanceof Error && err.message.includes('HTTPS')) {
        setError('Camera access requires HTTPS. Please use a secure connection.');
      } else {
        setError('Failed to initialize eye tracking. Please refresh the page and allow camera permissions.');
      }
    }
  }, []);

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      console.log('Starting camera...');
      
      // Check camera permissions first
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 }, 
          height: { ideal: 480 } 
        } 
      });
      
      const videoElement = cameraRef.current?.videoElement;
      if (videoElement && faceMeshRef.current) {
        // Set the video stream
        videoElement.srcObject = stream;
        
        const camera = new Camera(videoElement, {
          onFrame: async () => {
            if (videoElement && faceMeshRef.current) {
              await faceMeshRef.current.send({ image: videoElement });
            }
          },
          width: 640,
          height: 480
        });
        
        mediaPipeCameraRef.current = camera;
        await camera.start();
        console.log('Camera started successfully - ready for calibration');
      }
    } catch (err) {
      console.error('Camera error:', err);
      if (err instanceof Error && err.name === 'NotAllowedError') {
        setError('Camera access denied. Please allow camera permissions and refresh the page.');
      } else if (err instanceof Error && err.name === 'NotFoundError') {
        setError('No camera found. Please connect a camera and refresh the page.');
      } else {
        setError('Camera error: ' + (err instanceof Error ? err.message : 'Unknown error'));
      }
    }
  }, []);

  // MediaPipe results handler
  const onResults = useCallback((results: any) => {
    const canvasElement = cameraRef.current?.canvasElement;
    const videoElement = cameraRef.current?.videoElement;
    
    if (!canvasElement || !videoElement) return;

    const ctx = canvasElement.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match video
    const videoWidth = videoElement.videoWidth || 640;
    const videoHeight = videoElement.videoHeight || 480;
    
    if (canvasElement.width !== videoWidth || canvasElement.height !== videoHeight) {
      canvasElement.width = videoWidth;
      canvasElement.height = videoHeight;
    }

    // Clear canvas
    ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    // Only draw video feed during calibration
    if (stageRef.current === 'calibration') {
      // Draw the flipped video frame
      ctx.save();
      ctx.scale(-1, 1);
      ctx.drawImage(videoElement, -canvasElement.width, 0, canvasElement.width, canvasElement.height);
      ctx.restore();
    }

    // Process face landmarks
    let landmarks = null;
    
    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
      const face = results.multiFaceLandmarks[0];
      
      if (face.landmark) {
        landmarks = face.landmark;
      } else if (face.landmarks) {
        landmarks = face.landmarks;
      } else if (Array.isArray(face)) {
        landmarks = face;
      }
    }

    if (landmarks && landmarks.length >= 468) {
      setFaceDetected(true);
      
      // Draw eye landmarks only during calibration
      if (stageRef.current === 'calibration') {
        ctx.fillStyle = '#ff0000';
        // Draw left eye landmarks
        LEFT_EYE_INDICES.forEach(index => {
          if (landmarks[index] && typeof landmarks[index].x === 'number') {
            const landmark = landmarks[index];
            const x = (1 - landmark.x) * canvasElement.width;
            const y = landmark.y * canvasElement.height;
            
            ctx.beginPath();
            ctx.arc(x, y, 2, 0, 2 * Math.PI);
            ctx.fill();
          }
        });
        // Draw right eye landmarks
        RIGHT_EYE_INDICES.forEach(index => {
          if (landmarks[index] && typeof landmarks[index].x === 'number') {
            const landmark = landmarks[index];
            const x = (1 - landmark.x) * canvasElement.width;
            const y = landmark.y * canvasElement.height;
            
            ctx.beginPath();
            ctx.arc(x, y, 2, 0, 2 * Math.PI);
            ctx.fill();
          }
        });
      }
      
      // Calculate eye centers and EARs
      const leftEyeCenter = getEyeCenter(landmarks, LEFT_EYE_INDICES);
      const rightEyeCenter = getEyeCenter(landmarks, RIGHT_EYE_INDICES);
      const leftEAR = calculateEAR(landmarks, LEFT_EYE_EAR_INDICES);
      const rightEAR = calculateEAR(landmarks, RIGHT_EYE_EAR_INDICES);

      // Use the eye with lower EAR (more closed) for blink detection
      const ear = Math.min(leftEAR, rightEAR);

      // Apply EMA smoothing to the left eye center (keep using left eye for gaze)
      if (!emaGazeRef.current) {
        emaGazeRef.current = leftEyeCenter;
      } else {
        emaGazeRef.current = {
          x: EMA_ALPHA * leftEyeCenter.x + (1 - EMA_ALPHA) * emaGazeRef.current.x,
          y: EMA_ALPHA * leftEyeCenter.y + (1 - EMA_ALPHA) * emaGazeRef.current.y
        };
      }

      if (!emaEarRef.current) {
        emaEarRef.current = ear;
      } else {
        emaEarRef.current = EMA_ALPHA * ear + (1 - EMA_ALPHA) * emaEarRef.current;
      }

      // Set RAW gaze point (for display during calibration)
      const rawScreenPoint = enhancedMapToScreen({
        x: 1 - emaGazeRef.current.x,
        y: emaGazeRef.current.y
      });
      setGazePoint(rawScreenPoint);

      // For MAPPED gaze (used in all post-calibration stages)
      if (calibrationPointsRef.current.length === 4 && 
          (stageRef.current === 'nightime' || stageRef.current === 'morning' || stageRef.current === 'test' || stageRef.current === 'maze')) {
        const bounds = calibrationBoundsRef.current;
        const padding = 10;
        
        // Use the ACTUAL raw eye coordinates (0-1 range) for mapping
        const actualRawGaze = {
          x: emaGazeRef.current.x,
          y: emaGazeRef.current.y
        };
        
        // Interpolate raw gaze to full screen using calibration bounds
        const mappedX = interpolate(actualRawGaze.x, bounds.minX, bounds.maxX, padding, window.innerWidth - padding);
        const mappedY = interpolate(actualRawGaze.y, bounds.minY, bounds.maxY, padding, window.innerHeight - padding);
        
        let mapped = {
          x: Math.max(0, Math.min(window.innerWidth, mappedX)),
          y: Math.max(0, Math.min(window.innerHeight, mappedY))
        };

        // ✅ Flip horizontally to mirror the user
        mapped.x = window.innerWidth - mapped.x;
        
        setMappedPoint(mapped);
      } else {
        // During calibration, mapped point is same as raw
        setMappedPoint(rawScreenPoint);
      }

      // Blink detection
      handleBlinkDetection(emaEarRef.current);
    } else {
      setFaceDetected(false);
    }
  }, [calibrationRawGazePoints.length, stage]);

  // Add interpolation function (equivalent to np.interp)
  const interpolate = (value: number, fromMin: number, fromMax: number, toMin: number, toMax: number): number => {
    // Clamp input value to source range
    const clampedValue = Math.max(fromMin, Math.min(fromMax, value));
    
    // Linear interpolation: np.interp(value, [fromMin, fromMax], [toMin, toMax])
    const ratio = (clampedValue - fromMin) / (fromMax - fromMin);
    return toMin + ratio * (toMax - toMin);
  };

  const handleBlinkDetection = (ear: number) => {
    const currentTime = Date.now();
    
    if (blinkStateRef.current === 'open' && ear < BLINK_THRESHOLD) {
      // Eyes just closed
      blinkStateRef.current = 'closed';
      blinkStartTimeRef.current = currentTime;
      setBlinkDetected(true);
    } else if (blinkStateRef.current === 'closed') {
      if (ear >= BLINK_THRESHOLD) {
        // Eyes just opened
        const duration = blinkStartTimeRef.current ? 
          (currentTime - blinkStartTimeRef.current) / 1000 : 0;
        
        if (duration >= MIN_BLINK_DURATION) {
          console.log('Blink ended! Total duration:', duration);
          handleBlink();
        }
        
        // Reset everything
        blinkStateRef.current = 'open';
        blinkStartTimeRef.current = null;
        setBlinkDetected(false);
        setBlinkDuration(0);
      } else {
        // Eyes still closed, update duration
        const currentDuration = (currentTime - (blinkStartTimeRef.current || currentTime)) / 1000;
        setBlinkDuration(currentDuration);
      }
    }
  };

  const handleBlink = () => {
    const currentIndex = currentTargetIndexRef.current;
    console.log(`BLINK: stage=${stageRef.current}, targetIndex=${currentIndex}/${targetKeys.length}`);

    if (stageRef.current === 'calibration' && currentIndex < targetKeys.length) {
      const targetKey = targetKeys[currentIndex];

      // Get current RAW gaze coordinates (0-1 range from MediaPipe)
      const rawGazeCoords = {
        x: emaGazeRef.current?.x || 0.5,
        y: emaGazeRef.current?.y || 0.5
      };

      console.log(`CALIBRATING ${targetKey}: saving raw gaze (${rawGazeCoords.x.toFixed(3)}, ${rawGazeCoords.y.toFixed(3)})`);

      // APPEND to calibration points
      setCalibrationRawGazePoints(prevPoints => {
        const newPoints = [...prevPoints, rawGazeCoords];
        calibrationPointsRef.current = newPoints;

        const nextIndex = currentIndex + 1;
        currentTargetIndexRef.current = nextIndex;
        setCurrentTargetIndex(nextIndex); // Update UI

        if (nextIndex >= targetKeys.length) {
          console.log('CALIBRATION COMPLETE! Calculating bounds...');

          const minX = Math.min(...newPoints.map(p => p.x));
          const maxX = Math.max(...newPoints.map(p => p.x));
          const minY = Math.min(...newPoints.map(p => p.y));
          const maxY = Math.max(...newPoints.map(p => p.y));

          calibrationBoundsRef.current = { minX, maxX, minY, maxY };
          console.log('Calibration bounds calculated:', calibrationBoundsRef.current);

          setStage('morning');
          stageRef.current = 'morning';
          console.log('SWITCHED TO MORNING STAGE');

          // Skip morning stage and go directly to nighttime
          // setStage('nightime');
          // stageRef.current = 'nightime';
          // console.log('SKIPPING MORNING STAGE, SWITCHED TO NIGHTIME STAGE');

          // setStage('test');
          // stageRef.current = 'test';
          // console.log('SWITCHED TO TEST STAGE');

          // setStage('outro');
          // stageRef.current = 'outro';
          // console.log('SWITCHED TO OUTRO STAGE');

          // setStage('maze');
          // stageRef.current = 'maze';
          // console.log('SWITCHED TO maze STAGE');

          
        }

        return newPoints;
      });
    }
  };

  const handleIntroComplete = () => {
    console.log('Intro complete, switching to calibration stage');
    setStage('calibration');
    stageRef.current = 'calibration';
    // Reset calibration state to ensure we start fresh
    setCalibrationRawGazePoints([]);
    setCurrentTargetIndex(0);
    currentTargetIndexRef.current = 0;
    // Ignore the transition blink by setting a small delay
    setTimeout(() => {
      setBlinkDetected(false);
      blinkStateRef.current = 'open';
    }, 100);
  };

  const resetCalibration = () => {
    console.log('RESETTING CALIBRATION');
    setCalibrationRawGazePoints([]);
    setCurrentTargetIndex(0);
    currentTargetIndexRef.current = 0; // Reset ref too
    setStage('calibration');
    stageRef.current = 'calibration';
  };

  const handleMorningComplete = () => {
    console.log('Morning stage complete, switching to maze stage');
    setStage('maze');
    stageRef.current = 'maze';
  };

  const handleMazeComplete = () => {
    console.log('Maze stage complete, switching to test stage');
    setStage('test');
    stageRef.current = 'test';
  };

  const handleTestComplete = () => {
    console.log('Test stage complete, switching to nightime stage');
    setStage('nightime');
    stageRef.current = 'nightime';
  };

  const handleNightimeComplete = () => {
    console.log('Nightime stage complete, switching to outro stage');
    setStage('outro');
    stageRef.current = 'outro';
  };

  const handleOutroComplete = () => {
    console.log('Outro complete, restarting from intro');
    setStage('intro');
    stageRef.current = 'intro';
    // Reset all necessary state
    setCalibrationRawGazePoints([]);
    setCurrentTargetIndex(0);
    currentTargetIndexRef.current = 0;
  };

  // Initialize on mount
  useEffect(() => {
    initializeMediaPipe();
    
    return () => {
      console.log('Cleaning up...');
      if (faceMeshRef.current) {
        faceMeshRef.current.close?.();
      }
      if (mediaPipeCameraRef.current) {
        mediaPipeCameraRef.current.stop?.();
      }
    };
  }, [initializeMediaPipe]);

  // Add keyboard shortcut for refresh
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'r') {
        console.log('Refreshing program...');
        window.location.reload();
      }
    };

          window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  // Error handling
  if (error) {
    return (
      <div className="app">
        <div className="error-message" style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          textAlign: 'center',
          padding: '20px',
          backgroundColor: '#f8f9fa',
          color: '#333'
        }}>
          <h3 style={{ color: '#dc3545', marginBottom: '20px' }}>Error</h3>
          <p style={{ marginBottom: '30px', maxWidth: '500px', lineHeight: '1.6' }}>{error}</p>
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button 
              onClick={() => {
                setError('');
                setIsInitialized(false);
                initializeMediaPipe();
              }}
              style={{
                padding: '12px 24px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              Retry
            </button>
            <button 
              onClick={() => window.location.reload()}
              style={{
                padding: '12px 24px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              Reload Page
            </button>
          </div>
          <div style={{ marginTop: '30px', fontSize: '14px', color: '#666' }}>
            <p>Make sure to:</p>
            <ul style={{ textAlign: 'left', display: 'inline-block' }}>
              <li>Allow camera permissions when prompted</li>
              <li>Use a modern browser (Chrome, Firefox, Safari)</li>
              <li>Have a working camera connected</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // Render based on current stage
  const renderStage = () => {
    if (!isInitialized) {
      return (
        <div className="loading">
          <div className="spinner"></div>
          Initializing eye tracking system...
        </div>
      );
    }

    switch (stage) {
      case 'intro':
        return (
          <IntroStage
            faceDetected={faceDetected}
            blinkDetected={blinkDetected}
            onIntroComplete={handleIntroComplete}
          />
        );

      case 'calibration':
        return (
          <CalibrationStage
            currentTargetIndex={currentTargetIndex}
            targetKeys={targetKeys}
            faceDetected={faceDetected}
            blinkDetected={blinkDetected}
            calibratedPointsCount={calibrationRawGazePoints.length}
            earValue={emaEarRef.current || undefined}
          />
        );
      
      case 'morning':
        return (
          <MorningStage
            faceDetected={faceDetected}
            mappedPoint={mappedPoint}
            onStageComplete={handleMorningComplete}
            blinkDetected={blinkDetected}
          />
        );

      case 'maze':
        return (
          <MazeStage
            faceDetected={faceDetected}
            mappedPoint={mappedPoint}
            onStageComplete={handleMazeComplete}
            blinkDetected={blinkDetected}
          />
        );
      
      case 'test':
        return (
          <TestStage
            faceDetected={faceDetected}
            mappedPoint={mappedPoint}
            onStageComplete={handleTestComplete}
            blinkDetected={blinkDetected}
          />
        );
      
      case 'nightime':
        return (
          <NightimeStage
            faceDetected={faceDetected}
            mappedPoint={mappedPoint}
            onResetCalibration={resetCalibration}
            blinkDetected={blinkDetected}
            blinkDuration={blinkDuration}
            onStageComplete={handleNightimeComplete}
          />
        );

      case 'outro':
        return (
          <OutroStage
            onOutroComplete={handleOutroComplete}
          />
        );
      
      default:
        return <div>Unknown stage</div>;
    }
  };

  return (
    <div className={`app stage-${stage}`}>
      {/* Camera feed - only visible during intro and calibration */}
      <div style={{ display: stage === 'intro' || stage === 'calibration' ? 'block' : 'none' }}>
        <CameraComponent ref={cameraRef} />
      </div>
      
      {/* Stage-specific content */}
      {renderStage()}
    </div>
  );
}

export default App;