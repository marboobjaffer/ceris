import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import JellyRadio from './JellyRadio';

export interface DockItemConfig {
  id: string;
  label: string;
  onClick: () => void;
  active?: boolean;
}

interface DockProps {
  items: DockItemConfig[];
  visible: boolean;
  theme?: 'dark' | 'light';
}

export const Dock: React.FC<DockProps> = ({
  items,
  visible,
  theme = 'dark',
}) => {
  const isLight = theme === 'light';
  const activeItem = items.find((item) => item.active);
  const currentValue = activeItem ? activeItem.id : items[0]?.id ?? '';

  return (
    <AnimatePresence>
      {visible && (
        <div className="fixed top-4 inset-x-0 z-40 flex justify-center pointer-events-none px-4">
          <motion.nav
            aria-label="Floating Atelier Dock"
            initial={{ y: -60, opacity: 0, scale: 0.92 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -60, opacity: 0, scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
            className={`pointer-events-auto flex items-center rounded-full px-2 py-1 backdrop-blur-2xl transition-colors duration-300 ${
              isLight
                ? 'bg-white/35 border border-black/15 shadow-[inset_0_1px_2px_rgba(255,255,255,0.9),inset_0_-2px_6px_rgba(18,18,21,0.05),0_12px_32px_rgba(18,18,21,0.12)]'
                : 'bg-white/[0.05] border border-white/20 shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.38),inset_0_-2px_6px_rgba(255,255,255,0.08),0_14px_36px_rgba(0,0,0,0.55)]'
            }`}
          >
            <JellyRadio
              ariaLabel="Dock Navigation"
              size="sm"
              className="jelly-radio--clear-bubble"
              items={items.map((item) => ({
                value: item.id,
                label: item.label,
              }))}
              value={currentValue}
              allowReselect={true}
              onChange={(val) => {
                const target = items.find((it) => it.id === val);
                target?.onClick();
              }}
            />
          </motion.nav>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Dock;
