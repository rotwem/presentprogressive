import React from 'react';
import { CALIBRATION_TARGETS, CalibrationTarget } from './types';

interface CalibrationStageProps {
  currentTargetIndex: number;
  targetKeys: CalibrationTarget[];
  faceDetected: boolean;
  blinkDetected: boolean;
  calibratedPointsCount: number;
  earValue?: number;
}

const CalibrationStage: React.FC<CalibrationStageProps> = ({
  currentTargetIndex,
  targetKeys,
  faceDetected,
  blinkDetected,
  calibratedPointsCount,
  earValue
}) => {
  const renderCalibrationTarget = () => {
    if (currentTargetIndex >= targetKeys.length) return null;
    
    const targetKey = targetKeys[currentTargetIndex];
    const [x, y] = CALIBRATION_TARGETS[targetKey];
    
    return (
      <div
        className="calibration-target"
        style={{ left: x, top: y }}
      />
    );
  };

  const getInstructions = () => {
    if (currentTargetIndex < targetKeys.length) {
      const targetName = targetKeys[currentTargetIndex].replace('_', ' ');
      return (
        <>
          <div className="target-name">( {currentTargetIndex + 1}/{targetKeys.length} )</div>
          <div className="instruction-gap"></div>
          Gently turn your head to look at the
          <br/>
          <span className="target-name">( {targetName} ) </span> target and wink to calibrate
        </>
      );
    } else {
      return 'Calibration complete! Starting tracking...';
    }
  };

  return (
    <>
      {/* Calibration target */}
      <div className="tracking-overlay">
        {renderCalibrationTarget()}
      </div>

      <div className="face-indicators">
        Face: {faceDetected ? '✓' : '✗'} | 
        {blinkDetected && <span className="wink-indicator"> WINK!</span>}
        {earValue && ` | EAR: ${earValue.toFixed(3)}`}
      </div>

      <div className="restart-indicator">
        'r' = restart
      </div>

      {/* Status panel */}
        <div className="status-panel">
          <div className="status-title">Calibration Status</div>
          <div className="status-item">
            <span>Stage:</span>
            <span className="status-value">Calibration</span>
          </div>
          <div className="status-item">
            <span>Face Detected:</span>
            <span className="status-value">{faceDetected ? 'Yes' : 'No'}</span>
          </div>
          <div className="status-item">
            <span>Progress:</span>
            <span className="status-value">{calibratedPointsCount}/{targetKeys.length}</span>
          </div>
          <div className="status-item">
            <span>Current Target:</span>
            <span className="status-value">
              {currentTargetIndex < targetKeys.length 
                ? targetKeys[currentTargetIndex].replace('_', ' ')
                : 'Complete'
              }
            </span>
          </div>
        </div>

      {/* Instructions */}
      <div className="instructions">
        {getInstructions()}
      </div>
    </>
  );
};

export default CalibrationStage;