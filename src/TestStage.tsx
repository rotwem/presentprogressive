import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { GazePoint } from './types';
import { getFileUrl } from './config';

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
  const [isFullVideoMode, setIsFullVideoMode] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const hoverAudioRef = useRef<HTMLAudioElement>(null);
  const fullVideoRef = useRef<HTMLVideoElement>(null);

  const gridQ: Array<[string, Record<string, string>]> = [
    ["are you feeling ok?", {'RIGHT': 'yes', 'DOWN': 'no'}],
    ["are you socializing?", {'RIGHT': 'yes', 'DOWN': 'no', 'LEFT': 'unknown'}],
    ["are you going out?", {'RIGHT': 'yes', 'DOWN': 'no', 'LEFT': 'unknown'}],
    ["are you standing out?", {'RIGHT': 'yes', 'DOWN': 'no', 'LEFT': 'unknown'}],
    ["are you being yourself?", {'RIGHT': 'yes', 'DOWN': 'no', 'LEFT': 'unknown'}],
    ["are you feeling scared?", {'DOWN': 'no', 'LEFT': 'yes'}],
    ["are you talking to anyone?", {'RIGHT': 'yes', 'DOWN': 'no', 'UP': 'maybe'}],
    ["are you taking care of yourself?", {'RIGHT': 'yes', 'DOWN': 'no', 'UP': 'maybe', 'LEFT': 'unknown'}],
    ["are you trying to relax?", {'RIGHT': 'yes', 'DOWN': 'no', 'UP': 'maybe', 'LEFT': 'unknown'}],
    ["are you blending in?", {'RIGHT': 'yes', 'DOWN': 'no', 'UP': 'maybe', 'LEFT': 'unknown'}],
    ["are you playing games?", {'RIGHT': 'yes', 'DOWN': 'no', 'UP': 'maybe', 'LEFT': 'unknown'}],
    ["are you losing interest?", {'DOWN': 'no', 'LEFT': 'yes', 'UP': 'maybe'}],
    ["are you avoiding something?", {'RIGHT': 'yes', 'DOWN': 'no', 'UP': 'maybe'}],
    ["are you doom scrolling?", {'RIGHT': 'yes', 'DOWN': 'no', 'UP': 'maybe', 'LEFT': 'unknown'}],
    ["are you bed rotting?", {'RIGHT': 'yes', 'DOWN': 'no', 'UP': 'maybe', 'LEFT': 'unknown'}],
    ["are you enjoying yourself?", {'RIGHT': 'yes', 'DOWN': 'no', 'UP': 'maybe', 'LEFT': 'unknown'}],
    ["are you falling in love?", {'RIGHT': 'yes', 'DOWN': 'no', 'UP': 'maybe', 'LEFT': 'unknown'}],
    ["are you expressing your feelings?", {'DOWN': 'no', 'LEFT': 'yes', 'UP': 'maybe'}],
    ["are you feeling guilty?", {'RIGHT': 'yes', 'UP': 'no'}],
    ["are you being productive?", {'RIGHT': 'yes', 'LEFT': 'no', 'UP': 'maybe'}],
    ["are you doing your chores?", {'RIGHT': 'yes', 'LEFT': 'no', 'UP': 'maybe'}],
    ["are you breathing?", {'RIGHT': 'yes', 'LEFT': 'no', 'UP': 'maybe'}],
    ["are you missing something?", {'RIGHT': 'yes', 'LEFT': 'no', 'UP': 'maybe'}],
    ["are you getting tired?", {'LEFT': 'no', 'UP': 'yes'}],
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
      
      // Simply toggle between full video mode and hover mode
      // The render logic will handle showing/hiding the appropriate videos
      setIsFullVideoMode(prev => !prev);
    }
  }, [blinkDetected]);

  // Video hover detection for all videos
  useEffect(() => {
    if (!faceDetected || videos.length === 0 || isFullVideoMode) return;

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
  }, [mappedPoint.x, mappedPoint.y, faceDetected, videos.length, isFullVideoMode]);

  // Function to check if a video should be visible (hovered cell + neighbors)
  const shouldShowVideo = (video: VideoItem): boolean => {
    // If in full video mode, hide all grid videos
    if (isFullVideoMode) return false;
    
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
      <audio ref={audioRef} src={getFileUrl("/Freetime AE.wav")} preload="auto" />
      {/* Hover Audio */}
      <audio ref={hoverAudioRef} src={getFileUrl("/coin-flip-shimmer-85750.mp3")} preload="auto" />
      
      {/* Full Video (shown when in full video mode) */}
      {isFullVideoMode && (
        <div style={{
          position: 'absolute',
          top: '0',
          left: '0',
          width: '100vw',
          height: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1
        }}>
          <video
            ref={fullVideoRef}
            src={getFileUrl("/c_vids/full_vid.mp4")}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              objectPosition: 'center'
            }}
            muted
            playsInline
            autoPlay
          />
        </div>
      )}
      
      {/* Video grid in the center (only shown when not in full video mode) */}
      {!isFullVideoMode && (
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
                    src={getFileUrl(`/c_vids/${videoNumber}.mp4`)}
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
                    <div className='wink-text' style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      // fontFamily: '80-kb-Sharp',
                      transform: 'translate(-50%, -50%)',
                      color: '#ff0000',
                      fontSize: '2vh',
                      // fontWeight: 'bold',
                      // fontStyle: 'italic',
                      textAlign: 'center',
                      zIndex: 10,
                      textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                      maxWidth: '90%',
                      textTransform: 'lowercase'
                    }}>
                      {answerText}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Wink Text */}
      {showWink && (
        <div className="wink-text">
          wink
        </div>
      )}

      {/* Timer */}
      <div 
        className="timer"
        style={{
          // color: timeLeft <= 30 ? '#ff0000' : bgColor === 'white' ? '#000000' : '#ffffff',
          zIndex: 3
        }}
      >
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