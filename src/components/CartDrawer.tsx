import React, { useState, useEffect } from 'react';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShieldCheck,
  ShoppingBag,
  Minimize2,
  Maximize2,
} from 'lucide-react';
import { CartItem } from '../data/productData';
import { SafeImage } from './SafeImage';

interface CartSummaryItemRowProps {
  item: CartItem;
  onSetQty: (id: string, qty: number) => void;
  onRemoveItem: (id: string) => void;
}

const CartSummaryItemRow: React.FC<CartSummaryItemRowProps> = ({
  item,
  onSetQty,
  onRemoveItem,
}) => {
  const [qtyText, setQtyText] = useState(String(item.quantity));

  useEffect(() => {
    setQtyText(String(item.quantity));
  }, [item.quantity]);

  const commitQty = (raw: string) => {
    const parsed = parseInt(raw, 10);
    if (Number.isNaN(parsed) || parsed < 1) {
      setQtyText(String(item.quantity));
      return;
    }
    const clamped = Math.min(99, parsed);
    setQtyText(String(clamped));
    onSetQty(item.id, clamped);
  };

  return (
    <div className="py-3 flex gap-2.5">
      <div className="w-14 h-14 rounded border border-gray-200 bg-white p-1 shrink-0 flex items-center justify-center">
        <SafeImage
          src={item.image}
          alt={item.title}
          className="w-full h-full object-contain"
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-900 line-clamp-1 leading-snug">
          {item.title}
        </p>
        <p className="text-xs font-bold text-gray-900 mt-0.5 tabular-nums">
          S${item.price.toFixed(2)}
        </p>

        <div className="mt-1.5 flex items-center gap-2.5">
          <div className="inline-flex items-center border border-gray-300 rounded-md bg-gray-50">
            <button
              type="button"
              aria-label={`Decrease quantity of ${item.title}`}
              onClick={() => onSetQty(item.id, item.quantity - 1)}
              className="p-1 text-gray-700 hover:bg-gray-200 rounded-l-md"
            >
              <Minus className="w-3 h-3" />
            </button>
            <input
              type="number"
              inputMode="numeric"
              min={1}
              max={99}
              aria-label={`Quantity for ${item.title}`}
              value={qtyText}
              onChange={(e) => {
                const val = e.target.value;
                setQtyText(val);
                const parsed = parseInt(val, 10);
                if (!Number.isNaN(parsed) && parsed >= 1 && parsed <= 99) {
                  onSetQty(item.id, parsed);
                }
              }}
              onBlur={() => commitQty(qtyText)}
              className="w-10 text-center text-xs font-bold text-gray-900 bg-white border-x border-gray-200 py-0.5 focus:outline-none focus:ring-1 focus:ring-[#007185] tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <button
              type="button"
              aria-label={`Increase quantity of ${item.title}`}
              onClick={() => onSetQty(item.id, Math.min(99, item.quantity + 1))}
              className="p-1 text-gray-700 hover:bg-gray-200 rounded-r-md"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
          <button
            type="button"
            onClick={() => onRemoveItem(item.id)}
            className="text-[11px] text-[#007185] hover:text-[#C7511F] hover:underline inline-flex items-center gap-0.5"
          >
            <Trash2 className="w-3 h-3" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

interface CartDrawerProps {
  isOpen: boolean;
  isMinimized: boolean;
  onMinimize: () => void;
  onExpand: () => void;
  onClose: () => void;
  items: CartItem[];
  postalCode: string;
  onSetQty: (id: string, qty: number) => void;
  onRemoveItem: (id: string) => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  isMinimized,
  onMinimize,
  onExpand,
  onClose,
  items,
  postalCode,
  onSetQty,
  onRemoveItem,
  onProceedToCheckout,
}) => {
  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Compact Minimized Cart Summary Widget (unobtrusive, lets user keep browsing/shopping)
  if (isMinimized) {
    return (
      <div
        className="fixed bottom-3 right-3 z-40 bg-[#131921] text-white rounded-full shadow-xl border border-white/15 px-3 py-1.5 flex items-center gap-2.5 text-xs"
        role="region"
        aria-label="Minimized Cart Summary"
      >
        <button
          type="button"
          onClick={onExpand}
          className="flex items-center gap-2 hover:text-[#febd69] transition-colors"
          aria-label="Expand Cart Summary"
        >
          <ShoppingBag className="w-4 h-4 text-[#febd69]" />
          <span className="font-semibold tabular-nums">
            Cart ({totalCount}) · S${subtotal.toFixed(2)}
          </span>
          <Maximize2 className="w-3.5 h-3.5 text-gray-300" />
        </button>
        {totalCount > 0 && (
          <button
            type="button"
            onClick={onProceedToCheckout}
            className="bg-[#FFD814] hover:bg-[#F7CA00] text-gray-900 font-bold px-2.5 py-1 rounded-full text-[11px] whitespace-nowrap"
          >
            Checkout
          </button>
        )}
      </div>
    );
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed bottom-3 right-3 z-50 w-[calc(100vw-24px)] max-w-sm bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[78vh]"
      role="dialog"
      aria-modal="false"
      aria-label="Cart Summary"
    >
      {/* Compact Header with Minimize & Close */}
      <div className="px-3.5 py-2.5 bg-[#131921] text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-4 h-4 text-[#febd69]" />
          <h2 className="text-xs font-bold">
            Cart Summary ({totalCount})
          </h2>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onMinimize}
            aria-label="Minimize Cart Summary"
            title="Minimize Cart Summary"
            className="px-2 py-1 rounded hover:bg-white/10 text-gray-200 hover:text-white inline-flex items-center gap-1 text-[11px]"
          >
            <Minimize2 className="w-3.5 h-3.5" />
            <span>Minimize</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Cart Summary"
            className="p-1 rounded hover:bg-white/10 text-gray-300 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Free Delivery Callout */}
      <div className="px-3.5 py-2 bg-teal-50 border-b border-teal-100 text-[11px] text-teal-900 flex items-center gap-1.5">
        <ShieldCheck className="w-3.5 h-3.5 text-teal-700 shrink-0" />
        <span className="truncate">
          FREE Delivery to SG {postalCode} · GST included
        </span>
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto divide-y divide-gray-200 px-3.5">
        {items.length === 0 ? (
          <div className="py-10 text-center">
            <ShoppingBag className="w-9 h-9 text-gray-300 mx-auto mb-2" />
            <p className="text-xs font-semibold text-gray-800 mb-1">
              Your Amazon.sg Cart is empty
            </p>
            <p className="text-[11px] text-gray-500">
              Add items from the product page to continue.
            </p>
          </div>
        ) : (
          items.map((item) => (
            <CartSummaryItemRow
              key={item.id}
              item={item}
              onSetQty={onSetQty}
              onRemoveItem={onRemoveItem}
            />
          ))
        )}
      </div>

      {/* Footer Checkout Action */}
      {items.length > 0 && (
        <div className="p-3.5 border-t border-gray-200 bg-gray-50 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-700 font-medium">
              Subtotal ({totalCount} item{totalCount === 1 ? '' : 's'}):
            </span>
            <span className="text-base font-bold text-gray-900 tabular-nums">
              S${subtotal.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onMinimize}
              className="px-3 py-2 bg-white hover:bg-gray-100 text-gray-700 font-medium rounded-full text-xs border border-gray-300 whitespace-nowrap"
            >
              Keep Shopping
            </button>
            <button
              type="button"
              onClick={onProceedToCheckout}
              className="flex-1 bg-[#FFD814] hover:bg-[#F7CA00] active:bg-[#F0B800] text-gray-900 font-semibold py-2 rounded-full shadow-xs text-xs border border-[#FCD200] transition-colors whitespace-nowrap"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
