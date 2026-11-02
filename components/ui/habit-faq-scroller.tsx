import React from 'react';

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface FaqRow {
  id: string;
  speed?: string;
  direction?: 'left' | 'right';
  faqItems: FaqItem[];
}

export interface FaqSectionData {
  mainTitle: string;
  mainSubtitle?: string;
  rows: FaqRow[];
}

/**
 * FaqCard
 * Reusable card for a single FAQ item.
 */
export const FaqCard: React.FC<{ question: string; answer: string }> = ({
  question,
  answer,
}) => {
  return (
    <div className="flex flex-col items-start gap-3.5 p-6 bg-[#121215] border border-white/10 rounded-xl shadow-lg w-96 flex-shrink-0 faq-card transition-colors duration-200 hover:border-white/25">
      <h3 className="font-display text-xl font-bold text-[#F4F3EF] leading-snug faq-title">
        {question}
      </h3>
      <p className="text-sm text-zinc-400 leading-relaxed faq-answer">
        {answer}
      </p>
    </div>
  );
};

/**
 * HorizontalScroller
 * Wraps children and creates a seamless horizontal looping animation.
 */
export const HorizontalScroller: React.FC<{
  children: React.ReactNode;
  speed?: string;
  direction?: 'left' | 'right';
}> = ({ children, speed = '40s', direction = 'left' }) => {
  const animationClass =
    direction === 'right'
      ? 'animate-scroll-horizontal-reverse'
      : 'animate-scroll-horizontal';

  // Inline style to set the CSS custom property for scroll duration.
  const style = { '--scroll-duration': speed } as React.CSSProperties;

  return (
    <div className="w-full overflow-hidden group relative scroller-mask">
      <div className={`flex w-max ${animationClass}`} style={style}>
        <div className="flex items-stretch justify-center flex-shrink-0 gap-8 px-4">
          {children}
        </div>
        {/* duplicate for seamless loop */}
        <div
          className="flex items-stretch justify-center flex-shrink-0 gap-8 px-4"
          aria-hidden="true"
        >
          {children}
        </div>
      </div>
    </div>
  );
};

/**
 * FaqSection
 * Assembles title and multiple horizontal rows.
 */
export const FaqSection: React.FC<{ data: FaqSectionData }> = ({ data }) => {
  return (
    <div className="relative flex flex-col items-center gap-12 py-16 px-4 sm:px-8 w-full max-w-[1280px] mx-auto">
      <div className="flex flex-col items-center gap-4 text-center z-10 max-w-2xl">
        <h2
          className="font-display text-3xl sm:text-4xl md:text-5xl font-normal text-[#F4F3EF] leading-tight"
          style={{
            opacity: 0,
            animation: 'fadeInUp 0.7s ease-out 0.2s forwards',
          }}
        >
          {data.mainTitle}
        </h2>
      </div>

      <div className="flex flex-col gap-6 z-10 w-full">
        {data.rows.map((row) => (
          <HorizontalScroller
            key={row.id}
            speed={row.speed}
            direction={row.direction}
          >
            {row.faqItems.map((item) => (
              <FaqCard
                key={item.id}
                question={item.question}
                answer={item.answer}
              />
            ))}
          </HorizontalScroller>
        ))}
      </div>
    </div>
  );
};

export default FaqSection;
