import { Button } from '@/components/ui/button';
import { GameMetrics } from '@/types/pose';
import { RotateCcw, Trophy, Flame, Activity } from 'lucide-react';

interface GameOverScreenProps {
  metrics: GameMetrics;
  onRestart: () => void;
}

export const GameOverScreen = ({ metrics, onRestart }: GameOverScreenProps) => {
  const isNewRecord = metrics.score === metrics.bestScore && metrics.score > 0;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-40 bg-background/95 backdrop-blur-sm">
      <div className="text-center space-y-6 max-w-md px-6">
        <div className="space-y-2">
          <h2 className="text-4xl font-bold text-foreground">Game Over!</h2>
          {isNewRecord && (
            <p className="text-accent font-semibold text-lg animate-pulse-glow">
              🎉 New Record!
            </p>
          )}
        </div>

        <div className="bg-card/80 backdrop-blur-xl rounded-2xl p-6 border border-primary/20 shadow-glow space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Trophy className="w-8 h-8 text-primary" />
            <div>
              <div className="text-5xl font-bold gradient-primary bg-clip-text text-transparent">
                {metrics.score}
              </div>
              <div className="text-sm text-muted-foreground">Points</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-2 text-accent">
                <Flame className="w-5 h-5" />
                <span className="text-2xl font-bold">{metrics.calories}</span>
              </div>
              <p className="text-xs text-muted-foreground">Calories Burned</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-center gap-2 text-secondary">
                <Activity className="w-5 h-5" />
                <span className="text-2xl font-bold">{metrics.flaps}</span>
              </div>
              <p className="text-xs text-muted-foreground">Total Flaps</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            size="lg"
            onClick={onRestart}
            className="w-full gradient-primary text-white font-bold text-lg py-6 h-auto rounded-xl shadow-intense hover:scale-105 transition-bounce"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Play Again
          </Button>

          <p className="text-sm text-muted-foreground">
            Best Score: {metrics.bestScore}
          </p>
        </div>
      </div>
    </div>
  );
};
