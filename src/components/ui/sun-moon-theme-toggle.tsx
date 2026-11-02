import React from 'react';

export interface SunMoonThemeToggleProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  theme?: 'dark' | 'light';
  onToggle?: () => void;
  className?: string;
}

export const SunMoonThemeToggle: React.FC<SunMoonThemeToggleProps> = ({
  theme = 'dark',
  onToggle,
  className = '',
  ...props
}) => {
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={onToggle}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      className={`group relative inline-flex items-center justify-center p-3 rounded-full transition-all duration-500 ease-out cursor-pointer overflow-hidden border backdrop-blur-xl ${
        isDark
          ? 'bg-zinc-900/80 border-white/20 text-amber-200 shadow-[0_0_20px_rgba(251,191,36,0.15)] hover:border-amber-300/40 hover:bg-zinc-800/90'
          : 'bg-white/80 border-zinc-200 text-zinc-900 shadow-[0_0_20px_rgba(0,0,0,0.08)] hover:border-zinc-300 hover:bg-white'
      } ${className}`}
      {...props}
    >
      {/* Background glow ambient ring */}
      <span
        className={`absolute inset-0 rounded-full transition-opacity duration-500 pointer-events-none opacity-0 group-hover:opacity-100 ${
          isDark
            ? 'bg-gradient-to-r from-amber-500/10 via-amber-400/20 to-orange-500/10 blur-sm'
            : 'bg-gradient-to-r from-indigo-500/10 via-sky-400/20 to-blue-500/10 blur-sm'
        }`}
      />

      {/* Sun & Moon Animated Icon Container */}
      <div className="relative w-6 h-6 flex items-center justify-center">
        {/* Sun Icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`w-6 h-6 absolute inset-0 transition-all duration-500 transform ${
            isDark
              ? 'opacity-100 rotate-0 scale-100'
              : 'opacity-0 -rotate-90 scale-50'
          }`}
        >
          <circle cx="12" cy="12" r="4" className="fill-amber-300/20 stroke-amber-300" />
          <path d="M12 2v2" className="stroke-amber-300" />
          <path d="M12 20v2" className="stroke-amber-300" />
          <path d="m4.93 4.93 1.41 1.41" className="stroke-amber-300" />
          <path d="m17.66 17.66 1.41 1.41" className="stroke-amber-300" />
          <path d="M2 12h2" className="stroke-amber-300" />
          <path d="M20 12h2" className="stroke-amber-300" />
          <path d="m6.34 17.66-1.41 1.41" className="stroke-amber-300" />
          <path d="m19.07 4.93-1.41 1.41" className="stroke-amber-300" />
        </svg>

        {/* Moon Icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`w-5 h-5 absolute inset-0 transition-all duration-500 transform ${
            !isDark
              ? 'opacity-100 rotate-0 scale-100'
              : 'opacity-0 rotate-90 scale-50'
          }`}
        >
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" className="fill-zinc-800/20 stroke-zinc-800" />
        </svg>
      </div>
    </button>
  );
};

export default SunMoonThemeToggle;
