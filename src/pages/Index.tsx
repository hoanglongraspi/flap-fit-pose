import { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine } from '@/game/GameEngine';
import { PoseController } from '@/pose/poseController';
import { GameState } from '@/types/pose';
import { GameCanvas } from '@/components/GameCanvas';
import { PoseOverlay } from '@/components/PoseOverlay';
import { HUD } from '@/components/HUD';
import { MenuScreen } from '@/components/MenuScreen';
import { CalibrationScreen } from '@/components/CalibrationScreen';
import { CountdownScreen } from '@/components/CountdownScreen';
import { GameOverScreen } from '@/components/GameOverScreen';
import { Button } from '@/components/ui/button';
import { Pause, Play } from 'lucide-react';
import { toast } from 'sonner';

const Index = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [metrics, setMetrics] = useState({
    score: 0,
    bestScore: 0,
    fps: 0,
    poseConfidence: 0,
    latency: 0,
    calories: 0,
    flaps: 0,
  });
  const [calibrationProgress, setCalibrationProgress] = useState(0);
  const [countdown, setCountdown] = useState(3);

  const gameEngineRef = useRef<GameEngine | null>(null);
  const poseControllerRef = useRef<PoseController | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const animationFrameRef = useRef<number>();

  const handleCanvasReady = useCallback((canvas: HTMLCanvasElement) => {
    if (!gameEngineRef.current) {
      gameEngineRef.current = new GameEngine(canvas);
      gameEngineRef.current.setOnStateChange(setGameState);
      startGameLoop();
    }
  }, []);

  const handlePoseCanvasReady = useCallback((canvas: HTMLCanvasElement) => {
    if (!poseControllerRef.current && !videoRef.current) {
      const video = document.createElement('video');
      video.style.display = 'none';
      document.body.appendChild(video);
      videoRef.current = video;

      poseControllerRef.current = new PoseController();
    }
  }, []);

  const initializePose = async () => {
    if (!poseControllerRef.current || !videoRef.current) return;

    const poseCanvas = document.querySelector('canvas[width="640"]') as HTMLCanvasElement;
    if (!poseCanvas) return;

    try {
      await poseControllerRef.current.initialize(
        videoRef.current,
        poseCanvas,
        (detection) => {
          if (gameEngineRef.current) {
            gameEngineRef.current.flap();
            toast.success(`${detection.type === 'squat' ? '🏋️' : '💪'} Flap!`, {
              duration: 500,
            });
          }
        },
        (results) => {
          // Pose results callback
          const avgVisibility = results.poseLandmarks.reduce(
            (sum, lm) => sum + (lm.visibility || 0),
            0
          ) / results.poseLandmarks.length;
          
          if (gameEngineRef.current) {
            gameEngineRef.current.updatePoseMetrics(avgVisibility, 0);
          }
        }
      );
      
      toast.success('Camera connected!');
    } catch (error) {
      console.error('Failed to initialize pose detection:', error);
      toast.error('Failed to access camera. Using keyboard controls.');
    }
  };

  const startGameLoop = () => {
    const loop = () => {
      if (gameEngineRef.current) {
        gameEngineRef.current.update();
        gameEngineRef.current.draw();
        setMetrics(gameEngineRef.current.getMetrics());
      }
      animationFrameRef.current = requestAnimationFrame(loop);
    };
    loop();
  };

  const handleStart = async () => {
    await initializePose();
    setGameState(GameState.CALIBRATE);
    
    // Start calibration
    if (poseControllerRef.current) {
      poseControllerRef.current.startCalibration();
      
      const calibrationInterval = setInterval(() => {
        if (poseControllerRef.current) {
          const progress = poseControllerRef.current.updateCalibration();
          setCalibrationProgress(progress);
          
          if (progress >= 1) {
            clearInterval(calibrationInterval);
            startCountdown();
          }
        }
      }, 33); // ~30fps
    }
  };

  const startCountdown = () => {
    setGameState(GameState.COUNTDOWN);
    setCountdown(3);
    
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          if (gameEngineRef.current) {
            gameEngineRef.current.startGame();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleRestart = () => {
    if (gameEngineRef.current) {
      gameEngineRef.current.startGame();
    }
  };

  const handlePauseResume = () => {
    if (!gameEngineRef.current) return;
    
    if (gameState === GameState.PLAY) {
      gameEngineRef.current.pause();
    } else if (gameState === GameState.PAUSE) {
      gameEngineRef.current.resume();
    }
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (poseControllerRef.current && gameState === GameState.PLAY) {
          poseControllerRef.current.handleKeyboardFlap();
          if (gameEngineRef.current) {
            gameEngineRef.current.flap();
          }
        }
      }
      
      if (e.key === 'p' || e.key === 'P') {
        handlePauseResume();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState]);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (poseControllerRef.current) {
        poseControllerRef.current.destroy();
      }
      if (videoRef.current) {
        videoRef.current.remove();
      }
    };
  }, []);

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6 text-center">
          <h1 className="text-4xl font-bold gradient-primary bg-clip-text text-transparent mb-2">
            FitFly
          </h1>
          <p className="text-muted-foreground">AI-Powered Workout Game</p>
        </header>

        <div className="grid lg:grid-cols-[1fr,300px] gap-6">
          <div className="space-y-6">
            <GameCanvas onCanvasReady={handleCanvasReady} />
            
            {gameState === GameState.PLAY || gameState === GameState.PAUSE ? (
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handlePauseResume}
                  className="font-semibold"
                >
                  {gameState === GameState.PAUSE ? (
                    <>
                      <Play className="w-5 h-5 mr-2" />
                      Resume
                    </>
                  ) : (
                    <>
                      <Pause className="w-5 h-5 mr-2" />
                      Pause
                    </>
                  )}
                </Button>
              </div>
            ) : null}
          </div>

          <div className="space-y-6">
            <HUD metrics={metrics} />
            <PoseOverlay onCanvasReady={handlePoseCanvasReady} />
          </div>
        </div>
      </div>

      {gameState === GameState.MENU && <MenuScreen onStart={handleStart} />}
      {gameState === GameState.CALIBRATE && (
        <CalibrationScreen progress={calibrationProgress} />
      )}
      {gameState === GameState.COUNTDOWN && <CountdownScreen count={countdown} />}
      {gameState === GameState.GAME_OVER && (
        <GameOverScreen metrics={metrics} onRestart={handleRestart} />
      )}
    </div>
  );
};

export default Index;
