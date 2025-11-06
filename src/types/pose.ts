export interface PoseLandmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

export interface PoseResults {
  poseLandmarks: PoseLandmark[];
  poseWorldLandmarks?: PoseLandmark[];
}

export interface CalibrationData {
  torsoLength: number;
  baselineHipY: number;
  baselineShoulderY: number;
  timestamp: number;
}

export interface FlapDetection {
  type: 'squat' | 'arm_raise' | 'keyboard';
  confidence: number;
  timestamp: number;
}

export enum GameState {
  MENU = 'MENU',
  CALIBRATE = 'CALIBRATE',
  COUNTDOWN = 'COUNTDOWN',
  PLAY = 'PLAY',
  PAUSE = 'PAUSE',
  GAME_OVER = 'GAME_OVER',
}

export interface GameMetrics {
  score: number;
  bestScore: number;
  fps: number;
  poseConfidence: number;
  latency: number;
  calories: number;
  flaps: number;
}
