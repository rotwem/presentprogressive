// Shared types for eye tracking app

export interface NormalizedLandmark {
  x: number;
  y: number;
  z: number;
}

export interface FaceLandmarks {
  landmark: NormalizedLandmark[];
}

export interface FaceMeshResults {
  multiFaceLandmarks?: FaceLandmarks[];
}

export interface GazePoint {
  x: number;
  y: number;
}

export interface PlacedDot {
  x: number;
  y: number;
  id: number;
}

export type Stage = 'intro' | 'loading' | 'calibration' | 'morning' | 'maze' | 'test' | 'nightime' | 'outro';

export const CALIBRATION_TARGETS = {
  top_left: [100, 100],
  top_right: [window.innerWidth - 100, 100],
  bottom_left: [100, window.innerHeight - 100],
  bottom_right: [window.innerWidth - 100, window.innerHeight - 100]
} as const;

export type CalibrationTarget = keyof typeof CALIBRATION_TARGETS;

// Constants
export const SCREEN_WIDTH = window.innerWidth;
export const SCREEN_HEIGHT = window.innerHeight;
export const LEFT_EYE_INDICES = [33, 160, 158, 133, 153, 144];
export const RIGHT_EYE_INDICES = [362, 385, 387, 263, 373, 380];
export const LEFT_EYE_EAR_INDICES = [33, 160, 158, 133, 153, 144];
export const RIGHT_EYE_EAR_INDICES = [362, 385, 387, 263, 373, 380];
export const EMA_ALPHA = 0.4;
export const BLINK_THRESHOLD = 0.12;
export const MIN_BLINK_DURATION = 0.08;