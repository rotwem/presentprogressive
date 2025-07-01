import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { GazePoint } from './types';

interface TestStageProps {
  faceDetected: boolean;
  mappedPoint: GazePoint;
  onStageComplete: () => void;
  blinkDetected: boolean;
}

interface VideoItem {
  id: string;
  ref: React.RefObject<HTMLVideoElement>;
  isHovered: boolean;
  row: number;
  col: number;
}

const TestStage: React.FC<TestStageProps> = ({
  faceDetected,
  mappedPoint,
  onStageComplete,
  blinkDetected
}) => {
  const [endTime, setEndTime] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(75);
  const [bgColor, setBgColor] = useState<'white' | 'black'>('black');
  const [showWink, setShowWink] = useState(false);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const audioRef = useRef<HTMLAudioElement>(null);
  const hoverAudioRef = useRef<HTMLAudioElement>(null);

  const gridQ: Array<[string, Record<string, string>]> = [
    ["ARE YOU FEELING OK?", {'RIGHT': 'YES', 'DOWN': 'NO'}],
    ["ARE YOU SOCIALIZING?", {'RIGHT': 'YES', 'DOWN': 'NO', 'LEFT': 'UNKNOWN'}],
    ["ARE YOU GOING OUT?", {'RIGHT': 'YES', 'DOWN': 'NO', 'LEFT': 'UNKNOWN'}],
    ["ARE YOU STANDING OUT?", {'RIGHT': 'YES', 'DOWN': 'NO', 'LEFT': 'UNKNOWN'}],
    ["ARE YOU BEING YOURSELF?", {'RIGHT': 'YES', 'DOWN': 'NO', 'LEFT': 'UNKNOWN'}],
    ["ARE YOU FEELING SCARED?", {'DOWN': 'NO', 'LEFT': 'YES'}],
    ["ARE YOU TALKING TO ANYONE?", {'RIGHT': 'YES', 'DOWN': 'NO', 'UP': 'MAYBE'}],
    ["ARE YOU TAKING CARE OF YOURSELF?", {'RIGHT': 'YES', 'DOWN': 'NO', 'UP': 'MAYBE', 'LEFT': 'UNKNOWN'}],
    ["ARE YOU TRYING TO RELAX?", {'RIGHT': 'YES', 'DOWN': 'NO', 'UP': 'MAYBE', 'LEFT': 'UNKNOWN'}],
    ["ARE YOU BLENDING IN?", {'RIGHT': 'YES', 'DOWN': 'NO', 'UP': 'MAYBE', 'LEFT': 'UNKNOWN'}],
    ["ARE YOU PLAYING GAMES?", {'RIGHT': 'YES', 'DOWN': 'NO', 'UP': 'MAYBE', 'LEFT': 'UNKNOWN'}],
    ["ARE YOU LOSING INTEREST?", {'DOWN': 'NO', 'LEFT': 'YES', 'UP': 'MAYBE'}],
    ["ARE YOU AVOIDING SOMETHING?", {'RIGHT': 'YES', 'DOWN': 'NO', 'UP': 'MAYBE'}],
    ["ARE YOU DOOM SCROLLING?", {'RIGHT': 'YES', 'DOWN': 'NO', 'UP': 'MAYBE', 'LEFT': 'UNKNOWN'}],
    ["ARE YOU BED ROTTING?", {'RIGHT': 'YES', 'DOWN': 'NO', 'UP': 'MAYBE', 'LEFT': 'UNKNOWN'}],
    ["ARE YOU ENJOYING YOURSELF?", {'RIGHT': 'YES', 'DOWN': 'NO', 'UP': 'MAYBE', 'LEFT': 'UNKNOWN'}],
    ["ARE YOU FALLING IN LOVE?", {'RIGHT': 'YES', 'DOWN': 'NO', 'UP': 'MAYBE', 'LEFT': 'UNKNOWN'}],
    ["ARE YOU EXPRESSING YOUR FEELINGS?", {'DOWN': 'NO', 'LEFT': 'YES', 'UP': 'MAYBE'}],
    ["ARE YOU FEELING GUILTY?", {'RIGHT': 'YES', 'UP': 'NO'}],
    ["ARE YOU BEING PRODUCTIVE?", {'RIGHT': 'YES', 'LEFT': 'NO', 'UP': 'MAYBE'}],
    ["ARE YOU DOING YOUR CHORES?", {'RIGHT': 'YES', 'LEFT': 'NO', 'UP': 'MAYBE'}],
    ["ARE YOU BREATHING?", {'RIGHT': 'YES', 'LEFT': 'NO', 'UP': 'MAYBE'}],
    ["ARE YOU MISSING SOMETHING?", {'RIGHT': 'YES', 'LEFT': 'NO', 'UP': 'MAYBE'}],
    ["ARE YOU GETTING TIRED?", {'LEFT': 'NO', 'UP': 'YES'}],
  ]

  // Initialize videos with row and column positions
  useEffect(() => {
    const videoItems: VideoItem[] = [];
    for (let i = 0; i < 24; i++) {
      const row = Math.floor(i / 6);
      const col = i % 6;
      videoItems.push({
        id: `video-${i}`,
        ref: React.createRef<HTMLVideoElement>(),
        isHovered: false,
        row,
        col
      });
    }
    setVideos(videoItems);
  }, []);

  // Initialize end time when stage starts
  useEffect(() => {
    if (endTime !== null) return;
    
    const twoMinutesFromNow = Date.now() + 75000; // Current time + 75 seconds in milliseconds
    setEndTime(twoMinutesFromNow);
  }, [endTime]);

  // Start background audio when stage starts
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.3; // Set volume to 30%
      audioRef.current.loop = true; // Loop the audio
      audioRef.current.play().catch(error => console.error('Error playing audio:', error));
    }
  }, []);

  // Initialize hover audio
  useEffect(() => {
    if (hoverAudioRef.current) {
      hoverAudioRef.current.volume = 0.4; // Set volume to 40%
    }
  }, []);

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

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Add effect for background color toggle
  // useEffect(() => {
  //   if (blinkDetected) {
  //     setBgColor(prev => prev === 'white' ? 'black' : 'white');
  //   }
  // }, [blinkDetected]);

  // Add effect for wink text display
  useEffect(() => {
    if (blinkDetected) {
      setShowWink(true);
      setTimeout(() => {
        setShowWink(false);
      }, 500);
    }
  }, [blinkDetected]);

  // Video hover detection for all videos
  useEffect(() => {
    if (!faceDetected || videos.length === 0) return;

    setVideos(prevVideos => 
      prevVideos.map(video => {
        const videoElement = video.ref.current;
        if (!videoElement) return video;

        const videoRect = videoElement.getBoundingClientRect();
        const videoCenterX = videoRect.left + videoRect.width / 2;
        const videoCenterY = videoRect.top + videoRect.height / 2;
        const hoverThreshold = 100; // Distance threshold for hover detection

        const distance = Math.sqrt(
          Math.pow(mappedPoint.x - videoCenterX, 2) + Math.pow(mappedPoint.y - videoCenterY, 2)
        );

        const isHovered = distance < hoverThreshold;

        if (isHovered && !video.isHovered) {
          // Start playing when hover begins
          videoElement.currentTime = 0;
          videoElement.play().catch(error => console.error('Error playing video:', error));
          
          // Play hover sound
          if (hoverAudioRef.current) {
            hoverAudioRef.current.currentTime = 0;
            hoverAudioRef.current.play().catch(error => console.error('Error playing hover audio:', error));
          }
          
          return { ...video, isHovered: true };
        } else if (!isHovered && video.isHovered) {
          // Pause and reset to first frame when hover ends
          videoElement.pause();
          videoElement.currentTime = 0;
          return { ...video, isHovered: false };
        }

        return video;
      })
    );
  }, [mappedPoint.x, mappedPoint.y, faceDetected, videos.length]);

  // Function to check if a video should be visible (hovered cell + neighbors)
  const shouldShowVideo = (video: VideoItem): boolean => {
    // If no video is hovered, show all videos
    const hoveredVideo = videos.find(v => v.isHovered);
    if (!hoveredVideo) return true;

    // Show only the hovered video
    return video.isHovered;
  };

  // Function to get question and answers for a hovered cell
  const getQuestionAndAnswers = () => {
    const hoveredVideo = videos.find(v => v.isHovered);
    if (!hoveredVideo) return null;

    // Calculate index: (row * 6) + col (0-based indexing)
    const idx = (hoveredVideo.row * 6) + hoveredVideo.col;
    
    if (idx >= 0 && idx < gridQ.length) {
      return {
        question: gridQ[idx][0],
        answers: gridQ[idx][1]
      };
    }
    
    return null;
  };

  // Function to get answer text for a specific cell
  const getAnswerForCell = (video: VideoItem) => {
    const hoveredVideo = videos.find(v => v.isHovered);
    if (!hoveredVideo) return null;

    const questionData = getQuestionAndAnswers();
    if (!questionData) return null;

    const { answers } = questionData;
    
    // Calculate relative position to hovered cell
    const rowDiff = video.row - hoveredVideo.row;
    const colDiff = video.col - hoveredVideo.col;
    
    // Determine direction and get corresponding answer
    if (rowDiff === -1 && colDiff === 0) return answers['UP' as keyof typeof answers];
    if (rowDiff === 1 && colDiff === 0) return answers['DOWN' as keyof typeof answers];
    if (rowDiff === 0 && colDiff === -1) return answers['LEFT' as keyof typeof answers];
    if (rowDiff === 0 && colDiff === 1) return answers['RIGHT' as keyof typeof answers];
    
    return null;
  };

  const renderGazeDot = () => {
    if (!faceDetected) return null;
    
    return (
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
    );
  };

  return (
    <div style={{ 
      position: 'relative', 
      width: '100vw', 
      height: '100vh', 
      overflow: 'hidden',
      backgroundColor: bgColor,
    }}>
      {/* Background Audio */}
      <audio ref={audioRef} src="/circles.mp3" preload="auto" />
      {/* Hover Audio */}
      <audio ref={hoverAudioRef} src="/coin-flip-shimmer-85750.mp3" preload="auto" />
      {/* Video grid in the center */}
      <div style={{
        position: 'absolute',
        top: '0',
        left: '0',
        width: '100vw',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
        // padding: 'min(2vh, 2vw)',
        boxSizing: 'border-box'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          gridTemplateRows: 'repeat(4, 1fr)',
          columnGap: '2vw',
          rowGap: '0',
          width: 'fit-content',
          height: 'fit-content',
          // maxWidth: 'calc(100vw - 2 * min(2vh, 2vw))',
          // maxHeight: 'calc(100vh - 2 * min(2vh, 2vw))'
        }}>
          {videos.map((video, index) => {
            const questionData = getQuestionAndAnswers();
            const isHoveredCell = video.isHovered;
            const answerText = getAnswerForCell(video);
            const videoNumber = (index + 1).toString().padStart(2, '0');
            
            return (
              <div key={video.id} style={{ position: 'relative', margin: 0, padding: 0 }}>
                <video
                  ref={video.ref}
                  src={`/q_vids/${videoNumber}.mp4`}
                  style={{
                    // width: '11vw',
                    height: '25vh',
                    objectFit: 'cover',
                    objectPosition: 'center',
                    // border: video.isHovered ? '2px solid #ff0000' : '1px solid #ccc',
                    opacity: shouldShowVideo(video) ? 1 : 0.1,
                    transition: 'opacity 0.3s ease-in-out',
                    display: 'block',
                    margin: 0,
                    padding: 0
                  }}
                  muted
                  playsInline
                />
                
                {/* Question overlay on hovered cell */}
                {/* {isHoveredCell && questionData && (
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    color: '#ffffff',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    zIndex: 10,
                    textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                    maxWidth: '90%',
                    lineHeight: '1.2'
                  }}>
                    {questionData.question}
                  </div>
                )} */}
                
                {/* Answer overlay on neighboring cells */}
                {answerText && !isHoveredCell && (
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    color: '#ff0000',
                    fontSize: '1.5vh',
                    fontWeight: 'bold',
                    fontStyle: 'italic',
                    textAlign: 'center',
                    zIndex: 10,
                    textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                    maxWidth: '90%'
                  }}>
                    {answerText}
                  </div>
                )}
              </div>
            );
          })}
        </div>
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
        border: timeLeft <= 30 ? '1px solid #ff0000' : `1px solid ${bgColor === 'white' ? '#000000' : '#ffffff'}`,
        color: timeLeft <= 30 ? '#ff0000' : bgColor === 'white' ? '#000000' : '#ffffff',
        zIndex: 3
      }}>
        {formatTime(timeLeft)}
      </div>

      {/* Tracking overlay */}
      <div 
        className="tracking-overlay" 
        style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          width: '100%', 
          height: '100%', 
          zIndex: 2 
        }}
      >
        {renderGazeDot()}
      </div>
    </div>
  );
};

export default TestStage; 