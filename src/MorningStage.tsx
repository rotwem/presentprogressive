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
  const [visibleSentences, setVisibleSentences] = useState<boolean[]>([]);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [letterSpacing, setLetterSpacing] = useState<number[]>([]); // Track letter spacing for each sentence
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hoverSoundRef = useRef<HTMLAudioElement | null>(null);
  const sentenceRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const fontColor = videoFlag ? 'white' : 'black';

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

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

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
    "You are boiling water.",
    "drinking coffee give you migraines.",
    "You are dressed.",
    "Sort of.",
    "You are getting out.",
    "The day is starting.",
  ];

  // Split messages into sentences and add proper spacing
  const sentences = Morning_MSG.map(msg => msg.trim()).filter(msg => msg.length > 0);

  // Initialize visible sentences array and letter spacing
  useEffect(() => {
    setVisibleSentences(new Array(sentences.length).fill(true));
    setLetterSpacing(new Array(sentences.length).fill(0)); // Initialize with 0 letter spacing
  }, [sentences.length]);

  // Add effect to cycle through messages
  useEffect(() => {
    const messageInterval = setInterval(() => {
      setCurrentMessageIndex(prev => {
        if (prev < Morning_MSG.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 3000); // Change message every 3 seconds

    return () => clearInterval(messageInterval);
  }, []);

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

  // Effect to check gaze intersection with sentences
  useEffect(() => {
    if (!faceDetected || !mappedPoint) {
      setGazedIndex(null);
      setGazeStartTime(null);
      // Reset letter spacing when no face detected
      setLetterSpacing(new Array(sentences.length).fill(0));
      return;
    }

    let foundIntersection = false;

    // Check each sentence for intersection
    sentenceRefs.current.forEach((ref, index) => {
      if (!ref || !visibleSentences[index]) return;
      
      const rect = ref.getBoundingClientRect();
      const isIntersecting = 
        mappedPoint.x >= rect.left &&
        mappedPoint.x <= rect.right &&
        mappedPoint.y >= rect.top &&
        mappedPoint.y <= rect.bottom;

      if (isIntersecting) {
        if (gazedIndex !== index) {
          // Started gazing at a new sentence
          setGazedIndex(index);
          setGazeStartTime(Date.now());
          // Don't reset letter spacing here - let it continue from where it was
        } else if (gazeStartTime) {
          // Continue gazing at the same sentence
          const gazeDuration = Date.now() - gazeStartTime;
          
          // Update letter spacing based on hover time (0 to 3000ms)
          const spacingProgress = Math.min(gazeDuration / 3000, 1); // 0 to 1
          const maxSpacing = 20; // Maximum letter spacing in pixels
          const currentSpacing = spacingProgress * maxSpacing;
          
          setLetterSpacing(prev => {
            const newSpacing = [...prev];
            newSpacing[index] = currentSpacing;
            return newSpacing;
          });
          
          if (gazeDuration >= 3000) { // 3 seconds
            // Remove the sentence
            setVisibleSentences(prev => {
              const newVisible = [...prev];
              newVisible[index] = false;
              return newVisible;
            });
            setGazedIndex(null);
            setGazeStartTime(null);
          }
        }
        foundIntersection = true;
      }
    });

    // Reset if no intersection found
    if (!foundIntersection) {
      setGazedIndex(null);
      setGazeStartTime(null);
      // Reset letter spacing when not hovering
      setLetterSpacing(new Array(sentences.length).fill(0));
    }
  }, [faceDetected, mappedPoint.x, mappedPoint.y, gazedIndex, gazeStartTime, visibleSentences, sentences.length]);

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

  // Separate effect to handle letter spacing reset when gaze stops
  useEffect(() => {
    if (gazedIndex === null && faceDetected) {
      // Reset letter spacing when not gazing at any sentence
      setLetterSpacing(new Array(sentences.length).fill(0));
    }
  }, [gazedIndex, faceDetected, sentences.length]);

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
          <source src={getFileUrl("/morning_full01.mp4")} type="video/mp4" />
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
      
      {/* Morning Messages */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        width: '100%',
        maxWidth: '100%',
        zIndex: 3
      }}>
        <div style={{
          fontSize: '6vw',
          fontWeight: 'bold',
          lineHeight: '6.3vw',
          fontFamily: 'Helvetica, Arial, sans-serif',
          color: videoFlag ? 'white' : 'black',
          whiteSpace: 'pre-wrap',
          wordWrap: 'break-word',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-start',
          gap: '0 0.2em'
        }}>
          {sentences.map((sentence, index) => (
            visibleSentences[index] && (
              <motion.span
                key={index}
                ref={el => sentenceRefs.current[index] = el}
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  filter: gazedIndex === index ? 'blur(0px)' : 'blur(9px)',
                  display: 'inline-block',
                  position: 'relative',
                  letterSpacing: `${letterSpacing[index]}px`,
                  transition: 'filter 0.3s ease, letter-spacing 0.1s ease'
                }}
              >
                {sentence}
              </motion.span>
            )
          ))}
        </div>
      </div>

      {/* Timer */}
      <div style={{
        position: 'absolute',
        top: '50px',
        right: '50px',
        fontSize: '1.3vw',
        fontWeight: 'bold',
        paddingTop: '10px',
        paddingBottom: '10px',
        paddingLeft: '20px',  
        paddingRight: '20px',
        border: '1px solid',
        borderColor: timeLeft <= 30 ? '#ff0000' : fontColor,
        color: timeLeft <= 30 ? '#ff0000' : fontColor,
        zIndex: 3
      }}>
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
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: '#ff0000',
          fontSize: '120px',
          fontWeight: 'bold',
          zIndex: 1000,
          fontFamily: 'Helvetica, Arial, sans-serif',
          textTransform: 'uppercase',
          letterSpacing: '4px'
        }}>
          WINK
        </div>
      )}
    </div>
  );
};

export default MorningStage; 