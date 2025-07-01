import React, { useEffect, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { GazePoint } from './types';
import { getFileUrl } from './config';

interface MazeStageProps {
  faceDetected: boolean;
  mappedPoint: GazePoint;
  onStageComplete: () => void;
  blinkDetected: boolean;
}

interface FallingMessage {
  id: number;
  text: string;
  alternateText: string;
  imagePath: string;
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  isPaused: boolean;
  hoverStartTime?: number;
}

const getRandomDirection = () => {
  const angle = Math.random() * Math.PI * 2;
  const direction = {
    x: Math.cos(angle),
    y: Math.sin(angle)
  };
  // Normalize the vector to ensure constant speed
  const magnitude = Math.sqrt(direction.x * direction.x + direction.y * direction.y);
  return {
    x: direction.x / magnitude,
    y: direction.y / magnitude
  };
};

const CONSTANT_SPEED = 5; // Fixed speed for text movement

const MazeStage: React.FC<MazeStageProps> = ({
  faceDetected,
  mappedPoint,
  onStageComplete,
  blinkDetected
}) => {
  // const absurdAffirmations = [
  //   ["you are going places /", "/ where are you going?", "/chase_img/going.jpg"],
  //   ["you are making a name for yourself /", "/ who are you trying to impress?", "/chase_img/impress.jpg"],
  //   ["you are leveling up /", "/ is this a game?", "/chase_img/game.png"],
  //   ["you are staying on track /", "/ are you missing the point?", "/chase_img/track.jpg"],
  //   ["you are staying productive /", "/ are you distracting yourself?", "/chase_img/distract.jpg"],
  //   ["you are chasing your dreams /", "/ why is it a chase?", "/chase_img/dreams.jpg"],
  //   ["you are investing in your future /", "/ are you happy right now?", "/chase_img/future.jpeg"],
  //   ["you are checking the boxes /", "/ are you boxing yourself in?", "/chase_img/box.jpg"],
  //   ["you are making it work /", "/ are you working all the time?", "/chase_img/working.jpg"],
  //   ["you are getting things done /", "/ are you doing the right thing?", "/chase_img/right.jpeg"],
  // ];

  const absurdAffirmations = [
    ["you are going places /", "/ where are you going?", "/chase_vid/going.mp4"],
    ["you are checking the boxes /", "/ are you boxing yourself in?", "/chase_vid/box.mp4"],
    ["you are making it work /", "/ are you working all the time?", "/chase_vid/work.mp4"],
    ["you are leveling up /", "/ is this a game?", "/chase_vid/game.mp4"],
  ];


  const [endTime, setEndTime] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(75); // 120 seconds = 2 minutes
  const [showWink, setShowWink] = useState(false);
  const [currentMessage, setCurrentMessage] = useState<FallingMessage | null>(null);
  const [messageIndex, setMessageIndex] = useState(0);
  const messageControls = useAnimation();
  const [audioStarted, setAudioStarted] = useState(false);
  const [currentNoise, setCurrentNoise] = useState<'none' | 'grey' | 'brown' | 'blue' | 'white'>('none');

  // Initialize end time when stage starts
  useEffect(() => {
    if (endTime !== null) return;
    
    const twoMinutesFromNow = Date.now() + 75000; // Current time + 2 minutes in milliseconds
    setEndTime(twoMinutesFromNow);
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

  // Function to cycle through noises
  const cycleNoise = () => {
    const noiseOrder: Array<'none' | 'grey' | 'brown' | 'blue' | 'white'> = ['none', 'grey', 'brown', 'blue', 'white'];
    const currentIndex = noiseOrder.indexOf(currentNoise);
    const nextIndex = (currentIndex + 1) % noiseOrder.length;
    setCurrentNoise(noiseOrder[nextIndex]);
  };

  // Effect to handle noise changes
  useEffect(() => {
    // Stop all noises first
    const noises = ['grey', 'brown', 'blue', 'white'];
    noises.forEach(noise => {
      const audio = document.getElementById(`noise-${noise}`) as HTMLAudioElement;
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    });

    // Start the new noise if not 'none'
    if (currentNoise !== 'none') {
      const audio = document.getElementById(`noise-${currentNoise}`) as HTMLAudioElement;
      if (audio) {
        audio.volume = 0.3;
        audio.play().catch(error => console.error('Error playing noise:', error));
      }
    }
  }, [currentNoise]);

  // Add effect for wink text display and noise cycling
  useEffect(() => {
    if (blinkDetected) {
      setShowWink(true);
      cycleNoise();
      setTimeout(() => {
        setShowWink(false);
      }, 500);
    }
  }, [blinkDetected]);

  // Simple effect to create a new message when needed
  useEffect(() => {
    if (!currentMessage) {
      const randomDir = getRandomDirection();
      setCurrentMessage({
        id: messageIndex,
        text: absurdAffirmations[messageIndex][0], // Black version (first image)
        alternateText: absurdAffirmations[messageIndex][1], // White version (second image)
        imagePath: absurdAffirmations[messageIndex][2], // Background image
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
        velocityX: CONSTANT_SPEED * randomDir.x,
        velocityY: CONSTANT_SPEED * randomDir.y,
        isPaused: false
      });
    }
  }, [currentMessage, messageIndex]);
  

  // Bouncing animation effect with constant speed
  useEffect(() => {
    if (!currentMessage || currentMessage.isPaused) return;

    const bounceInterval = setInterval(() => {
      setCurrentMessage(prev => {
        if (!prev) return null;

        const messageElement = document.getElementById(`message-${prev.id}`);
        if (!messageElement) return prev;

        const rect = messageElement.getBoundingClientRect();
        let newX = prev.x + prev.velocityX;
        let newY = prev.y + prev.velocityY;
        let newVelocityX = prev.velocityX;
        let newVelocityY = prev.velocityY;
        let shouldChangeMessage = false;

        const buffer = 5;

        // Check for collision with screen edges
        if (newX <= buffer || newX + rect.width >= window.innerWidth - buffer) {
          // Reflect the direction while maintaining constant speed
          newVelocityX = -prev.velocityX;
          shouldChangeMessage = (newX <= buffer && prev.velocityX < 0) || 
                              (newX + rect.width >= window.innerWidth - buffer && prev.velocityX > 0);
        }

        if (newY <= buffer || newY + rect.height >= window.innerHeight - buffer) {
          // Reflect the direction while maintaining constant speed
          newVelocityY = -prev.velocityY;
          shouldChangeMessage = shouldChangeMessage || 
                              (newY <= buffer && prev.velocityY < 0) || 
                              (newY + rect.height >= window.innerHeight - buffer && prev.velocityY > 0);
        }

        // Ensure we stay within bounds
        newX = Math.max(buffer, Math.min(window.innerWidth - rect.width - buffer, newX));
        newY = Math.max(buffer, Math.min(window.innerHeight - rect.height - buffer, newY));

        if (shouldChangeMessage) {
          const nextIndex = (messageIndex + 1) % absurdAffirmations.length;
          setMessageIndex(nextIndex);
          const newRandomDir = getRandomDirection();
          return {
            ...prev,
            id: nextIndex,
            text: absurdAffirmations[nextIndex][0], // Black version (first image)
            alternateText: absurdAffirmations[nextIndex][1], // White version (second image)
            imagePath: absurdAffirmations[nextIndex][2],
            x: newX,
            y: newY,
            velocityX: CONSTANT_SPEED * newRandomDir.x,
            velocityY: CONSTANT_SPEED * newRandomDir.y
          };
        }

        return {
          ...prev,
          x: newX,
          y: newY,
          velocityX: newVelocityX,
          velocityY: newVelocityY
        };
      });
    }, 16); // ~60fps

    return () => clearInterval(bounceInterval);
  }, [currentMessage, absurdAffirmations.length, messageIndex]);

  // Check if gaze point is hovering over message
  useEffect(() => {
    if (!currentMessage || !faceDetected) return;

    const messageElement = document.getElementById(`message-${currentMessage.id}`);
    if (!messageElement) return;

    const rect = messageElement.getBoundingClientRect();
    const isHovering = 
      mappedPoint.x >= rect.left && 
      mappedPoint.x <= rect.right && 
      mappedPoint.y >= rect.top && 
      mappedPoint.y <= rect.bottom;

    if (isHovering !== currentMessage.isPaused) {
      setCurrentMessage(prev => {
        if (!prev) return null;
        return {
          ...prev,
          isPaused: isHovering,
          hoverStartTime: isHovering ? Date.now() : undefined
        };
      });
    }
  }, [mappedPoint, currentMessage, faceDetected]);

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Initialize audio when component mounts
  useEffect(() => {
    if (faceDetected && !audioStarted) {
      const audio = document.getElementById('mazeAudio') as HTMLAudioElement;
      if (audio) {
        audio.volume = 0.3; // Set volume to 30%
        audio.play()
          .then(() => setAudioStarted(true))
          .catch(error => console.error('Error playing audio:', error));
      }
    }
  }, [faceDetected, audioStarted]);

  // Cleanup audio when component unmounts
  useEffect(() => {
    return () => {
      const audio = document.getElementById('mazeAudio') as HTMLAudioElement;
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    };
  }, []);

  return (
    <div style={{ 
      position: 'relative', 
      width: '100vw', 
      height: '100vh', 
      overflow: 'hidden',
      backgroundColor: currentMessage?.isPaused ? 'black' : 'white'
    }}>
      {/* Audio Elements */}
      <audio
        id="mazeAudio"
        loop
        src={getFileUrl("/maze_sound.mp3")}
        style={{ display: 'none' }}
      />
      <audio
        id="noise-grey"
        loop
        src={getFileUrl("/noises/grey.mp3")}
        style={{ display: 'none' }}
      />
      <audio
        id="noise-brown"
        loop
        src={getFileUrl("/noises/brown.mp3")}
        style={{ display: 'none' }}
      />
      <audio
        id="noise-blue"
        loop
        src={getFileUrl("/noises/blue.mp3")}
        style={{ display: 'none' }}
      />
      <audio
        id="noise-white"
        loop
        src={getFileUrl("/noises/white.mp3")}
        style={{ display: 'none' }}
      />

      {/* Timer */}
      <div style={{
        position: 'absolute',
        top: '50px',
        right: '50px',
        fontSize: '24px',
        fontWeight: 'bold',
        paddingTop: '10px',
        paddingBottom: '10px',
        paddingLeft: '20px',  
        paddingRight: '20px',
        border: '1px solid',
        borderColor: timeLeft <= 30 ? '#ff0000' : (currentMessage?.isPaused ? 'white' : 'black'),
        color: timeLeft <= 30 ? '#ff0000' : (currentMessage?.isPaused ? 'white' : 'black'),
        zIndex: 3
      }}>
        {formatTime(timeLeft)}
      </div>

      {/* Background Text - Only show when not hovering */}
      {currentMessage && !currentMessage.isPaused && (
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          maxWidth: '95%',
          fontSize: '3.7vw',
          lineHeight: '3.8vw',
          color: 'black',
          zIndex: 2,
          fontFamily: 'Helvetica, Arial, sans-serif',
          opacity: 0.1,
          textTransform: 'uppercase',
        }}>
          ( everyday ) you are going to work.{' '}<br/>
          you are watching the daylight fade from{' '}<br/>
          inside a room in front of a computer.{' '}<br/> 
          it is ok because ( ... ){' '}<br/>
        </div>
      )}

      {/* Background Video */}
      {currentMessage && currentMessage.isPaused && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 1,
          }}
        >
          <video 
            src={getFileUrl(currentMessage.imagePath)} 
            autoPlay
            loop
            muted
            playsInline
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
            }}
          />
        </div>
      )}

      {/* Bouncing Message */}
      {currentMessage && (
        <motion.div
          id={`message-${currentMessage.id}`}
          style={{
            position: 'absolute',
            left: currentMessage.x,
            top: currentMessage.y,
            zIndex: 4,
            transition: 'opacity 0.3s ease',
            // height: '100px', // Adjust this height as needed
            width: '40vw', // Fixed width for constant length
          }}
        >
          <div 
            style={{
              fontSize: '4.1vw',
              fontWeight: 'bold',
              color: currentMessage.isPaused ? 'white' : 'black',
              // fontStyle: currentMessage.isPaused ? 'italic' : 'normal',
              textShadow: currentMessage.isPaused ? '2px 2px 4px rgba(0,0,0,0.8)' : 'none',
              whiteSpace: 'normal', // Allow text to wrap
              wordWrap: 'break-word', // Break long words if needed
              lineHeight: '4.2vw', // Adjust line spacing
              textAlign: 'left', // Center the text
            }}
          >
            {currentMessage.isPaused ? currentMessage.alternateText : currentMessage.text}
          </div>
        </motion.div>
      )}

      {/* Gaze tracking dot */}
      <div className="tracking-overlay" style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%', 
        zIndex: 5
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

export default MazeStage; 