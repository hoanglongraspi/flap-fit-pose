# FitFly - AI-Powered Workout Game 🏋️‍♀️🎮

Get fit while playing! FitFly is a Flappy Bird-style game that uses MediaPipe Pose detection to track your body movements. Control the bird with squats and arm raises!

## 🎮 How to Play

1. **Allow camera access** when prompted
2. **Stand in neutral position** during calibration
3. Control the bird with:
   - **Squats**: Quickly drop down and up
   - **Arm Raises**: Raise both arms above shoulders
   - **Keyboard**: Press Space or ↑ arrow (fallback)
4. Avoid the pipes and rack up points!

## 🚀 Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open your browser to `http://localhost:8080`

## 🧠 How It Works

### Pose Detection → Flap Mapping
1. **MediaPipe Pose** tracks 33 body landmarks in real-time
2. **Calibration** establishes baseline measurements (torso length, hip/shoulder positions)
3. **Motion Detection**:
   - **Squat**: Hip drops >15% of torso length
   - **Arm Raise**: Both wrists above shoulders for >0.1s
   - **Velocity**: Fast upward body movement
4. **Debouncing** prevents multiple flaps (300ms cooldown)
5. **Smoothing** reduces jitter using exponential averaging

### Architecture
```
/src
  /pose/          # PoseController - MediaPipe integration
  /game/          # Bird, Pipe, GameEngine - Game logic
  /components/    # React UI components
  /constants/     # Game configuration
  /types/         # TypeScript interfaces
```

## 🎯 Features

- ✅ Real-time pose detection with skeleton overlay
- ✅ Auto-calibration system
- ✅ Multiple flap detection methods
- ✅ Increasing difficulty
- ✅ HUD with FPS, confidence, latency
- ✅ Calorie counter (MET-based estimation)
- ✅ Auto-pause when leaving frame
- ✅ Keyboard fallback controls
- ✅ Best score persistence

## 🎨 Tech Stack

- **React + Vite** - Fast modern development
- **TypeScript** - Type safety
- **MediaPipe Pose** - AI pose detection
- **HTML5 Canvas** - High-performance rendering
- **TailwindCSS** - Beautiful styling
- **Sonner** - Toast notifications

## 🏆 Game Constants

Adjust in `src/constants/game.ts`:
- `GRAVITY`: Bird fall speed
- `JUMP_FORCE`: Flap strength
- `SQUAT_THRESHOLD`: Sensitivity for squat detection
- `ARM_RAISE_THRESHOLD`: Hold time for arm raises
- `PIPE_GAP_START`: Initial pipe gap size

## 📊 Performance

- Target: 60 FPS game loop
- Pose detection: 30 FPS
- Video downscaling for performance
- Exponential smoothing reduces jitter
- Canvas optimizations with `devicePixelRatio`

## 🔥 Tips

- Ensure good lighting for better pose detection
- Stand 6-8 feet from camera
- Wear contrasting colors for better tracking
- Do small squats for quick flaps
- Raise arms decisively above shoulders

## 🛠 Development

To simulate pose without camera:
1. Comment out pose initialization
2. Use keyboard controls only
3. Enable debug mode in constants

## 📝 License

Built with ❤️ for fitness gamers everywhere!
