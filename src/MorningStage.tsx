import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GazePoint } from './types';
import { getFileUrl } from './config';

interface MorningStageProps {
  faceDetected: boolean;
  mappedPoint: GazePoint;
  onStageComplete: () => void;
  blinkDetected: boolean;
}

interface SentencePosition {
  x: number;
  y: number;
}

const MorningStage: React.FC<MorningStageProps> = ({
  faceDetected,
  mappedPoint,
  onStageComplete,
  blinkDetected
}) => {
  const [endTime, setEndTime] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(75); // 75 seconds = 1:15 minutes
  const [showWink, setShowWink] = useState(false);
  const [videoHeight, setVideoHeight] = useState(100);
  const [videoFlag, setVideoFlag] = useState(false);
  const [gazedIndex, setGazedIndex] = useState<number | null>(null);
  const [gazeStartTime, setGazeStartTime] = useState<number | null>(null);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [currentSentencePosition, setCurrentSentencePosition] = useState<SentencePosition>({ x: 50, y: 50 });
  const [letterSpacing, setLetterSpacing] = useState(0);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [lastYPosition, setLastYPosition] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hoverSoundRef = useRef<HTMLAudioElement | null>(null);
  const sentenceRef = useRef<HTMLSpanElement | null>(null);
  const fontColor = videoFlag ? 'white' : 'black';

  const Morning_MSG = [
    "You are waking up.",
    "it is another day.",
    "just like every day.",
    "You are not ready.",
    "You are snoozing.",
    "Again.",
    "You are checking your phone.",
    "it is a bad idea.",
    "You are scrolling.",
    "Still scrolling.",
    "You are trying to stand.",
    "You are sitting back down.",
    "You are brushing your teeth.",
    "You are staring at the mirror.",
    "It is not answering.",
    "You are dressed.",
    "Sort of.",
    "You are getting out.",
    "The day is starting.",
  ];

  // Initialize end time when stage starts
  useEffect(() => {
    if (endTime !== null) return;
    
    const oneMinuteFifteenFromNow = Date.now() + 75000; // Current time + 1:15 minutes in milliseconds
    setEndTime(oneMinuteFifteenFromNow);
  }, [endTime]);

  // Timer effect using real timestamps
  useEffect(() => {
    if (!endTime) return;

    const updateTimer = () => {
      const now = Date.now();
      const remaining = Math.max(0, Math.ceil((endTime - now) / 1000));
      
      setTimeLeft(remaining);
      
      if (remaining <= 0) {
        onStageComplete();
      }
    };

    // Update immediately and then every 100ms
    updateTimer();
    const timer = setInterval(updateTimer, 100);

    return () => clearInterval(timer);
  }, [endTime, onStageComplete]);

  // Add effect for wink text display
  useEffect(() => {
    if (blinkDetected) {
      setShowWink(true);
      // setVideoHeight(videoHeight + 50);
      setVideoFlag(!videoFlag);
      setTimeout(() => {
        setShowWink(false);
      }, 500);
    }
  }, [blinkDetected]);

  // Generate random position for sentence
  const generateRandomPosition = (sentenceIndex: number): SentencePosition => {
    // Get the sentence text
    const sentence = Morning_MSG[sentenceIndex];
    
    // Create a temporary element to measure text dimensions
    const tempElement = document.createElement('span');
    tempElement.style.fontSize = '6vw';
    tempElement.style.fontWeight = 'bold';
    tempElement.style.fontFamily = 'Helvetica, Arial, sans-serif';
    tempElement.style.whiteSpace = 'nowrap';
    tempElement.style.position = 'absolute';
    tempElement.style.visibility = 'hidden';
    tempElement.textContent = sentence;
    
    // Add to DOM temporarily to measure
    document.body.appendChild(tempElement);
    const textWidth = tempElement.offsetWidth;
    const textHeight = tempElement.offsetHeight;
    document.body.removeChild(tempElement);
    
    // Calculate safe margins based on text size
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Convert text dimensions to percentages
    const textWidthPercent = (textWidth / viewportWidth) * 100;
    const textHeightPercent = (textHeight / viewportHeight) * 100;
    
    // Add extra margin for letter spacing effect (can expand up to 20px per character)
    const maxLetterSpacing = 20;
    const maxExpansionPercent = ((maxLetterSpacing * sentence.length) / viewportWidth) * 100;
    const totalWidthPercent = textWidthPercent + maxExpansionPercent;
    
    // Calculate safe ranges
    const minX = totalWidthPercent / 2; // Half the text width from left edge
    const maxX = 100 - (totalWidthPercent / 2); // Half the text width from right edge
    const minY = textHeightPercent / 2; // Half the text height from top edge
    const maxY = 100 - (textHeightPercent / 2); // Half the text height from bottom edge
    
    // Generate random X position within safe bounds
    const x = minX + Math.random() * (maxX - minX);
    
    // Generate Y position with height difference constraint
    let y: number;
    const minHeightDifference = 9; // Minimum height difference in vw units
    const minHeightDifferencePercent = minHeightDifference; // Already in percentage terms
    
    if (lastYPosition !== null) {
      // Ensure significant height difference from last position
      const upperBound = Math.max(minY, lastYPosition - minHeightDifferencePercent);
      const lowerBound = Math.min(maxY, lastYPosition + minHeightDifferencePercent);
      
      // Create two possible ranges: above or below the last position
      const rangeAbove = [minY, upperBound];
      const rangeBelow = [lowerBound, maxY];
      
      // Choose randomly between above or below
      if (Math.random() < 0.5 && rangeAbove[1] > rangeAbove[0]) {
        y = rangeAbove[0] + Math.random() * (rangeAbove[1] - rangeAbove[0]);
      } else if (rangeBelow[1] > rangeBelow[0]) {
        y = rangeBelow[0] + Math.random() * (rangeBelow[1] - rangeBelow[0]);
      } else {
        // Fallback to full range if constraints can't be met
        y = minY + Math.random() * (maxY - minY);
      }
    } else {
      // First sentence - no constraint
      y = minY + Math.random() * (maxY - minY);
    }
    
    return { x, y };
  };

  // Effect to show next sentence when currentSentenceIndex changes
  useEffect(() => {
    console.log(`useEffect triggered: currentSentenceIndex = ${currentSentenceIndex}`);
    if (currentSentenceIndex < Morning_MSG.length) {
      console.log(`Showing sentence ${currentSentenceIndex}: "${Morning_MSG[currentSentenceIndex]}"`);
      const newPosition = generateRandomPosition(currentSentenceIndex);
      setCurrentSentencePosition(newPosition);
      setLastYPosition(newPosition.y); // Store the Y position for next sentence
      setLetterSpacing(0);
      setGazedIndex(null);
      setGazeStartTime(null);
      setIsAdvancing(false); // Reset the advancing flag
    }
  }, [currentSentenceIndex]);

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Initialize ambient sound
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.3; // Set volume to 30%
      audioRef.current.loop = true;
      audioRef.current.play().catch(error => {
        console.log('Audio playback failed:', error);
      });
    }

    // Cleanup function to stop audio when component unmounts
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, []);

  // Effect to check gaze intersection with current sentence
  useEffect(() => {
    if (!faceDetected || !mappedPoint || !sentenceRef.current || currentSentenceIndex >= Morning_MSG.length) {
      setGazedIndex(null);
      setGazeStartTime(null);
      setLetterSpacing(0);
      return;
    }

    const rect = sentenceRef.current.getBoundingClientRect();
    const isIntersecting = 
      mappedPoint.x >= rect.left &&
      mappedPoint.x <= rect.right &&
      mappedPoint.y >= rect.top &&
      mappedPoint.y <= rect.bottom;

    if (isIntersecting) {
      if (gazedIndex === null) {
        // Started gazing at the sentence
        setGazedIndex(currentSentenceIndex);
        setGazeStartTime(Date.now());
      } else if (gazeStartTime) {
        // Continue gazing at the sentence
        const gazeDuration = Date.now() - gazeStartTime;
        
        // Update letter spacing based on hover time (0 to 2000ms)
        const spacingProgress = Math.min(gazeDuration / 2000, 1); // 0 to 1
        const maxSpacing = 20; // Maximum letter spacing in pixels
        const currentSpacing = spacingProgress * maxSpacing;
        
        setLetterSpacing(currentSpacing);
        
        if (gazeDuration >= 2000 && !isAdvancing) { // 2 seconds
          // Remove the sentence and advance to next one
          console.log(`Advancing from sentence ${currentSentenceIndex} to ${currentSentenceIndex + 1}`);
          setIsAdvancing(true);
          setCurrentSentenceIndex(prev => prev + 1);
        }
      }
    } else {
      // Not intersecting - reset gaze state
      setGazedIndex(null);
      setGazeStartTime(null);
      setLetterSpacing(0);
    }
  }, [faceDetected, mappedPoint.x, mappedPoint.y, gazedIndex, gazeStartTime, currentSentenceIndex]);

  // Effect to handle hover sound
  useEffect(() => {
    if (gazedIndex !== null) {
      if (hoverSoundRef.current) {
        hoverSoundRef.current.currentTime = 0;
        hoverSoundRef.current.play();
      }
    } else {
      if (hoverSoundRef.current) {
        hoverSoundRef.current.pause();
        hoverSoundRef.current.currentTime = 0;
      }
    }
  }, [gazedIndex]);

  return (
    <div className="stage-morning" style={{ 
      position: 'relative', 
      width: '100vw', 
      height: '100vh', 
      overflow: 'hidden',
      backgroundColor: 'white'
    }}>
      {/* Background Video */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 1
      }}>
        <video
          autoPlay
          loop
          playsInline
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: videoFlag ? 'block' : 'none'
          }}
        >
          <source src={getFileUrl("/morning full03.mp4")} type="video/mp4" />
        </video>
      </div>

      <audio 
        ref={audioRef}
        src={getFileUrl("/chirping-birds-ambience-217410.mp3")}
      />
      <audio
        ref={hoverSoundRef}
        src={getFileUrl("/slow-ramp-up-96343.mp3")}
        loop
      />
      
      {/* Current Sentence */}
      {currentSentenceIndex < Morning_MSG.length && (
        <div style={{
          position: 'absolute',
          top: `${currentSentencePosition.y}%`,
          left: `${currentSentencePosition.x}%`,
          transform: 'translate(-50%, -50%)',
          zIndex: 3
        }}>
          <motion.span
            ref={sentenceRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              fontSize: '5vw',
              fontWeight: 'bold',
              fontFamily: 'Helvetica, Arial, sans-serif',
              textTransform: 'uppercase',
              color: videoFlag ? 'white' : 'black',
              filter: gazedIndex !== null ? 'blur(0px)' : 'blur(9px)',
              letterSpacing: `${letterSpacing}px`,
              transition: 'filter 0.3s ease, letter-spacing 0.3s ease-out',
              whiteSpace: 'nowrap',
              textAlign: 'left'
            }}
          >
            {Morning_MSG[currentSentenceIndex]}
          </motion.span>
        </div>
      )}

      {/* Timer */}
      <div 
        className="timer"
        style={{
          // color: '#ff0000',
          zIndex: 3
        }}
      >
        {formatTime(timeLeft)}
      </div>

      {/* Remove the video from the gaze tracking section */}
      <div className="tracking-overlay" style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%', 
        zIndex: 4
      }}>
        {faceDetected && (
          <motion.div
            className="gaze-dot"
            style={{ 
              position: 'absolute',
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              background: '#ff0000',
              x: mappedPoint.x,
              y: mappedPoint.y,
              transform: 'translate(-50%, -50%)',
              boxShadow: '0 0 10px rgba(255, 0, 0, 0.6)',
              zIndex: 1000,
              pointerEvents: 'none'
            }}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </div>

      {/* Wink Text */}
      {showWink && (
        <div className="wink-text">
          wink
        </div>
      )}
    </div>
  );
};

export default MorningStage; 