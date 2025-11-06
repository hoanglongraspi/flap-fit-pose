import { Button } from '@/components/ui/button';
import { Play, Info } from 'lucide-react';

interface MenuScreenProps {
  onStart: () => void;
}

export const MenuScreen = ({ onStart }: MenuScreenProps) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-background/95 backdrop-blur-sm">
      <div className="text-center space-y-8 max-w-2xl px-6">
        <div className="space-y-4 animate-float">
          <h1 className="text-7xl font-bold gradient-primary bg-clip-text text-transparent">
            FitFly
          </h1>
          <p className="text-xl text-muted-foreground">
            Get fit while you play! Control the bird with your body.
          </p>
        </div>

        <div className="bg-card/50 backdrop-blur-xl rounded-2xl p-6 border border-primary/20 space-y-4">
          <div className="flex items-start gap-3 text-left">
            <Info className="w-5 h-5 text-secondary mt-1 flex-shrink-0" />
            <div className="space-y-2">
              <h3 className="font-semibold text-foreground">How to Play</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• <span className="text-accent font-medium">Squat down</span> to make the bird flap</li>
                <li>• <span className="text-secondary font-medium">Raise your arms</span> above shoulders to flap</li>
                <li>• Keyboard: Press <span className="font-mono bg-muted px-2 py-0.5 rounded">Space</span> or <span className="font-mono bg-muted px-2 py-0.5 rounded">↑</span></li>
                <li>• Avoid the pipes and stay in the air!</li>
              </ul>
            </div>
          </div>
        </div>

        <Button
          size="lg"
          onClick={onStart}
          className="gradient-primary text-white font-bold text-lg px-8 py-6 h-auto rounded-xl shadow-intense hover:scale-105 transition-bounce"
        >
          <Play className="w-6 h-6 mr-2" />
          Start Workout
        </Button>

        <p className="text-xs text-muted-foreground">
          Allow camera access when prompted for pose detection
        </p>
      </div>
    </div>
  );
};
