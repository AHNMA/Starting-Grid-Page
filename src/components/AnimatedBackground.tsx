import React from 'react';

interface AnimatedBackgroundProps {
  opacity?: number;
  className?: string;
}

const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({ 
  opacity = 0.8,
  className = ""
}) => {
  return (
    <div className={`absolute inset-0 z-0 overflow-hidden pointer-events-none ${className}`}>
      <div className="bg-hero-pattern w-full h-full" style={{ opacity }}></div>
      <div className="absolute inset-0 bg-gradient-to-t from-f1dark via-f1dark/50 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-f1dark via-f1dark/50 to-transparent" />
    </div>
  );
};

export default AnimatedBackground;
