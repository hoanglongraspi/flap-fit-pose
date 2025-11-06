// Physics constants
export const GRAVITY = 0.6;
export const JUMP_FORCE = -10;
export const TERMINAL_VELOCITY = 15;

// Game dimensions
export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;
export const BIRD_SIZE = 40;
export const PIPE_WIDTH = 80;
export const PIPE_GAP_START = 200;
export const PIPE_GAP_MIN = 140;
export const PIPE_GAP_DECREASE = 2;
export const PIPE_SPEED = 3;
export const PIPE_SPACING = 250;

// Pose detection thresholds
export const SQUAT_THRESHOLD = 0.15; // Hip drop as fraction of torso length
export const ARM_RAISE_THRESHOLD = 0.1; // Time in seconds
export const VELOCITY_THRESHOLD = 0.08; // Fast upward movement
export const FLAP_DEBOUNCE = 300; // ms
export const POSE_CONFIDENCE_MIN = 0.5;
export const OUT_OF_FRAME_TIMEOUT = 2000; // ms

// Calibration
export const CALIBRATION_FRAMES = 60; // 2 seconds at 30fps
export const CALIBRATION_COUNTDOWN = 3; // seconds

// Scoring
export const SCORE_INCREMENT = 1;
export const MET_VALUE = 5.0; // Metabolic equivalent for this activity
export const CALORIE_WEIGHT_KG = 70; // Average weight for calculation

// Visual
export const BIRD_COLOR = '#FF6B35';
export const PIPE_COLOR = '#00D9FF';
export const BACKGROUND_GRADIENT_START = '#1a1a2e';
export const BACKGROUND_GRADIENT_END = '#0f0f1e';

// Performance
export const TARGET_FPS = 60;
export const POSE_FPS = 30;
export const SMOOTHING_FACTOR = 0.3; // For exponential smoothing
