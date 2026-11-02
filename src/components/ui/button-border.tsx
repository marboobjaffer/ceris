import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonBorderProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  className?: string;
  containerClassName?: string;
  duration?: number;
  borderGradient?: string;
}

export const ButtonBorder: React.FC<ButtonBorderProps> = ({
  children,
  className = '',
  containerClassName = '',
  duration = 4,
  borderGradient = 'from-[#F4F3EF] via-[#8C2D2D] to-[#F4F3EF]',
  onClick,
  type = 'button',
  ...props
}) => {
  return (
    <div
      className={cn(
        'relative inline-flex p-[1px] overflow-hidden rounded-full cursor-pointer group active:scale-95 transition-transform duration-200 shrink-0',
        containerClassName
      )}
    >
      {/* Rotating Animated Conic Gradient Border */}
      <span
        className={cn(
          'absolute inset-[-1000%] animate-[spin_4s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#F4F3EF_0%,#8C2D2D_50%,#F4F3EF_100%)] opacity-85 group-hover:opacity-100 transition-opacity'
        )}
        style={{ animationDuration: `${duration}s` }}
      />

      {/* Inner Button Canvas */}
      <button
        type={type}
        onClick={onClick}
        className={cn(
          'inline-flex items-center justify-center w-full h-full px-6 py-3 text-xs font-bold tracking-wide text-[#F4F3EF] bg-[#18181C] hover:bg-[#202025] rounded-full transition-colors duration-200 z-10 backdrop-blur-xl whitespace-nowrap cursor-pointer',
          className
        )}
        {...props}
      >
        {children}
      </button>
    </div>
  );
};

export default ButtonBorder;
