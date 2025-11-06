import { Progress } from '@/components/ui/progress';
import { Camera } from 'lucide-react';

interface CalibrationScreenProps {
  progress: number;
}

export const CalibrationScreen = ({ progress }: CalibrationScreenProps) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-40 bg-background/95 backdrop-blur-sm">
      <div className="text-center space-y-6 max-w-md px-6">
        <div className="w-20 h-20 mx-auto bg-secondary/20 rounded-full flex items-center justify-center animate-pulse-glow">
          <Camera className="w-10 h-10 text-secondary" />
        </div>

        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-foreground">Calibrating...</h2>
          <p className="text-muted-foreground">
            Stand in a neutral position. We're measuring your baseline pose.
          </p>
        </div>

        <div className="space-y-2">
          <Progress value={progress * 100} className="h-3" />
          <p className="text-sm text-muted-foreground">
            {Math.round(progress * 100)}% Complete
          </p>
        </div>

        <div className="bg-card/50 backdrop-blur-xl rounded-xl p-4 border border-secondary/20">
          <p className="text-sm text-muted-foreground">
            💡 Stand comfortably with arms at your sides
          </p>
        </div>
      </div>
    </div>
  );
};
