import { Bird } from './Bird';
import { Pipe } from './Pipe';
import { GameState, GameMetrics } from '@/types/pose';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  PIPE_GAP_START,
  PIPE_GAP_MIN,
  PIPE_GAP_DECREASE,
  PIPE_SPACING,
  SCORE_INCREMENT,
  MET_VALUE,
  CALORIE_WEIGHT_KG,
} from '@/constants/game';

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private bird: Bird;
  private pipes: Pipe[] = [];
  private gameState: GameState = GameState.MENU;
  private metrics: GameMetrics = {
    score: 0,
    bestScore: 0,
    fps: 0,
    poseConfidence: 0,
    latency: 0,
    calories: 0,
    flaps: 0,
  };
  
  private lastFrameTime = 0;
  private frameCount = 0;
  private fpsUpdateTime = 0;
  private gameStartTime = 0;
  
  private onStateChangeCallback: ((state: GameState) => void) | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');
    this.ctx = ctx;
    
    // Set canvas size
    this.canvas.width = CANVAS_WIDTH;
    this.canvas.height = CANVAS_HEIGHT;
    
    // Initialize bird
    this.bird = new Bird(CANVAS_WIDTH / 4, CANVAS_HEIGHT / 2);
    
    // Load best score
    const saved = localStorage.getItem('fitfly_best_score');
    if (saved) {
      this.metrics.bestScore = parseInt(saved, 10);
    }
  }

  setOnStateChange(callback: (state: GameState) => void) {
    this.onStateChangeCallback = callback;
  }

  setState(newState: GameState) {
    this.gameState = newState;
    if (this.onStateChangeCallback) {
      this.onStateChangeCallback(newState);
    }
  }

  startGame() {
    this.setState(GameState.PLAY);
    this.bird.reset(CANVAS_WIDTH / 4, CANVAS_HEIGHT / 2);
    this.pipes = [];
    this.metrics.score = 0;
    this.metrics.calories = 0;
    this.metrics.flaps = 0;
    this.gameStartTime = Date.now();
    this.spawnPipe();
  }

  flap() {
    if (this.gameState === GameState.PLAY) {
      this.bird.flap();
      this.metrics.flaps++;
      this.updateCalories();
    }
  }

  pause() {
    if (this.gameState === GameState.PLAY) {
      this.setState(GameState.PAUSE);
    }
  }

  resume() {
    if (this.gameState === GameState.PAUSE) {
      this.setState(GameState.PLAY);
    }
  }

  update() {
    const now = performance.now();
    const deltaTime = now - this.lastFrameTime;
    this.lastFrameTime = now;

    // Update FPS
    this.frameCount++;
    if (now - this.fpsUpdateTime > 1000) {
      this.metrics.fps = this.frameCount;
      this.frameCount = 0;
      this.fpsUpdateTime = now;
    }

    if (this.gameState !== GameState.PLAY) {
      return;
    }

    // Update bird
    this.bird.update();

    // Update pipes
    this.pipes.forEach((pipe) => pipe.update());

    // Remove off-screen pipes
    this.pipes = this.pipes.filter((pipe) => !pipe.isOffScreen());

    // Spawn new pipes
    const lastPipe = this.pipes[this.pipes.length - 1];
    if (!lastPipe || lastPipe.x < CANVAS_WIDTH - PIPE_SPACING) {
      this.spawnPipe();
    }

    // Check scoring
    this.pipes.forEach((pipe) => {
      if (pipe.hasPassedBird(this.bird.x)) {
        this.metrics.score += SCORE_INCREMENT;
        pipe.markScored();
        
        // Update best score
        if (this.metrics.score > this.metrics.bestScore) {
          this.metrics.bestScore = this.metrics.score;
          localStorage.setItem('fitfly_best_score', this.metrics.bestScore.toString());
        }
      }
    });

    // Check collisions
    const birdBounds = this.bird.getBounds();
    const collision = this.pipes.some((pipe) => pipe.collidesWith(birdBounds));
    
    // Check ground/ceiling collision
    if (birdBounds.top <= 0 || birdBounds.bottom >= CANVAS_HEIGHT || collision) {
      this.gameOver();
    }
  }

  draw() {
    // Clear canvas
    this.ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw gradient background
    const gradient = this.ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, '#1e293b');
    gradient.addColorStop(1, '#0f172a');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw stars
    this.drawStars();

    // Draw pipes
    this.pipes.forEach((pipe) => pipe.draw(this.ctx));

    // Draw bird
    this.bird.draw(this.ctx);

    // Draw ground line
    this.ctx.strokeStyle = '#00D9FF';
    this.ctx.lineWidth = 2;
    this.ctx.setLineDash([5, 5]);
    this.ctx.beginPath();
    this.ctx.moveTo(0, CANVAS_HEIGHT - 1);
    this.ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT - 1);
    this.ctx.stroke();
    this.ctx.setLineDash([]);
  }

  private drawStars() {
    // Simple star field
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    for (let i = 0; i < 50; i++) {
      const x = (i * 37) % CANVAS_WIDTH;
      const y = (i * 23) % CANVAS_HEIGHT;
      const size = (i % 3) + 1;
      this.ctx.fillRect(x, y, size, size);
    }
  }

  private spawnPipe() {
    const gapHeight = Math.max(
      PIPE_GAP_MIN,
      PIPE_GAP_START - this.metrics.score * PIPE_GAP_DECREASE
    );
    
    const minY = 50;
    const maxY = CANVAS_HEIGHT - gapHeight - 50;
    const gapY = Math.random() * (maxY - minY) + minY;
    
    this.pipes.push(new Pipe(CANVAS_WIDTH, gapY, gapHeight));
  }

  private gameOver() {
    this.setState(GameState.GAME_OVER);
  }

  private updateCalories() {
    const durationMinutes = (Date.now() - this.gameStartTime) / 60000;
    this.metrics.calories = Math.round(
      MET_VALUE * CALORIE_WEIGHT_KG * durationMinutes
    );
  }

  updatePoseMetrics(confidence: number, latency: number) {
    this.metrics.poseConfidence = confidence;
    this.metrics.latency = latency;
  }

  getMetrics(): GameMetrics {
    return { ...this.metrics };
  }

  getState(): GameState {
    return this.gameState;
  }
}
