import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  z: number;
  rotationX: number;
  rotationY: number;
  rotationZ: number;
  drX: number;
  drY: number;
  drZ: number;
  size: number;
  color: string;
  symbol: string;
}

export const InteractiveBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    resize();
    window.addEventListener('resize', resize);

    // Particle Configuration
    const particles: Particle[] = [];

    // REDUCED OPACITY: Changed alpha values from 0.8/0.4 to 0.15/0.25/0.1
    // This makes them much more subtle background elements
    const colors = ['rgba(168, 85, 247, 0.25)', 'rgba(245, 158, 11, 0.25)', 'rgba(255, 255, 255, 0.1)'];

    // Symbols: Currency, Numbers, Email related
    const symbols = ['ECB', 'invoice', 'Currency', 'Email', '$1459.65', '$5000', '€200', '€295.98'];

    // REDUCED COUNT: Lowered from 50 to 30 to increase perceived spacing
    const particleCount = 30;

    // Initialize Particles
    for (let i = 0; i < particleCount; i++) {
      particles.push({
            // INCREASED SPACING
            x: (Math.random() - 0.5) * 4000,
            y: (Math.random() - 0.5) * 4000,
            z: Math.random() * 4000,
        rotationX: Math.random() * Math.PI,
        rotationY: Math.random() * Math.PI,
        rotationZ: Math.random() * Math.PI,
        drX: (Math.random() - 0.5) * 0.02,
        drY: (Math.random() - 0.5) * 0.02,
        drZ: (Math.random() - 0.5) * 0.02,
        size: 20 + Math.random() * 40,
        color: colors[Math.floor(Math.random() * colors.length)],
        symbol: symbols[Math.floor(Math.random() * symbols.length)],
      });
    }

    // Interaction State
    let mouseX = 0;
    let mouseY = 0;
    let targetRotationX = 0;
    let targetRotationY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      // Normalize mouse coordinates (-0.5 to 0.5)
      mouseX = (e.clientX - width / 2) / width;
      mouseY = (e.clientY - height / 2) / height;
    };
    window.addEventListener('mousemove', handleMouseMove);

    let frameId = 0;

    const loop = () => {
      ctx.clearRect(0, 0, width, height);

      // Easing for global rotation (smooth camera feel)
      targetRotationX += (mouseY * 0.2 - targetRotationX) * 0.05;
      targetRotationY += (mouseX * 0.2 - targetRotationY) * 0.05;

      const cx = width / 2;
      const cy = height / 2;
      const focalLength = 800;

      particles.forEach((p) => {
            // Move particle towards camera (slower speed)
            p.z -= 0.6;

        // Reset particle if it passes the camera or gets too close
        if (p.z < -focalLength + 50) {
          p.z = 3000; // Reset deeper in Z space
          p.x = (Math.random() - 0.5) * 3000;
          p.y = (Math.random() - 0.5) * 3000;
        }

        // --- 3D Rotation Calculation ---
        let x = p.x;
        let y = p.y;
        let z = p.z;

        // Rotate around Y axis (Horizontal Mouse)
        const cosY = Math.cos(targetRotationY);
        const sinY = Math.sin(targetRotationY);
        const x1 = x * cosY - z * sinY;
        const z1 = z * cosY + x * sinY;

        // Rotate around X axis (Vertical Mouse)
        const cosX = Math.cos(targetRotationX);
        const sinX = Math.sin(targetRotationX);
        const y2 = y * cosX - z1 * sinX;
        const z2 = z1 * cosX + y * sinX;

        // --- Projection ---
        if (z2 < -focalLength + 10) return; // Clip behind camera
        const scale = focalLength / (focalLength + z2);

        const screenX = cx + x1 * scale;
        const screenY = cy + y2 * scale;

        // --- Drawing ---
        ctx.save();
        ctx.translate(screenX, screenY);
        ctx.scale(scale, scale);

        // Update individual spin
        p.rotationZ += p.drZ;

        // Rotate text
        ctx.rotate(p.rotationZ);

        ctx.font = `bold ${p.size}px "Inter", sans-serif`;
        ctx.fillStyle = p.color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Draw the symbol
        ctx.fillText(p.symbol, 0, 0);

        ctx.restore();
      });

      frameId = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(frameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full pointer-events-none z-[1]" />;
};
