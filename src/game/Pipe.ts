import { PIPE_WIDTH, PIPE_SPEED, CANVAS_HEIGHT, CANVAS_WIDTH } from '@/constants/game';

export class Pipe {
  x: number;
  gapY: number;
  gapHeight: number;
  width: number;
  scored: boolean;

  constructor(x: number, gapY: number, gapHeight: number) {
    this.x = x;
    this.gapY = gapY;
    this.gapHeight = gapHeight;
    this.width = PIPE_WIDTH;
    this.scored = false;
  }

  update() {
    this.x -= PIPE_SPEED;
  }

  draw(ctx: CanvasRenderingContext2D) {
    // Top pipe
    const gradient1 = ctx.createLinearGradient(this.x, 0, this.x + this.width, 0);
    gradient1.addColorStop(0, '#00D9FF');
    gradient1.addColorStop(0.5, '#00BFEA');
    gradient1.addColorStop(1, '#00D9FF');
    
    ctx.fillStyle = gradient1;
    ctx.fillRect(this.x, 0, this.width, this.gapY);
    
    // Add glow
    ctx.shadowColor = '#00D9FF';
    ctx.shadowBlur = 20;
    ctx.fillRect(this.x, 0, this.width, this.gapY);
    ctx.shadowBlur = 0;
    
    // Top pipe cap
    ctx.fillStyle = '#00BFEA';
    ctx.fillRect(this.x - 5, this.gapY - 20, this.width + 10, 20);

    // Bottom pipe
    const gradient2 = ctx.createLinearGradient(this.x, 0, this.x + this.width, 0);
    gradient2.addColorStop(0, '#00D9FF');
    gradient2.addColorStop(0.5, '#00BFEA');
    gradient2.addColorStop(1, '#00D9FF');
    
    ctx.fillStyle = gradient2;
    ctx.fillRect(this.x, this.gapY + this.gapHeight, this.width, CANVAS_HEIGHT - (this.gapY + this.gapHeight));
    
    // Add glow
    ctx.shadowColor = '#00D9FF';
    ctx.shadowBlur = 20;
    ctx.fillRect(this.x, this.gapY + this.gapHeight, this.width, CANVAS_HEIGHT - (this.gapY + this.gapHeight));
    ctx.shadowBlur = 0;
    
    // Bottom pipe cap
    ctx.fillStyle = '#00BFEA';
    ctx.fillRect(this.x - 5, this.gapY + this.gapHeight, this.width + 10, 20);

    // Highlight effect
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(this.x + 5, 0, 10, this.gapY);
    ctx.fillRect(this.x + 5, this.gapY + this.gapHeight, 10, CANVAS_HEIGHT - (this.gapY + this.gapHeight));
  }

  isOffScreen(): boolean {
    return this.x + this.width < 0;
  }

  hasPassedBird(birdX: number): boolean {
    return !this.scored && this.x + this.width < birdX;
  }

  collidesWith(birdBounds: { left: number; right: number; top: number; bottom: number }): boolean {
    const pipeLeft = this.x;
    const pipeRight = this.x + this.width;
    
    // Check horizontal overlap
    if (birdBounds.right < pipeLeft || birdBounds.left > pipeRight) {
      return false;
    }
    
    // Check vertical collision (bird hits top or bottom pipe)
    if (birdBounds.top < this.gapY || birdBounds.bottom > this.gapY + this.gapHeight) {
      return true;
    }
    
    return false;
  }

  markScored() {
    this.scored = true;
  }
}
