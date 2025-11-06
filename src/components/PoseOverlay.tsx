import { useEffect, useRef } from 'react';

interface PoseOverlayProps {
  onCanvasReady: (canvas: HTMLCanvasElement) => void;
}

export const PoseOverlay = ({ onCanvasReady }: PoseOverlayProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      onCanvasReady(canvasRef.current);
    }
  }, [onCanvasReady]);

  return (
    <div className="relative rounded-2xl overflow-hidden shadow-intense border-2 border-secondary/20">
      <canvas
        ref={canvasRef}
        width={640}
        height={480}
        className="w-full h-auto bg-slate-900"
      />
      <div className="absolute top-4 left-4 px-3 py-1.5 bg-background/80 backdrop-blur rounded-lg border border-secondary/30">
        <p className="text-xs font-medium text-secondary">Pose Detection</p>
      </div>
    </div>
  );
};
