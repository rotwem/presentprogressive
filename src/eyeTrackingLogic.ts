// Eye tracking utility functions

import { 
  NormalizedLandmark, 
  GazePoint, 
  SCREEN_WIDTH, 
  SCREEN_HEIGHT,
  EMA_ALPHA
} from './types';

export const calculateEAR = (landmarks: NormalizedLandmark[], indices: number[]): number => {
  try {
    for (const index of indices) {
      if (!landmarks[index]) {
        return 0.3;
      }
    }
    
    const pts = indices.map(i => ({ x: landmarks[i].x, y: landmarks[i].y }));
    const A = Math.sqrt(Math.pow(pts[1].x - pts[5].x, 2) + Math.pow(pts[1].y - pts[5].y, 2));
    const B = Math.sqrt(Math.pow(pts[2].x - pts[4].x, 2) + Math.pow(pts[2].y - pts[4].y, 2));
    const C = Math.sqrt(Math.pow(pts[0].x - pts[3].x, 2) + Math.pow(pts[0].y - pts[3].y, 2));
    
    if (C === 0) return 0.3;
    
    return (A + B) / (2.0 * C);
  } catch (error) {
    return 0.3;
  }
};

export const getEyeCenter = (landmarks: NormalizedLandmark[], indices: number[]): GazePoint => {
  try {
    const validLandmarks = indices.filter(i => landmarks[i]).map(i => landmarks[i]);
    
    if (validLandmarks.length === 0) {
      return { x: 0.5, y: 0.5 };
    }
    
    const avgX = validLandmarks.reduce((sum, lm) => sum + lm.x, 0) / validLandmarks.length;
    const avgY = validLandmarks.reduce((sum, lm) => sum + lm.y, 0) / validLandmarks.length;
    
    return { x: avgX, y: avgY };
  } catch (error) {
    return { x: 0.5, y: 0.5 };
  }
};

export const enhancedMapToScreen = (eyeCenter: GazePoint): GazePoint => {
  const aggressiveZoom = 3.0;
  const xStretch = 0.5 + (eyeCenter.x - 0.5) * aggressiveZoom;
  const yStretch = 0.5 + (eyeCenter.y - 0.5) * aggressiveZoom;
  const xClamped = Math.max(0, Math.min(1, xStretch));
  const yClamped = Math.max(0, Math.min(1, yStretch));
  return {
    x: xClamped * SCREEN_WIDTH,
    y: yClamped * SCREEN_HEIGHT
  };
};

export const remapPoint = (rawPoint: GazePoint, bounds: any): GazePoint => {
  const mappedX = ((rawPoint.x - bounds.minX) / (bounds.maxX - bounds.minX)) * SCREEN_WIDTH;
  const mappedY = ((rawPoint.y - bounds.minY) / (bounds.maxY - bounds.minY)) * SCREEN_HEIGHT;
  return {
    x: Math.max(0, Math.min(SCREEN_WIDTH, mappedX)),
    y: Math.max(0, Math.min(SCREEN_HEIGHT, mappedY))
  };
};

export const applyEmaSmoothing = (
  newValue: GazePoint | number, 
  currentEma: GazePoint | number | null
): GazePoint | number => {
  if (!currentEma) {
    return newValue;
  }
  
  if (typeof newValue === 'number' && typeof currentEma === 'number') {
    return EMA_ALPHA * newValue + (1 - EMA_ALPHA) * currentEma;
  }
  
  if (typeof newValue === 'object' && typeof currentEma === 'object') {
    return {
      x: EMA_ALPHA * newValue.x + (1 - EMA_ALPHA) * currentEma.x,
      y: EMA_ALPHA * newValue.y + (1 - EMA_ALPHA) * currentEma.y
    };
  }
  
  return newValue;
};