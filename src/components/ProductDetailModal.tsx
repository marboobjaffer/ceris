import React, { useState } from 'react';
import { X, Check, Ruler, ShieldCheck } from 'lucide-react';
import { DressProduct, DressSize } from '../data/dresses';

interface ProductDetailModalProps {
  dress: DressProduct | null;
  initialSize: DressSize;
  onClose: () => void;
  onAddToCart: (dress: DressProduct, size: DressSize, hemOption: string) => void;
}

const SIZES: DressSize[] = ['XS', 'S', 'M', 'L', 'XL'];
const HEM_OPTIONS = ['Standard Atelier Length', 'Petite Hem (-5 cm)', 'Cathedral Tall (+5 cm)'];

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  dress,
  initialSize,
  onClose,
  onAddToCart,
}) => {
  const [selectedSize, setSelectedSize] = useState<DressSize>(initialSize);
  const [selectedHem, setSelectedHem] = useState<string>(HEM_OPTIONS[0]);
  const [addedFeedback, setAddedFeedback] = useState(false);
  const [imgError, setImgError] = useState(false);

  if (!dress) return null;

  const sizeMetrics = dress.measurementsBySize[selectedSize];

  const handleAdd = () => {
    onAddToCart(dress, selectedSize, selectedHem);
    setAddedFeedback(true);
    setTimeout(() => {
      setAddedFeedback(false);
    }, 1400);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 md:p-8 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pdp-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl bg-[#121214] border border-white/10 rounded-xl overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close garment details"
          className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-lg bg-black/60 backdrop-blur-md border border-white/15 text-zinc-300 hover:text-white hover:border-white/30 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
          {/* Sticky Gallery Left */}
          <div className="lg:col-span-6 bg-[#161619] relative min-h-[420px] lg:min-h-[640px]">
            {!imgError ? (
              <img
                src={dress.image}
                alt={dress.name}
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-gradient-to-b from-[#1A1A1E] to-[#111113]">
                <span className="font-display text-2xl text-zinc-300">{dress.name}</span>
                <span className="text-xs text-zinc-500 mt-2">{dress.fabric}</span>
              </div>
            )}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-6">
              <div className="flex items-center gap-2 text-xs text-zinc-300">
                <span>{dress.origin}</span>
                <span aria-hidden="true">·</span>
                <span>{dress.silhouette}</span>
              </div>
            </div>
          </div>

          {/* Contiguous Purchase Module Right */}
          <div className="lg:col-span-6 p-6 md:p-10 flex flex-col justify-between max-h-[85vh] overflow-y-auto">
            <div>
              {/* Unboxed Metadata */}
              <div className="flex items-center gap-2 text-xs text-zinc-400 tracking-wide uppercase">
                <span>{dress.category}</span>
                <span aria-hidden="true">·</span>
                <span>{dress.fabric}</span>
                <span aria-hidden="true">·</span>
                <span className="text-[#C87D7D]">{dress.availability}</span>
              </div>

              <h2
                id="pdp-title"
                className="font-display text-2xl md:text-3xl font-semibold text-[#F4F3EF] mt-2 leading-tight"
              >
                {dress.name}
              </h2>

              <div className="mt-3 flex items-baseline gap-4">
                <span className="font-mono text-2xl font-medium text-[#F4F3EF] tabular-nums">
                  ${dress.price.toLocaleString()}
                </span>
                <span className="text-xs text-zinc-400">
                  Complimentary insured courier delivery included
                </span>
              </div>

              <p className="mt-5 text-sm text-zinc-300 leading-relaxed">
                {dress.description}
              </p>

              {/* Size Selector */}
              <div className="mt-7 pt-6 border-t border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-zinc-300 uppercase tracking-wider">
                    Select Atelier Size
                  </span>
                  <span className="text-xs text-zinc-400 flex items-center gap-1.5 font-mono tabular-nums">
                    <Ruler className="w-3.5 h-3.5 text-zinc-500" />
                    Waist {sizeMetrics.waistCm} cm · Bust {sizeMetrics.bustCm} cm
                  </span>
                </div>

                <div className="grid grid-cols-5 gap-2">
                  {SIZES.map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setSelectedSize(sz)}
                      className={`py-2.5 px-3 text-xs font-mono font-medium rounded-lg border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                        selectedSize === sz
                          ? 'bg-[#F4F3EF] text-[#0B0B0C] border-[#F4F3EF]'
                          : 'bg-white/[0.03] text-zinc-300 border-white/10 hover:border-white/30'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>

                {/* Selected Size Full Spec Strip */}
                <div className="mt-3 grid grid-cols-4 gap-2 py-2.5 px-3 rounded-lg bg-white/[0.03] border border-white/[0.06] text-xs font-mono tabular-nums text-zinc-400">
                  <div>
                    <span className="block text-[11px] text-zinc-500">Bust</span>
                    <span className="text-zinc-200">{sizeMetrics.bustCm} cm</span>
                  </div>
                  <div>
                    <span className="block text-[11px] text-zinc-500">Waist</span>
                    <span className="text-zinc-200">{sizeMetrics.waistCm} cm</span>
                  </div>
                  <div>
                    <span className="block text-[11px] text-zinc-500">Hip</span>
                    <span className="text-zinc-200">{sizeMetrics.hipCm} cm</span>
                  </div>
                  <div>
                    <span className="block text-[11px] text-zinc-500">Length</span>
                    <span className="text-zinc-200">{sizeMetrics.lengthCm} cm</span>
                  </div>
                </div>
              </div>

              {/* Bespoke Hem Option */}
              <div className="mt-5">
                <label className="block text-xs font-medium text-zinc-300 uppercase tracking-wider mb-2">
                  Hem Tailoring (Complimentary)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {HEM_OPTIONS.map((hem) => (
                    <button
                      key={hem}
                      type="button"
                      onClick={() => setSelectedHem(hem)}
                      className={`py-2 px-3 text-xs rounded-lg border text-left transition-colors cursor-pointer whitespace-nowrap truncate ${
                        selectedHem === hem
                          ? 'bg-[#8C2D2D]/25 border-[#8C2D2D] text-[#F4F3EF]'
                          : 'bg-white/[0.02] border-white/10 text-zinc-400 hover:text-zinc-200 hover:border-white/20'
                      }`}
                    >
                      {hem}
                    </button>
                  ))}
                </div>
              </div>

              {/* Construction Details */}
              <div className="mt-6 pt-6 border-t border-white/10">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3">
                  Garment Architecture
                </h3>
                <ul className="space-y-2 text-xs text-zinc-300">
                  {dress.constructionDetails.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="text-zinc-500 select-none">—</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-xs text-zinc-500">
                  Care: {dress.careInstructions}
                </p>
              </div>
            </div>

            {/* Primary Purchase CTA */}
            <div className="mt-8 pt-5 border-t border-white/10 flex flex-col gap-3">
              <button
                type="button"
                onClick={handleAdd}
                className={`w-full py-3.5 px-6 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap shrink-0 ${
                  addedFeedback
                    ? 'bg-emerald-900/80 text-emerald-100 border border-emerald-500/40'
                    : 'bg-[#8C2D2D] hover:bg-[#A13535] text-white'
                }`}
              >
                {addedFeedback ? (
                  <>
                    <Check className="w-4 h-4" />
                    Added to Atelier Bag ({selectedSize})
                  </>
                ) : (
                  <>
                    Add to Atelier Bag · ${dress.price.toLocaleString()}
                  </>
                )}
              </button>
              <div className="flex items-center justify-center gap-2 text-xs text-zinc-400">
                <ShieldCheck className="w-3.5 h-3.5 text-zinc-500" />
                <span>14-day return guarantee · Individual garment serial number</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
