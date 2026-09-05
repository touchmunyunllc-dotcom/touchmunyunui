import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { IMAGE_SIZES } from '@/lib/imageSizes';
import { CouponSlider } from '@/components/CouponSlider';

interface Slide {
  id: string;
  imageUrl: string;
  alt: string;
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  order?: number;
  isActive?: boolean;
}

interface HeroSliderProps {
  slides: Slide[];
  autoPlayInterval?: number;
}

export const HeroSlider: React.FC<HeroSliderProps> = ({
  slides,
  autoPlayInterval = 5000,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [copyVisible, setCopyVisible] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const progressRef = useRef<NodeJS.Timeout | null>(null);

  const goToSlide = useCallback((index: number, pauseAuto = true) => {
    setCopyVisible(false);
    setTimeout(() => {
      setCurrentSlide(index);
      setProgress(0);
      setCopyVisible(true);
    }, 200);
    if (pauseAuto) {
      setIsPaused(true);
      setTimeout(() => setIsPaused(false), 3000);
    }
  }, []);

  const goToNext = useCallback(() => {
    goToSlide((currentSlide + 1) % slides.length);
  }, [currentSlide, slides.length, goToSlide]);

  const goToPrevious = useCallback(() => {
    goToSlide((currentSlide - 1 + slides.length) % slides.length);
  }, [currentSlide, slides.length, goToSlide]);

  useEffect(() => {
    if (slides.length <= 1) return;

    if (isPaused) {
      if (progressRef.current) clearInterval(progressRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
      progressRef.current = null;
      intervalRef.current = null;
      return;
    }

    setProgress(0);
    progressRef.current = setInterval(() => {
      setProgress((p) => Math.min(100, p + 100 / (autoPlayInterval / 50)));
    }, 50);

    intervalRef.current = setInterval(() => {
      setCopyVisible(false);
      setTimeout(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
        setCopyVisible(true);
        setProgress(0);
      }, 200);
    }, autoPlayInterval);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
      intervalRef.current = null;
      progressRef.current = null;
    };
  }, [slides.length, autoPlayInterval, isPaused]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goToPrevious();
      else if (e.key === 'ArrowRight') goToNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNext, goToPrevious]);

  if (slides.length === 0) {
    return (
      <div className="relative flex min-h-[320px] items-center justify-center bg-black sm:min-h-[400px]">
        <p className="text-white/60 text-sm">No slides available</p>
      </div>
    );
  }

  const active = slides[currentSlide];
  const slideNum = String(currentSlide + 1).padStart(2, '0');
  const slideTotal = String(slides.length).padStart(2, '0');

  return (
    <div
      className="group flex flex-col md:flex-row md:items-stretch bg-black md:h-[min(68vh,760px)] md:min-h-[460px]"
      role="region"
      aria-label="Hero image slider"
      aria-roledescription="carousel"
    >
      {/* Slide images — fixed aspect on mobile; fill column on desktop without distortion */}
      <div
        className="relative w-full min-w-0 overflow-hidden bg-black aspect-[5/4] sm:aspect-[3/2] md:aspect-auto md:flex-1 md:h-auto md:min-h-[420px]"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {slides.map((slide, index) => {
          const isActive = index === currentSlide;
          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-700 ease-out ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
              role="group"
              aria-roledescription="slide"
              aria-label={`Slide ${index + 1} of ${slides.length}`}
              aria-hidden={!isActive}
            >
              <div className="relative h-full w-full">
                <Image
                  src={slide.imageUrl}
                  alt={slide.alt}
                  fill
                  className="object-cover object-center brightness-[1.12] saturate-[1.04]"
                  style={{ objectFit: 'cover', objectPosition: 'center' }}
                  priority={index === 0}
                  sizes="(max-width: 768px) 100vw, 62vw"
                  quality={90}
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />
            </div>
          );
        })}

        <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-20 rounded-full border border-white/15 bg-black/50 backdrop-blur-sm px-3 py-1 text-xs font-medium text-white/80 tabular-nums">
          {slideNum}
          <span className="text-white/35 mx-1">/</span>
          {slideTotal}
        </div>

        <button
          onClick={goToPrevious}
          className="absolute left-3 top-1/2 -translate-y-1/2 z-20 rounded-full border border-white/20 bg-black/40 p-2 text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 focus:opacity-100 hover:bg-red-600/80 hover:border-red-500/50 transition-all touch-manipulation"
          aria-label="Previous slide"
          type="button"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={goToNext}
          className="absolute right-3 top-1/2 -translate-y-1/2 z-20 rounded-full border border-white/20 bg-black/40 p-2 text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 focus:opacity-100 hover:bg-red-600/80 hover:border-red-500/50 transition-all touch-manipulation md:hidden"
          aria-label="Next slide"
          type="button"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <div className="absolute bottom-0 left-0 right-0 z-20 md:hidden">
          <div className="h-0.5 w-full bg-white/10">
            <div
              className="h-full bg-gradient-to-r from-red-600 to-gold-600 transition-[width] duration-75 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Copy panel — right side on desktop, below image on mobile */}
      <aside className="relative flex flex-col justify-center border-t md:border-t-0 md:border-l border-white/10 bg-black md:w-[min(38%,420px)] lg:w-[440px] shrink-0 px-5 py-6 sm:px-8 sm:py-8 md:min-h-[420px]">
        <div
          className={`transition-all duration-500 ${
            copyVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}
        >
          {active.title && (
            <>
              <div className="mb-4 h-0.5 w-10 bg-gradient-to-r from-red-600 to-gold-600 rounded-full" />
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-snug tracking-tight">
                {active.title}
                {active.subtitle && (
                  <span className="block mt-2 text-red-500">{active.subtitle}</span>
                )}
              </h1>
            </>
          )}
          {!active.title && active.subtitle && (
            <p className="text-lg text-white/90 leading-relaxed">{active.subtitle}</p>
          )}
          {active.ctaText && active.ctaLink && (
            <div className="mt-6">
              <Link
                href={active.ctaLink}
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition-all hover:shadow-glow-red focus:outline-none focus:ring-2 focus:ring-red-500/50"
              >
                {active.ctaText}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          )}
        </div>

        <div className="mt-8 flex items-center justify-between gap-4">
          <div className="flex gap-1.5" role="tablist" aria-label="Slide indicators">
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                onClick={() => goToSlide(index)}
                className={`h-1 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-500/50 ${
                  index === currentSlide ? 'w-8 bg-red-600' : 'w-4 bg-white/25 hover:bg-white/40'
                }`}
                aria-label={`Go to slide ${index + 1}`}
                aria-selected={index === currentSlide}
                role="tab"
                type="button"
              />
            ))}
          </div>
          <div className="hidden md:flex items-center gap-2">
            {isPaused && (
              <span className="text-[10px] uppercase tracking-widest text-white/35">Paused</span>
            )}
            <button
              onClick={goToPrevious}
              type="button"
              aria-label="Previous slide"
              className="rounded-lg border border-white/15 p-1.5 text-white/70 hover:text-white hover:border-red-500/40 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={goToNext}
              type="button"
              aria-label="Next slide"
              className="rounded-lg border border-white/15 p-1.5 text-white/70 hover:text-white hover:border-red-500/40 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        <div className="hidden md:block mt-4 h-0.5 w-full bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-red-600 to-gold-600 transition-[width] duration-75 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>

        <CouponSlider variant="inline" />
      </aside>
    </div>
  );
};
