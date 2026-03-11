import React, { useEffect, useRef } from 'react';

interface Particle {
  angle: number;
  radius: number;
  speed: number;
  size: number;
  alpha: number;
  distanceOffset: number;
}

interface ParticleOrbProps {
  volume: number; // 0 to 1
  baseRadius?: number;
  className?: string;
}

export const ParticleOrb: React.FC<ParticleOrbProps> = ({ 
  volume, 
  baseRadius = 60, 
  className = "" 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>(0);
  
  // Initialize particles
  useEffect(() => {
    const particles: Particle[] = [];
    const numParticles = 900; // Dense look matching the screenshot
    
    for (let i = 0; i < numParticles; i++) {
      // Create a solid sphere look by distributing particles evenly but with varying density
      // Math.pow(Math.random(), 0.5) ensures more even 2D distribution inside the circle
      const r = Math.pow(Math.random(), 0.5) * baseRadius;
      
      particles.push({
        angle: Math.random() * Math.PI * 2,
        radius: r,
        // Slower rotation for inner particles, faster for outer
        speed: (Math.random() - 0.5) * 0.001 * (1 + (r / baseRadius)),
        // Dots are very small as seen in the screenshot
        size: Math.random() * 1.2 + 0.4,
        // Golden color visibility
        alpha: Math.random() * 0.7 + 0.3,
        // Random offset for idle breathing
        distanceOffset: Math.random() * Math.PI * 2
      });
    }
    
    particlesRef.current = particles;
  }, [baseRadius]);

  // Render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let currentVolumeInfluence = 0;
    
    const render = (time: number) => {
      // Handle DPI scaling
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      
      // Only resize if dimensions changed to avoid canvas clear/flicker
      if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
      }
      
      ctx.save();
      ctx.scale(dpr, dpr);
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      // Smooth the volume transition heavily so it feels organic, not jittery
      currentVolumeInfluence += (volume - currentVolumeInfluence) * 0.12;
      
      // Clear canvas
      ctx.clearRect(0, 0, rect.width, rect.height);
      
      // Calculate dynamic radius expansion based on volume
      // Expand up to 1.6x when very loud
      const expansion = 1 + (currentVolumeInfluence * 0.6);
      
      // Draw particles
      const particles = particlesRef.current;
      const timeSlow = time * 0.001;
      
      ctx.fillStyle = '#dca52d'; // Golden base color
      
      particles.forEach(p => {
        // Update angle for slow rotation
        p.angle += p.speed;
        
        // Add a subtle breathing effect even when silent
        const idleBreathing = Math.sin(timeSlow * 1.5 + p.distanceOffset) * 0.03 + 1;
        
        const currentRadius = p.radius * expansion * idleBreathing;
        
        // Add a tiny bit of jitter based on volume for an active feel
        const jitterX = currentVolumeInfluence * (Math.random() - 0.5) * 2;
        const jitterY = currentVolumeInfluence * (Math.random() - 0.5) * 2;
        
        const x = centerX + Math.cos(p.angle) * currentRadius + jitterX;
        const y = centerY + Math.sin(p.angle) * currentRadius + jitterY;
        
        // Draw point
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(x, y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
      
      ctx.restore();
      animationRef.current = requestAnimationFrame(render);
    };
    
    animationRef.current = requestAnimationFrame(render);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [volume]);
  
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
        {/* Soft glow behind the canvas to match the ethereal aesthetic */}
        <div 
          className="absolute inset-0 rounded-full blur-[30px] opacity-15 transition-transform duration-300 ease-out pointer-events-none"
          style={{ 
             background: 'radial-gradient(circle, rgba(220, 165, 45, 0.6) 0%, rgba(220, 165, 45, 0) 70%)',
             transform: `scale(${1 + volume * 0.4})`
          }}
        />
        <canvas 
          ref={canvasRef} 
          className="w-full h-full block relative z-10"
        />
    </div>
  );
};
