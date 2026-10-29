import React, { useState } from 'react';
import { X, Plus, Minus, Trash2, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';
import { DressProduct, DressSize } from '../data/dresses';

export interface CartItem {
  dress: DressProduct;
  size: DressSize;
  hemOption: string;
  quantity: number;
}

interface CartDrawerProps {
  isOpen: boolean;
  items: CartItem[];
  onClose: () => void;
  onUpdateQuantity: (dressId: string, size: DressSize, hemOption: string, delta: number) => void;
  onRemoveItem: (dressId: string, size: DressSize, hemOption: string) => void;
  onClearCart: () => void;
}

interface ConfirmedOrder {
  orderNumber: string;
  customerName: string;
  email: string;
  address: string;
  city: string;
  postalCode: string;
  paymentMethod: 'card' | 'cod';
  items: CartItem[];
  total: number;
  placedAt: string;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  items,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
}) => {
  const [step, setStep] = useState<'bag' | 'checkout' | 'confirmed'>('bag');
  const [customerName, setCustomerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cod'>('card');
  const [formError, setFormError] = useState('');
  const [confirmedOrder, setConfirmedOrder] = useState<ConfirmedOrder | null>(null);

  if (!isOpen) return null;

  const subtotal = items.reduce((acc, item) => acc + item.dress.price * item.quantity, 0);
  const freeShippingThreshold = 500;
  const shippingCost = subtotal === 0 || subtotal >= freeShippingThreshold ? 0 : 35;
  const total = subtotal + shippingCost;

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !email.trim() || !address.trim() || !city.trim() || !postalCode.trim()) {
      setFormError('Please complete all required delivery fields.');
      return;
    }
    setFormError('');
    const orderNum = `RR-${Math.floor(1000 + Math.random() * 8999)}`;
    const snapshot: ConfirmedOrder = {
      orderNumber: orderNum,
      customerName: customerName.trim(),
      email: email.trim(),
      address: address.trim(),
      city: city.trim(),
      postalCode: postalCode.trim(),
      paymentMethod,
      items: [...items],
      total,
      placedAt: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
    };
    setConfirmedOrder(snapshot);
    onClearCart();
    setStep('confirmed');
  };

  const resetAndClose = () => {
    if (step === 'confirmed') {
      setStep('bag');
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Atelier Shopping Bag"
      onClick={resetAndClose}
    >
      <div
        className="w-full max-w-lg bg-[#111113] border-l border-white/10 h-full flex flex-col justify-between overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Drawer Header */}
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl font-semibold text-[#F4F3EF]">
              {step === 'bag' && 'Atelier Shopping Bag'}
              {step === 'checkout' && 'Private Courier Checkout'}
              {step === 'confirmed' && 'Order Confirmation'}
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              {step === 'bag' &&
                (subtotal >= freeShippingThreshold || subtotal === 0
                  ? 'Complimentary insured courier shipping unlocked'
                  : `Add $${(freeShippingThreshold - subtotal).toLocaleString()} more for complimentary courier shipping`)}
              {step === 'checkout' && 'Insured garment box with archival garment bag included'}
              {step === 'confirmed' && 'Dispatched from our Milan & Paris workshops'}
            </p>
          </div>
          <button
            type="button"
            onClick={resetAndClose}
            aria-label="Close bag drawer"
            className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/10 flex items-center justify-center text-zinc-300 hover:text-white hover:border-white/25 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === 'bag' && (
            <>
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-16">
                  <p className="font-display text-2xl text-zinc-300">Your Atelier Bag is Empty</p>
                  <p className="text-xs text-zinc-500 mt-2 max-w-xs leading-relaxed">
                    Explore our current Autumn / Winter collection of architectural velvet, silk, and French lace dresses.
                  </p>
                  <button
                    type="button"
                    onClick={resetAndClose}
                    className="mt-6 py-2.5 px-5 rounded-lg bg-white/[0.06] border border-white/15 text-xs font-medium text-[#F4F3EF] hover:bg-white/[0.12] transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Browse Collection
                  </button>
                </div>
              ) : (
                <div className="space-y-5">
                  {items.map((item) => {
                    const key = `${item.dress.id}-${item.size}-${item.hemOption}`;
                    return (
                      <div
                        key={key}
                        className="flex gap-4 pb-5 border-b border-white/[0.08]"
                      >
                        <img
                          src={item.dress.image}
                          alt={item.dress.name}
                          referrerPolicy="no-referrer"
                          className="w-20 h-28 object-cover rounded-lg bg-[#18181B] shrink-0"
                        />
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="text-sm font-medium text-[#F4F3EF] leading-snug">
                                {item.dress.name}
                              </h3>
                              <button
                                type="button"
                                onClick={() =>
                                  onRemoveItem(item.dress.id, item.size, item.hemOption)
                                }
                                aria-label={`Remove ${item.dress.name}`}
                                className="text-zinc-500 hover:text-zinc-300 transition-colors p-1 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-zinc-400">
                              <span>Size {item.size}</span>
                              <span aria-hidden="true">·</span>
                              <span>{item.hemOption}</span>
                            </div>
                          </div>

                          <div className="mt-3 flex items-center justify-between">
                            <div className="inline-flex items-center rounded-lg border border-white/15 bg-white/[0.03]">
                              <button
                                type="button"
                                onClick={() =>
                                  onUpdateQuantity(
                                    item.dress.id,
                                    item.size,
                                    item.hemOption,
                                    -1
                                  )
                                }
                                aria-label="Decrease quantity"
                                className="px-2.5 py-1 text-zinc-300 hover:text-white cursor-pointer"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="px-2.5 py-1 text-xs font-mono tabular-nums text-[#F4F3EF]">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  onUpdateQuantity(
                                    item.dress.id,
                                    item.size,
                                    item.hemOption,
                                    1
                                  )
                                }
                                aria-label="Increase quantity"
                                className="px-2.5 py-1 text-zinc-300 hover:text-white cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            <span className="font-mono text-sm font-medium text-[#F4F3EF] tabular-nums">
                              ${(item.dress.price * item.quantity).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {step === 'checkout' && (
            <form id="checkout-form" onSubmit={handleCheckoutSubmit} className="space-y-4">
              <button
                type="button"
                onClick={() => setStep('bag')}
                className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors mb-2 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Return to Bag
              </button>

              {formError && (
                <div className="p-3 rounded-lg bg-red-950/50 border border-red-500/40 text-xs text-red-200">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs text-zinc-300 mb-1.5">Full Name *</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Lenore Vance"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-white/[0.04] border border-white/15 text-sm text-[#F4F3EF] placeholder:text-zinc-600 focus:outline-none focus:border-white/40"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-zinc-300 mb-1.5">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="lenore@domain.com"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-white/[0.04] border border-white/15 text-sm text-[#F4F3EF] placeholder:text-zinc-600 focus:outline-none focus:border-white/40"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-300 mb-1.5">Phone for Courier</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 234-5678"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-white/[0.04] border border-white/15 text-sm text-[#F4F3EF] placeholder:text-zinc-600 focus:outline-none focus:border-white/40"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-zinc-300 mb-1.5">Street Address *</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="742 Obsidian Mews, Suite 4B"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-white/[0.04] border border-white/15 text-sm text-[#F4F3EF] placeholder:text-zinc-600 focus:outline-none focus:border-white/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-zinc-300 mb-1.5">City *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="New York"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-white/[0.04] border border-white/15 text-sm text-[#F4F3EF] placeholder:text-zinc-600 focus:outline-none focus:border-white/40"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-300 mb-1.5">Postal Code *</label>
                  <input
                    type="text"
                    required
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="10012"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-white/[0.04] border border-white/15 text-sm text-[#F4F3EF] placeholder:text-zinc-600 focus:outline-none focus:border-white/40"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-white/10">
                <label className="block text-xs text-zinc-300 mb-2">Payment Method</label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`py-2.5 px-3 rounded-lg border text-xs font-medium text-left transition-colors cursor-pointer ${
                      paymentMethod === 'card'
                        ? 'bg-[#8C2D2D]/25 border-[#8C2D2D] text-[#F4F3EF]'
                        : 'bg-white/[0.03] border-white/10 text-zinc-400'
                    }`}
                  >
                    Direct Card Settlement
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cod')}
                    className={`py-2.5 px-3 rounded-lg border text-xs font-medium text-left transition-colors cursor-pointer ${
                      paymentMethod === 'cod'
                        ? 'bg-[#8C2D2D]/25 border-[#8C2D2D] text-[#F4F3EF]'
                        : 'bg-white/[0.03] border-white/10 text-zinc-400'
                    }`}
                  >
                    Cash / Card on Delivery
                  </button>
                </div>
              </div>
            </form>
          )}

          {step === 'confirmed' && confirmedOrder && (
            <div className="py-4 space-y-6">
              <div className="p-5 rounded-xl bg-white/[0.03] border border-white/10">
                <div className="flex items-center gap-2.5 text-emerald-300 text-xs font-medium">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Order #{confirmedOrder.orderNumber} Confirmed — Preparing Shipment</span>
                </div>
                <p className="mt-2 text-xs text-zinc-300 leading-relaxed">
                  Thank you, {confirmedOrder.customerName}. Our master seamstresses have received your garment specifications. A tracking dossier has been sent to {confirmedOrder.email}.
                </p>
                <div className="mt-4 pt-4 border-t border-white/10 text-xs text-zinc-400 space-y-1 font-mono tabular-nums">
                  <div>Date: {confirmedOrder.placedAt}</div>
                  <div>
                    Destination: {confirmedOrder.address}, {confirmedOrder.city}{' '}
                    {confirmedOrder.postalCode}
                  </div>
                  <div>
                    Settlement:{' '}
                    {confirmedOrder.paymentMethod === 'card'
                      ? 'Paid via Card'
                      : 'Cash / Card on Courier Delivery'}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-xs uppercase tracking-wider text-zinc-400 font-semibold">
                  Reserved Garments
                </h3>
                {confirmedOrder.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-xs py-2 border-b border-white/[0.06]"
                  >
                    <div>
                      <span className="text-[#F4F3EF] font-medium">{item.dress.name}</span>
                      <span className="block text-zinc-500">
                        Size {item.size} · {item.hemOption} · Qty {item.quantity}
                      </span>
                    </div>
                    <span className="font-mono tabular-nums text-zinc-200">
                      ${(item.dress.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
                <div className="flex items-center justify-between pt-2 text-sm font-medium text-[#F4F3EF]">
                  <span>Total Settled</span>
                  <span className="font-mono tabular-nums">
                    ${confirmedOrder.total.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Drawer Footer */}
        {step !== 'confirmed' && items.length > 0 && (
          <div className="p-6 border-t border-white/10 bg-[#141417] space-y-4">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-zinc-400">
                <span>Subtotal</span>
                <span className="font-mono tabular-nums text-zinc-200">
                  ${subtotal.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Insured Atelier Courier</span>
                <span className="font-mono tabular-nums text-zinc-200">
                  {shippingCost === 0 ? 'Complimentary' : `$${shippingCost}`}
                </span>
              </div>
              <div className="flex justify-between text-sm font-medium text-[#F4F3EF] pt-2 border-t border-white/10">
                <span>Total</span>
                <span className="font-mono tabular-nums">${total.toLocaleString()}</span>
              </div>
            </div>

            {step === 'bag' ? (
              <button
                type="button"
                onClick={() => setStep('checkout')}
                className="w-full py-3.5 px-5 rounded-lg bg-[#8C2D2D] hover:bg-[#A13535] text-white text-xs font-medium tracking-wide transition-colors flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
              >
                <span>Proceed to Atelier Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                form="checkout-form"
                className="w-full py-3.5 px-5 rounded-lg bg-[#8C2D2D] hover:bg-[#A13535] text-white text-xs font-medium tracking-wide transition-colors flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
              >
                <span>Complete Order · ${total.toLocaleString()}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {step === 'confirmed' && (
          <div className="p-6 border-t border-white/10 bg-[#141417]">
            <button
              type="button"
              onClick={resetAndClose}
              className="w-full py-3 px-5 rounded-lg bg-white/[0.08] hover:bg-white/[0.14] text-[#F4F3EF] text-xs font-medium transition-colors cursor-pointer"
            >
              Return to Rust &amp; Raven Atelier
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
