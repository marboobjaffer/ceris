import React from 'react';

export interface HoverFooterTextProps {
  text?: string;
  className?: string;
}

export const HoverFooterText: React.FC<HoverFooterTextProps> = ({
  text = 'RUST & RAVEN',
  className = '',
}) => {
  return (
    <div className={`relative w-full overflow-hidden my-6 select-none ${className}`}>
      <div className="flex items-center justify-center w-full">
        <h2 className="font-display font-black tracking-tighter text-[clamp(2.5rem,10vw,9.5rem)] leading-none uppercase text-center text-[#F4F3EF]">
          {text}
        </h2>
      </div>

      {/* Static line beneath giant name */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mt-4 opacity-40" />
    </div>
  );
};

export default HoverFooterText;
