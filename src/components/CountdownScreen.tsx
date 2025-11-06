interface CountdownScreenProps {
  count: number;
}

export const CountdownScreen = ({ count }: CountdownScreenProps) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-40 bg-background/80 backdrop-blur-sm">
      <div className="text-center animate-pulse-glow">
        <div className="text-9xl font-bold gradient-primary bg-clip-text text-transparent animate-bounce">
          {count}
        </div>
        <p className="text-xl text-muted-foreground mt-4">Get ready!</p>
      </div>
    </div>
  );
};
