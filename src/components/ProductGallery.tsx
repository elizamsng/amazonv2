import React, { useState, useRef } from 'react';
import {
  Share2,
  Heart,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Play,
} from 'lucide-react';
import { GalleryItem } from '../data/productData';
import { SafeImage } from './SafeImage';

interface ProductGalleryProps {
  items: GalleryItem[];
  activeIndex: number;
  onChangeIndex: (index: number) => void;
  isWishlisted: boolean;
  onToggleWishlist: () => void;
  onShare: () => void;
  onOpenFullView: () => void;
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({
  items,
  activeIndex,
  onChangeIndex,
  isWishlisted,
  onToggleWishlist,
  onShare,
  onOpenFullView,
}) => {
  const [isZoomed, setIsZoomed] = useState(false);
  const [origin, setOrigin] = useState({ x: 50, y: 50 });
  const stageRef = useRef<HTMLDivElement>(null);

  const currentItem = items[activeIndex] || items[0];

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsZoomed(false);
    onChangeIndex((activeIndex - 1 + items.length) % items.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsZoomed(false);
    onChangeIndex((activeIndex + 1) % items.length);
  };

  const updatePanOrigin = (clientX: number, clientY: number) => {
    if (!stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100));
    setOrigin({ x, y });
  };

  const handleStageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed) {
      updatePanOrigin(e.clientX, e.clientY);
      setIsZoomed(true);
    } else {
      setIsZoomed(false);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isZoomed) return;
    updatePanOrigin(e.clientX, e.clientY);
  };

  return (
    <section
      className="relative bg-white pt-2 pb-4 border-b border-gray-100 lg:border-b-0 lg:sticky lg:top-16"
      data-purpose="product-gallery"
    >
      {/* Top Action Floating Buttons (Share, Wishlist, Inline Zoom Toggle) */}
      <div className="absolute right-3 top-3 z-10 flex flex-col space-y-2">
        <button
          aria-label="Share product"
          onClick={onShare}
          type="button"
          className="w-10 h-10 rounded-full bg-white shadow-md border border-gray-200 flex items-center justify-center text-gray-600 hover:text-gray-900 active:scale-95 transition-transform focus-visible:outline-2 focus-visible:outline-[#007185]"
        >
          <Share2 className="w-4 h-4" />
        </button>
        <button
          aria-label={isWishlisted ? 'Remove from wish list' : 'Add to wish list'}
          onClick={onToggleWishlist}
          type="button"
          className={`w-10 h-10 rounded-full bg-white shadow-md border border-gray-200 flex items-center justify-center active:scale-95 transition-all focus-visible:outline-2 focus-visible:outline-[#007185] ${
            isWishlisted ? 'text-[#CC0C39] border-[#CC0C39]/30' : 'text-gray-600 hover:text-[#CC0C39]'
          }`}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-[#CC0C39]' : ''}`} />
        </button>
        <button
          aria-label={isZoomed ? 'Reset image zoom' : 'Zoom in on image'}
          onClick={() => setIsZoomed((z) => !z)}
          type="button"
          className={`w-10 h-10 rounded-full bg-white shadow-md border flex items-center justify-center active:scale-95 transition-all focus-visible:outline-2 focus-visible:outline-[#007185] ${
            isZoomed
              ? 'text-[#007185] border-[#007185] bg-teal-50'
              : 'text-gray-600 border-gray-200 hover:text-gray-900'
          }`}
        >
          {isZoomed ? <ZoomOut className="w-4 h-4" /> : <ZoomIn className="w-4 h-4" />}
        </button>
      </div>

      {/* Main Showcase Image Container — Inline Click-to-Zoom keeps item description in view */}
      <div
        ref={stageRef}
        onClick={handleStageClick}
        onPointerMove={handlePointerMove}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsZoomed((z) => !z);
          }
        }}
        aria-label={
          isZoomed
            ? 'Zoomed product view. Move pointer to pan or click to zoom out.'
            : 'Click to zoom in on product image while keeping item description visible.'
        }
        className={`relative group w-full flex items-center justify-center px-6 min-h-[320px] lg:min-h-[420px] bg-white rounded-lg overflow-hidden select-none border transition-colors ${
          isZoomed
            ? 'cursor-zoom-out border-[#007185]/40 bg-neutral-50/40'
            : 'cursor-zoom-in border-transparent'
        }`}
      >
        {!isZoomed && (
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous product image"
            className="hidden sm:flex absolute left-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/90 border border-gray-200 shadow-sm items-center justify-center text-gray-600 hover:text-gray-900 opacity-80 group-hover:opacity-100 transition-opacity"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}

        <div
          className="w-full flex items-center justify-center transition-transform duration-150 ease-out"
          style={{
            transform: isZoomed ? 'scale(2.25)' : 'scale(1)',
            transformOrigin: `${origin.x}% ${origin.y}%`,
          }}
        >
          <SafeImage
            src={currentItem.src}
            alt={currentItem.alt}
            fallbackLabel={currentItem.caption || currentItem.alt}
            className="max-h-[300px] lg:max-h-[390px] w-auto object-contain mx-auto rounded pointer-events-none"
          />
        </div>

        {!isZoomed && (
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next product image"
            className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/90 border border-gray-200 shadow-sm items-center justify-center text-gray-600 hover:text-gray-900 opacity-80 group-hover:opacity-100 transition-opacity"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}

        {isZoomed && (
          <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 bg-[#131921]/85 text-white text-[11px] font-medium px-3 py-1 rounded-full whitespace-nowrap pointer-events-none">
            2.25× Zoom · Move pointer to pan · Click to reset
          </div>
        )}
      </div>

      {/* Inline zoom hint + 360° modal prompt */}
      <div className="flex items-center justify-center gap-4 mt-2">
        <button
          onClick={() => setIsZoomed((z) => !z)}
          className="text-xs text-gray-600 hover:text-[#007185] font-medium inline-flex items-center min-h-[32px] px-1.5"
          type="button"
        >
          {isZoomed ? (
            <>
              <ZoomOut className="w-3.5 h-3.5 mr-1 text-[#007185]" />
              Reset zoom
            </>
          ) : (
            <>
              <ZoomIn className="w-3.5 h-3.5 mr-1 text-gray-400" />
              Click image to zoom
            </>
          )}
        </button>
        <span className="text-gray-300" aria-hidden="true">|</span>
        <button
          onClick={onOpenFullView}
          className="text-xs text-[#007185] hover:text-[#C7511F] hover:underline font-medium inline-flex items-center min-h-[32px] px-1.5"
          type="button"
        >
          Open 360° view
        </button>
      </div>

      {/* Carousel Pagination Dots */}
      <div className="flex items-center justify-center space-x-1.5 mt-1.5">
        {items.map((item, idx) => (
          <button
            key={item.id}
            type="button"
            aria-label={`View image ${idx + 1}: ${item.label}`}
            onMouseEnter={() => {
              setIsZoomed(false);
              onChangeIndex(idx);
            }}
            onClick={() => {
              setIsZoomed(false);
              onChangeIndex(idx);
            }}
            className={`h-2 rounded-full transition-all duration-200 ${
              idx === activeIndex ? 'bg-[#007185] w-4' : 'bg-gray-300 w-2 hover:bg-gray-400'
            }`}
          />
        ))}
      </div>

      {/* Gallery Preview Thumbnails — Hover OR click changes main image */}
      <div className="flex items-center justify-center space-x-2 px-4 mt-3 overflow-x-auto no-scrollbar py-1">
        {items.map((item, idx) => {
          const isActive = idx === activeIndex;
          return (
            <button
              key={item.id}
              type="button"
              onMouseEnter={() => {
                setIsZoomed(false);
                onChangeIndex(idx);
              }}
              onFocus={() => {
                setIsZoomed(false);
                onChangeIndex(idx);
              }}
              onClick={() => {
                setIsZoomed(false);
                onChangeIndex(idx);
              }}
              className={`relative w-13 h-13 rounded p-0.5 shrink-0 bg-white transition-all flex flex-col items-center justify-center overflow-hidden ${
                isActive
                  ? 'border-2 border-[#007185] shadow-sm'
                  : 'border border-gray-200 hover:border-[#007185]/60'
              }`}
              aria-label={`Preview ${item.label} view`}
            >
              <SafeImage
                src={item.src}
                alt={item.label}
                className="w-full h-full object-contain"
              />
              {item.isVideoSpotlight && (
                <span className="absolute bottom-0.5 right-0.5 bg-black/75 text-white rounded-full p-0.5">
                  <Play className="w-2.5 h-2.5 fill-white" />
                </span>
              )}
              <span className="sr-only">{item.label}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
};
