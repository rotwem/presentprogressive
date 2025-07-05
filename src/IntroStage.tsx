import React, { useEffect } from 'react';

interface IntroStageProps {
  faceDetected: boolean;
  blinkDetected: boolean;
  onIntroComplete: () => void;
}

const IntroStage: React.FC<IntroStageProps> = ({
  faceDetected,
  blinkDetected,
  onIntroComplete
}) => {
  // When a blink is detected, trigger the transition
  useEffect(() => {
    if (blinkDetected && faceDetected) {
      onIntroComplete();
    }
  }, [blinkDetected, faceDetected, onIntroComplete]);

  return (
    <div style={{ 
      position: 'relative', 
      width: '100vw', 
      height: '100vh', 
      overflow: 'hidden',
      backgroundColor: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {/* Instructions */}
      <div style={{
        color: 'black',
        textAlign: 'center',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        // fontStyle: 'italic',
        zIndex: 1
      }}>
        {faceDetected ? (
          <p style={{ 
            margin: 0,
            fontSize: '10vw'
          }}>Wink to start</p>
        ) : (
          <p style={{ 
            margin: 0,
            fontSize: '3vw',
          }}>Please position your face in the camera view...</p>
        )}
      </div>

      {/* News Ticker Banner */}
      <div style={{
        position: 'absolute',
        bottom: '0px',
        left: 0,
        width: '100%',
        height: '60px',
        backgroundColor: 'black',
        overflow: 'hidden',
        zIndex: 2
      }}>
        <div style={{
          position: 'absolute',
          whiteSpace: 'nowrap',
          animation: 'ticker 75s linear infinite',
          color: 'white',
          fontSize: '33px',
          lineHeight: '60px',
        }}>
          THIS IS YOUR PRESENT AND IT IS PROGRESSIVE 
          &nbsp;&nbsp;&nbsp;&nbsp; THIS IS YOUR PRESENT AND IT IS PROGRESSIVE 
          &nbsp;&nbsp;&nbsp;&nbsp; THIS IS YOUR PRESENT AND IT IS PROGRESSIVE 
          &nbsp;&nbsp;&nbsp;&nbsp; THIS IS YOUR PRESENT AND IT IS PROGRESSIVE 
          &nbsp;&nbsp;&nbsp;&nbsp; THIS IS YOUR PRESENT AND IT IS PROGRESSIVE 
          &nbsp;&nbsp;&nbsp;&nbsp; THIS IS YOUR PRESENT AND IT IS PROGRESSIVE
          &nbsp;&nbsp;&nbsp;&nbsp; THIS IS YOUR PRESENT AND IT IS PROGRESSIVE 
          &nbsp;&nbsp;&nbsp;&nbsp; THIS IS YOUR PRESENT AND IT IS PROGRESSIVE 
          &nbsp;&nbsp;&nbsp;&nbsp; THIS IS YOUR PRESENT AND IT IS PROGRESSIVE 
          &nbsp;&nbsp;&nbsp;&nbsp; THIS IS YOUR PRESENT AND IT IS PROGRESSIVE 
          &nbsp;&nbsp;&nbsp;&nbsp; THIS IS YOUR PRESENT AND IT IS PROGRESSIVE
          &nbsp;&nbsp;&nbsp;&nbsp; THIS IS YOUR PRESENT AND IT IS PROGRESSIVE 
          &nbsp;&nbsp;&nbsp;&nbsp; THIS IS YOUR PRESENT AND IT IS PROGRESSIVE 
          &nbsp;&nbsp;&nbsp;&nbsp; THIS IS YOUR PRESENT AND IT IS PROGRESSIVE 
          &nbsp;&nbsp;&nbsp;&nbsp; THIS IS YOUR PRESENT AND IT IS PROGRESSIVE 
          &nbsp;&nbsp;&nbsp;&nbsp; THIS IS YOUR PRESENT AND IT IS PROGRESSIVE
          &nbsp;&nbsp;&nbsp;&nbsp; THIS IS YOUR PRESENT AND IT IS PROGRESSIVE 
          &nbsp;&nbsp;&nbsp;&nbsp; THIS IS YOUR PRESENT AND IT IS PROGRESSIVE 
          &nbsp;&nbsp;&nbsp;&nbsp; THIS IS YOUR PRESENT AND IT IS PROGRESSIVE 
          &nbsp;&nbsp;&nbsp;&nbsp; THIS IS YOUR PRESENT AND IT IS PROGRESSIVE 
          &nbsp;&nbsp;&nbsp;&nbsp; THIS IS YOUR PRESENT AND IT IS PROGRESSIVE
          &nbsp;&nbsp;&nbsp;&nbsp; THIS IS YOUR PRESENT AND IT IS PROGRESSIVE 
          &nbsp;&nbsp;&nbsp;&nbsp; THIS IS YOUR PRESENT AND IT IS PROGRESSIVE 
          &nbsp;&nbsp;&nbsp;&nbsp; THIS IS YOUR PRESENT AND IT IS PROGRESSIVE 
          &nbsp;&nbsp;&nbsp;&nbsp; THIS IS YOUR PRESENT AND IT IS PROGRESSIVE 
          &nbsp;&nbsp;&nbsp;&nbsp; THIS IS YOUR PRESENT AND IT IS PROGRESSIVE
          
        </div>
        <style>
          {`
            @keyframes ticker {
              0% { transform: translateX(0); }
              100% { transform: translateX(-100%); }
            }
          `}
        </style>
      </div>
    </div>
  );
};

export default IntroStage; 