import React, { useState } from 'react';
import { motion } from 'motion/react';

export interface FlipButtonProps {
  text1?: string;
  text2?: string;
  onClick?: () => void;
  isAdded?: boolean;
  className?: string;
  bgOne?: string;
  bgTwo?: string;
  colorOne?: string;
  colorTwo?: string;
}

export function FlipButton({
  text1 = 'Cancel',
  text2 = 'Cancel',
  onClick,
  isAdded,
  className = '',
  bgOne = '#8C2D2D',
  bgTwo = '#065F46',
  colorOne = '#ffffff',
  colorTwo = '#ecfdf5',
}: FlipButtonProps) {
  const [internalShow, setInternalShow] = useState(false);
  const show = isAdded !== undefined ? isAdded : internalShow;

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (isAdded === undefined) {
      setInternalShow((prev) => !prev);
    }
    if (onClick) {
      onClick();
    }
  };

  const flipVariants = {
    one: {
      rotateX: 0,
      backgroundColor: bgOne,
      color: colorOne,
    },
    two: {
      rotateX: 180,
      backgroundColor: bgTwo,
      color: colorTwo,
    },
  };

  return (
    <div className={`w-full relative [perspective:1000px] ${className}`}>
      <motion.button
        type="button"
        className="w-full cursor-pointer px-5 py-2.5 text-xs font-semibold tracking-wide relative flex items-center justify-center overflow-hidden shadow-md"
        style={{
          borderRadius: 999,
          transformStyle: 'preserve-3d',
        }}
        onClick={handleClick}
        animate={show ? 'two' : 'one'}
        variants={flipVariants}
        transition={{ duration: 0.6, type: 'spring', stiffness: 240, damping: 22 }}
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.02 }}
      >
        {/* Front Face: Add to Bag */}
        <div
          className="flex items-center justify-center gap-1.5 whitespace-nowrap"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          }}
        >
          {text2}
        </div>

        {/* Back Face: Cancel (pre-rotated 180deg so when button flips 180deg, it becomes 360deg = upright & readable) */}
        <div
          className="absolute inset-0 flex items-center justify-center gap-1.5 whitespace-nowrap px-4"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateX(180deg)',
          }}
        >
          {text1}
        </div>
      </motion.button>
    </div>
  );
}
