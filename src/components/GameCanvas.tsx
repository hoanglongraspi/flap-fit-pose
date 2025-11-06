import { useEffect, useRef } from 'react';

interface GameCanvasProps {
  onCanvasReady: (canvas: HTMLCanvasElement) => void;
}

export const GameCanvas = ({ onCanvasReady }: GameCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      onCanvasReady(canvasRef.current);
    }
  }, [onCanvasReady]);

  return (
    <div className="relative rounded-2xl overflow-hidden shadow-intense border-2 border-primary/20">
      <canvas
        ref={canvasRef}
        className="w-full h-auto bg-gradient-to-b from-slate-800 to-slate-900"
      />
    </div>
  );
};
