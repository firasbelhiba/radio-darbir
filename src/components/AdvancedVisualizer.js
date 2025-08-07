import React, { useEffect, useRef } from 'react';
import './AdvancedVisualizer.css';

function AdvancedVisualizer({ isPlaying, pattern = 'bars' }) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 20;

    let time = 0;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.05;

      if (pattern === 'circular') {
        // Circular wave pattern
        if (isPlaying) {
          for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2 + time;
            const waveRadius = radius * (0.3 + 0.7 * Math.sin(time * 2 + i));
            const x = centerX + Math.cos(angle) * waveRadius;
            const y = centerY + Math.sin(angle) * waveRadius;
            const size = 10 + 20 * Math.sin(time * 3 + i);

            // Create gradient
            const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
            gradient.addColorStop(0, '#667eea');
            gradient.addColorStop(1, '#764ba2');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      } else if (pattern === 'frequency') {
        // Frequency bars pattern
        const bars = 64;
        const barWidth = canvas.width / bars;

        for (let i = 0; i < bars; i++) {
          const x = i * barWidth;
          let height;

          if (isPlaying) {
            // Simulate frequency response
            const frequency = (i / bars) * 2;
            height = Math.sin(frequency * 10 + time * 2) * 0.5 + 0.5;
            height *= canvas.height * 0.8;
          } else {
            height = 0;
          }

          const y = canvas.height - height;
          
          // Create gradient
          const gradient = ctx.createLinearGradient(x, y, x, canvas.height);
          gradient.addColorStop(0, '#667eea');
          gradient.addColorStop(1, '#764ba2');

          ctx.fillStyle = gradient;
          ctx.fillRect(x + 1, y, barWidth - 2, height);

          // Add glow effect
          ctx.shadowColor = '#667eea';
          ctx.shadowBlur = 5;
          ctx.fillRect(x + 1, y, barWidth - 2, height);
          ctx.shadowBlur = 0;
        }
      } else {
        // Default bars pattern
        const bars = 32;
        const barWidth = canvas.width / bars;
        let barHeights = new Array(bars).fill(0);

        if (isPlaying) {
          barHeights = barHeights.map(() => Math.random() * canvas.height * 0.8);
        } else {
          barHeights = barHeights.map(height => Math.max(0, height * 0.9));
        }

        barHeights.forEach((height, index) => {
          const x = index * barWidth;
          const y = canvas.height - height;
          
          const gradient = ctx.createLinearGradient(x, y, x, canvas.height);
          gradient.addColorStop(0, '#667eea');
          gradient.addColorStop(1, '#764ba2');
          
          ctx.fillStyle = gradient;
          ctx.fillRect(x + 1, y, barWidth - 2, height);
          
          ctx.shadowColor = '#667eea';
          ctx.shadowBlur = 8;
          ctx.fillRect(x + 1, y, barWidth - 2, height);
          ctx.shadowBlur = 0;
        });
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, pattern]);

  return (
    <div className={`advanced-visualizer ${isPlaying ? 'playing' : ''}`}>
      <canvas
        ref={canvasRef}
        width={400}
        height={120}
        className="advanced-canvas"
      />
      <div className="visualizer-label">
        {pattern === 'circular' && '🌊 Circular Waves'}
        {pattern === 'frequency' && '📊 Frequency Spectrum'}
        {pattern === 'bars' && '🎵 Music Bars'}
      </div>
    </div>
  );
}

export default AdvancedVisualizer;
