import React, { useEffect, useRef } from 'react';
import './MusicVisualizer.css';

function MusicVisualizer({ isPlaying }) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const bars = 64; // More bars for full-width
    const barWidth = canvas.width / bars;
    let barHeights = new Array(bars).fill(0);
    let targetHeights = new Array(bars).fill(0);
    let animationSpeed = 0.02; // Slower animation

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (isPlaying) {
        // Generate new target heights occasionally
        if (Math.random() < 0.1) { // Reduced frequency
          targetHeights = targetHeights.map(() => Math.random() * canvas.height * 0.8);
        }
      } else {
        // Gradually reduce target heights when not playing
        targetHeights = targetHeights.map(() => 0);
      }

      // Smoothly animate bars towards target heights
      barHeights = barHeights.map((height, index) => {
        const target = targetHeights[index];
        return height + (target - height) * animationSpeed;
      });

      barHeights.forEach((height, index) => {
        const x = index * barWidth;
        const y = canvas.height - height;
        
        // Create gradient for each bar
        const gradient = ctx.createLinearGradient(x, y, x, canvas.height);
        gradient.addColorStop(0, '#667eea');
        gradient.addColorStop(1, '#764ba2');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x + 1, y, barWidth - 2, height);
        
        // Add glow effect
        ctx.shadowColor = '#667eea';
        ctx.shadowBlur = 8;
        ctx.fillRect(x + 1, y, barWidth - 2, height);
        ctx.shadowBlur = 0;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying]);

  return (
    <div className="music-visualizer">
      <canvas
        ref={canvasRef}
        width={1200}
        height={120}
        className="visualizer-canvas"
      />
    </div>
  );
}

export default MusicVisualizer;
