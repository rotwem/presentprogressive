import React, { useEffect } from 'react';
import { getFileUrl } from './config';

interface IntroStageProps {
  faceDetected: boolean;
  blinkDetected: boolean;
  onIntroComplete: () => void;
  dayNumber: number;
}

const IntroStage: React.FC<IntroStageProps> = ({
  faceDetected,
  blinkDetected,
  onIntroComplete,
  dayNumber
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
      {/* Background Image - shown when face is detected */}
      { (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: `url(${getFileUrl("/BOLD3.png")})`,
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundColor: faceDetected ? 'white' : 'white',
          filter: faceDetected ? 'none' : 'invert(1)',
          backgroundRepeat: 'no-repeat',
          zIndex: 0
        }} />
      )}

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
          <div>
            {/* <p style={{ 
              margin: 0,
              fontSize: '7.5vw'
            }}>wink to start</p> */}
            <p className='wink-text' style={{ 
              margin: 0,
            }}>Wink to start</p>
            {/* Day #0 indicator over the red rectangle */}
            <p
              className='wink-text'
              style={{
                position: 'absolute',
                textAlign: 'right',
                alignContent: 'right',
                top: '65%', // Adjust as needed for vertical placement
                left: '66.5%', // Adjust as needed for horizontal placement
                margin: 0,
                zIndex: 2,
                transform: 'translateY(-50%)'
              }}
            >
              day #{dayNumber}
            </p>
            {/* <p
              className='wink-text'
              style={{
                position: 'absolute',
                textAlign: 'left',
                alignContent: 'left',
                top: '93%', // Adjust as needed for vertical placement
                left: '50%%', // Adjust as needed for horizontal placement
                margin: 0,
                width: '100%',
                zIndex: 2,
                // transform: 'translateY(-50%)'
              }}
            >
              ( 'r' = restart )
            </p> */}
          </div>
        ) : (
          <p className='wink-text' style={{ 
            margin: 0,
            width: '100%',
            // fontSize: '3vw',
          }}>position your face in the camera view</p>
        )}
      </div>

      {/* News Ticker Banner */}
      {/* <div style={{
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
      </div> */}
    </div>
  );
};

export default IntroStage; 