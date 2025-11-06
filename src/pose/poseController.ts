import { Pose, Results } from '@mediapipe/pose';
import { Camera } from '@mediapipe/camera_utils';
import { PoseLandmark, PoseResults, CalibrationData, FlapDetection } from '@/types/pose';
import {
  SQUAT_THRESHOLD,
  ARM_RAISE_THRESHOLD,
  VELOCITY_THRESHOLD,
  FLAP_DEBOUNCE,
  POSE_CONFIDENCE_MIN,
  SMOOTHING_FACTOR,
  CALIBRATION_FRAMES,
} from '@/constants/game';

export class PoseController {
  private pose: Pose | null = null;
  private camera: Camera | null = null;
  private videoElement: HTMLVideoElement | null = null;
  private canvasElement: HTMLCanvasElement | null = null;
  private canvasCtx: CanvasRenderingContext2D | null = null;
  
  private lastResults: PoseResults | null = null;
  private calibrationData: CalibrationData | null = null;
  private calibrationFrames: PoseLandmark[][] = [];
  
  private lastFlapTime = 0;
  private armRaiseStartTime = 0;
  private lastHipY = 0;
  private smoothedHipY = 0;
  
  private isInitialized = false;
  private onFlapCallback: ((detection: FlapDetection) => void) | null = null;
  private onResultsCallback: ((results: PoseResults) => void) | null = null;

  async initialize(
    videoElement: HTMLVideoElement,
    canvasElement: HTMLCanvasElement,
    onFlap: (detection: FlapDetection) => void,
    onResults: (results: PoseResults) => void
  ) {
    this.videoElement = videoElement;
    this.canvasElement = canvasElement;
    this.canvasCtx = canvasElement.getContext('2d');
    this.onFlapCallback = onFlap;
    this.onResultsCallback = onResults;

    this.pose = new Pose({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
      },
    });

    this.pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: false,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    this.pose.onResults(this.onPoseResults.bind(this));

    try {
      this.camera = new Camera(videoElement, {
        onFrame: async () => {
          if (this.pose) {
            await this.pose.send({ image: videoElement });
          }
        },
        width: 640,
        height: 480,
      });
      await this.camera.start();
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize camera:', error);
      throw error;
    }
  }

  private onPoseResults(results: Results) {
    if (!results.poseLandmarks || !this.canvasCtx || !this.canvasElement) return;

    const landmarks: PoseLandmark[] = results.poseLandmarks.map((lm: any) => ({
      x: lm.x,
      y: lm.y,
      z: lm.z,
      visibility: lm.visibility,
    }));

    this.lastResults = { poseLandmarks: landmarks };
    
    // Draw on canvas
    this.drawResults(landmarks);
    
    // Notify callback
    if (this.onResultsCallback) {
      this.onResultsCallback(this.lastResults);
    }

    // Detect flaps if calibrated
    if (this.calibrationData) {
      this.detectFlaps(landmarks);
    }
  }

  private drawResults(landmarks: PoseLandmark[]) {
    if (!this.canvasCtx || !this.canvasElement || !this.videoElement) return;

    const ctx = this.canvasCtx;
    const canvas = this.canvasElement;
    
    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Mirror the canvas
    ctx.scale(-1, 1);
    ctx.translate(-canvas.width, 0);
    
    // Draw video
    ctx.drawImage(this.videoElement, 0, 0, canvas.width, canvas.height);
    
    // Draw skeleton
    ctx.strokeStyle = '#00D9FF';
    ctx.lineWidth = 3;
    ctx.fillStyle = '#FF6B35';
    
    // Draw connections
    const connections = [
      [11, 12], [11, 13], [13, 15], [12, 14], [14, 16], // Arms
      [11, 23], [12, 24], [23, 24], // Torso
      [23, 25], [25, 27], [24, 26], [26, 28], // Legs
    ];
    
    connections.forEach(([start, end]) => {
      const startLm = landmarks[start];
      const endLm = landmarks[end];
      if (startLm && endLm && startLm.visibility && endLm.visibility) {
        ctx.beginPath();
        ctx.moveTo(startLm.x * canvas.width, startLm.y * canvas.height);
        ctx.lineTo(endLm.x * canvas.width, endLm.y * canvas.height);
        ctx.stroke();
      }
    });
    
    // Draw landmarks
    landmarks.forEach((lm) => {
      if (lm.visibility && lm.visibility > 0.5) {
        ctx.beginPath();
        ctx.arc(lm.x * canvas.width, lm.y * canvas.height, 5, 0, 2 * Math.PI);
        ctx.fill();
      }
    });
    
    ctx.restore();
  }

  startCalibration() {
    this.calibrationFrames = [];
    this.calibrationData = null;
  }

  updateCalibration(): number {
    if (!this.lastResults) return 0;
    
    this.calibrationFrames.push(this.lastResults.poseLandmarks);
    
    if (this.calibrationFrames.length >= CALIBRATION_FRAMES) {
      this.completeCalibration();
    }
    
    return this.calibrationFrames.length / CALIBRATION_FRAMES;
  }

  private completeCalibration() {
    if (this.calibrationFrames.length === 0) return;

    // Average measurements across all calibration frames
    let totalTorsoLength = 0;
    let totalHipY = 0;
    let totalShoulderY = 0;

    this.calibrationFrames.forEach((landmarks) => {
      const leftShoulder = landmarks[11];
      const rightShoulder = landmarks[12];
      const leftHip = landmarks[23];
      const rightHip = landmarks[24];

      if (leftShoulder && rightShoulder && leftHip && rightHip) {
        const shoulderY = (leftShoulder.y + rightShoulder.y) / 2;
        const hipY = (leftHip.y + rightHip.y) / 2;
        const torsoLength = Math.abs(hipY - shoulderY);

        totalTorsoLength += torsoLength;
        totalHipY += hipY;
        totalShoulderY += shoulderY;
      }
    });

    const count = this.calibrationFrames.length;
    this.calibrationData = {
      torsoLength: totalTorsoLength / count,
      baselineHipY: totalHipY / count,
      baselineShoulderY: totalShoulderY / count,
      timestamp: Date.now(),
    };

    this.smoothedHipY = this.calibrationData.baselineHipY;
  }

  private detectFlaps(landmarks: PoseLandmark[]) {
    if (!this.calibrationData) return;

    const now = Date.now();
    if (now - this.lastFlapTime < FLAP_DEBOUNCE) return;

    // Check confidence
    const avgVisibility = landmarks.reduce((sum, lm) => sum + (lm.visibility || 0), 0) / landmarks.length;
    if (avgVisibility < POSE_CONFIDENCE_MIN) return;

    // Get key landmarks
    const leftHip = landmarks[23];
    const rightHip = landmarks[24];
    const leftWrist = landmarks[15];
    const rightWrist = landmarks[16];
    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];

    if (!leftHip || !rightHip || !leftShoulder || !rightShoulder) return;

    const currentHipY = (leftHip.y + rightHip.y) / 2;
    const currentShoulderY = (leftShoulder.y + rightShoulder.y) / 2;

    // Exponential smoothing
    this.smoothedHipY = SMOOTHING_FACTOR * currentHipY + (1 - SMOOTHING_FACTOR) * this.smoothedHipY;

    // Detect squat
    const hipDrop = this.smoothedHipY - this.calibrationData.baselineHipY;
    const normalizedDrop = hipDrop / this.calibrationData.torsoLength;

    if (normalizedDrop > SQUAT_THRESHOLD) {
      this.triggerFlap({ type: 'squat', confidence: avgVisibility, timestamp: now });
      return;
    }

    // Detect arm raise
    if (leftWrist && rightWrist) {
      const wristsAboveShoulders =
        leftWrist.y < currentShoulderY && rightWrist.y < currentShoulderY;

      if (wristsAboveShoulders) {
        if (this.armRaiseStartTime === 0) {
          this.armRaiseStartTime = now;
        } else if ((now - this.armRaiseStartTime) / 1000 >= ARM_RAISE_THRESHOLD) {
          this.triggerFlap({ type: 'arm_raise', confidence: avgVisibility, timestamp: now });
          this.armRaiseStartTime = 0;
          return;
        }
      } else {
        this.armRaiseStartTime = 0;
      }
    }

    // Detect velocity
    if (this.lastHipY > 0) {
      const velocity = this.lastHipY - currentHipY; // Positive = moving up
      const normalizedVelocity = velocity / this.calibrationData.torsoLength;

      if (normalizedVelocity > VELOCITY_THRESHOLD) {
        this.triggerFlap({ type: 'squat', confidence: avgVisibility, timestamp: now });
        return;
      }
    }

    this.lastHipY = currentHipY;
  }

  private triggerFlap(detection: FlapDetection) {
    this.lastFlapTime = detection.timestamp;
    if (this.onFlapCallback) {
      this.onFlapCallback(detection);
    }
  }

  handleKeyboardFlap() {
    const now = Date.now();
    if (now - this.lastFlapTime < FLAP_DEBOUNCE) return;
    
    this.triggerFlap({
      type: 'keyboard',
      confidence: 1,
      timestamp: now,
    });
  }

  getCalibrationData(): CalibrationData | null {
    return this.calibrationData;
  }

  getLastResults(): PoseResults | null {
    return this.lastResults;
  }

  isReady(): boolean {
    return this.isInitialized && this.lastResults !== null;
  }

  destroy() {
    if (this.camera) {
      this.camera.stop();
    }
    if (this.pose) {
      this.pose.close();
    }
  }
}
