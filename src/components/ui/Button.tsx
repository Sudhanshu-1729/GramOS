import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'glass' | 'gold';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  ...props
}) => {
  const baseStyle = "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 select-none active:scale-[0.98]";
  
  const variants = {
    primary: "bg-emerald-650 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/10 border border-emerald-450/20 active:scale-[0.97] transition-all",
    secondary: "bg-zinc-900 hover:bg-zinc-850 text-white border border-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 active:scale-[0.97] transition-all",
    outline: "bg-transparent border border-zinc-200 hover:bg-zinc-100 text-zinc-950 dark:border-zinc-800 dark:hover:bg-zinc-900 dark:text-zinc-50 active:scale-[0.97] transition-all",
    ghost: "bg-transparent hover:bg-zinc-100 text-zinc-900 dark:hover:bg-zinc-900 dark:text-zinc-50 active:scale-[0.97] transition-all",
    glass: "bg-white/10 hover:bg-white/20 text-zinc-950 dark:bg-zinc-900/40 dark:hover:bg-zinc-900/60 dark:text-white border border-white/10 dark:border-white/5 backdrop-blur-sm active:scale-[0.97] transition-all",
    gold: "bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-black font-extrabold shadow-lg shadow-amber-500/15 border border-amber-400/30 active:scale-[0.97] transition-all"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2.5 text-sm",
    lg: "px-6 py-3.5 text-base"
  };

  return (
    <button
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
export default Button;
