import React from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hoverGlow?: boolean;
  intensity?: 'low' | 'normal' | 'high';
  glowVariant?: 'green' | 'gold' | 'teal' | 'none';
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  hoverGlow = false,
  intensity = 'normal',
  glowVariant = 'green',
  ...props
}) => {
  const intensityClasses = {
    low: 'bg-zinc-950/20 backdrop-blur-sm border-zinc-900/60',
    normal: 'bg-gradient-to-b from-zinc-900/70 to-zinc-950/95 backdrop-blur-md border-white/[0.04]',
    high: 'bg-gradient-to-b from-zinc-950/80 to-black backdrop-blur-xl border-white/[0.06]',
  };

  const glowClasses = {
    green: 'hover:shadow-emerald-500/10 hover:border-emerald-500/30 cred-glow-green',
    gold: 'hover:shadow-amber-500/10 hover:border-amber-500/30 cred-glow-gold',
    teal: 'hover:shadow-teal-500/10 hover:border-teal-500/30 cred-glow-teal',
    none: ''
  };

  return (
    <div
      className={`
        rounded-2xl 
        border 
        transition-all 
        duration-300 
        ${intensityClasses[intensity]} 
        ${hoverGlow ? glowClasses[glowVariant] : ''} 
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};
export default GlassCard;
