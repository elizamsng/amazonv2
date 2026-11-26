import React, { useState, useRef } from 'react';
import { X, RotateCw, ZoomIn, ZoomOut } from 'lucide-react';
import { GalleryItem } from '../data/productData';
import { SafeImage } from './SafeImage';

interface FullView360ModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: GalleryItem[];
  activeIndex: number;
  onChangeIndex: (index: number) => void;
  productTitle: string;
  productPrice: number;
  productHighlights: { lead: string; body: string }[];
}

export const FullView360Modal: React.FC<FullView360ModalProps> = ({
  isOpen,
  onClose,
  items,
  activeIndex,
  onChangeIndex,
  productTitle,
  productPrice,
  productHighlights,
}) => {
  const [zoomed, setZoomed] = useState(false);
  const [origin, setOrigin] = useState({ x: 50, y: 50 });
  const [mode, setMode] = useState<'gallery' | '360'>('gallery');
  const [rotationAngle, setRotationAngle] = useState(0);
  const dragStartX = useRef<number | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const currentItem = items[activeIndex] || items[0];

  const handlePointerDown = (e: React.PointerEvent) => {
    if (mode !== '360') return;
    dragStartX.current = e.clientX;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (zoomed && stageRef.current) {
      const rect = stageRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
      const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
      setOrigin({ x, y });
    }
    if (mode !== '360' || dragStartX.current === null) return;
    const delta = e.clientX - dragStartX.current;
    if (Math.abs(delta) >= 25) {
      const step = delta > 0 ? 1 : -1;
      const nextIdx = (activeIndex + step + items.length) % items.length;
      onChangeIndex(nextIdx);
      setRotationAngle((prev) => prev + (delta > 0 ? 45 : -45));
      dragStartX.current = e.clientX;
    }
  };

  const handlePointerUp = () => {
    dragStartX.current = null;
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Product full view and 360 degree viewer"
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMode('gallery')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                mode === 'gallery'
                  ? 'bg-[#131921] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Images
            </button>
            <button
              type="button"
              onClick={() => {
                setZoomed(false);
                setMode('360');
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md inline-flex items-center gap-1.5 transition-colors ${
                mode === '360'
                  ? 'bg-[#131921] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <RotateCw className="w-3.5 h-3.5" />
              360° Spin View
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setZoomed((z) => !z)}
              aria-label={zoomed ? 'Zoom out' : 'Zoom in'}
              className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium inline-flex items-center gap-1.5 ${
                zoomed
                  ? 'border-[#007185] text-[#007185] bg-teal-50'
                  : 'border-gray-200 text-gray-700 hover:bg-gray-100'
              }`}
            >
              {zoomed ? <ZoomOut className="w-4 h-4" /> : <ZoomIn className="w-4 h-4" />}
              <span>{zoomed ? 'Reset Zoom' : 'Zoom 2×'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close full view"
              className="p-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Split Content: Image Stage (Left) + Item Description Always In View (Right / Bottom) */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12">
          {/* Image Stage */}
          <div
            ref={stageRef}
            onClick={() => {
              if (mode === 'gallery') setZoomed((z) => !z);
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            className={`lg:col-span-7 relative min-h-[280px] sm:min-h-[380px] bg-white flex flex-col items-center justify-center p-6 select-none overflow-hidden border-b lg:border-b-0 lg:border-r border-gray-200 ${
              mode === '360'
                ? 'cursor-grab active:cursor-grabbing'
                : zoomed
                ? 'cursor-zoom-out'
                : 'cursor-zoom-in'
            }`}
          >
            <div
              className="transition-transform duration-150 flex items-center justify-center"
              style={{
                transform: `scale(${zoomed ? 2 : 1})`,
                transformOrigin: `${origin.x}% ${origin.y}%`,
              }}
            >
              <SafeImage
                src={currentItem.src}
                alt={currentItem.alt}
                className="max-h-[280px] sm:max-h-[360px] w-auto object-contain pointer-events-none"
              />
            </div>

            {mode === '360' && (
              <>
                <div className="mt-4 flex items-center gap-3 text-xs text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full">
                  <RotateCw className="w-3.5 h-3.5 text-[#007185]" />
                  <span>
                    Drag horizontally or scrub slider ({((rotationAngle % 360) + 360) % 360}°)
                  </span>
                </div>
                <div className="w-64 mt-3">
                  <input
                    type="range"
                    aria-label="Rotate product angle"
                    min={0}
                    max={items.length - 1}
                    value={activeIndex}
                    onChange={(e) => {
                      const idx = Number(e.target.value);
                      onChangeIndex(idx);
                      setRotationAngle(idx * 72);
                    }}
                    className="w-full accent-[#007185]"
                  />
                </div>
              </>
            )}
          </div>

          {/* Item Description Panel (stays in view while zooming) */}
          <aside className="lg:col-span-5 p-4 sm:p-5 bg-gray-50/70 space-y-3 overflow-y-auto">
            <div>
              <h3 className="text-sm font-bold text-gray-900 leading-snug">
                {productTitle}
              </h3>
              <p className="text-lg font-bold text-gray-900 mt-1.5 tabular-nums">
                S${productPrice.toFixed(2)}
                <span className="text-xs font-normal text-gray-500 ml-1.5">
                  (GST included)
                </span>
              </p>
            </div>

            <div className="pt-2 border-t border-gray-200">
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-2">
                Item Description &amp; Highlights
              </h4>
              <ul className="list-disc pl-4 space-y-1.5 text-xs text-gray-700 leading-relaxed">
                {productHighlights.slice(0, 4).map((item) => (
                  <li key={item.lead}>
                    <span className="font-semibold text-gray-900">{item.lead}</span> –{' '}
                    {item.body}
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>

        {/* Caption & Hover-to-Switch Thumbnails */}
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
          <p className="text-xs font-medium text-gray-700 text-center mb-2.5">
            {currentItem.caption || currentItem.alt}
          </p>
          <div className="flex items-center justify-center gap-2 overflow-x-auto no-scrollbar">
            {items.map((item, idx) => (
              <button
                key={item.id}
                type="button"
                onMouseEnter={() => onChangeIndex(idx)}
                onClick={() => onChangeIndex(idx)}
                className={`w-12 h-12 rounded p-0.5 bg-white shrink-0 ${
                  idx === activeIndex
                    ? 'border-2 border-[#007185]'
                    : 'border border-gray-200 hover:border-[#007185]/60'
                }`}
              >
                <SafeImage
                  src={item.src}
                  alt={item.label}
                  className="w-full h-full object-contain"
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
