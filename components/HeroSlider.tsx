import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';

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
  autoPlayInterval = 5000 
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  // Auto-play functionality
  useEffect(() => {
    if (slides.length === 0 || isPaused) return;

    intervalRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, autoPlayInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [slides.length, autoPlayInterval, isPaused]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        goToPrevious();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlide, slides.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 3000); // Resume after 3 seconds
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 3000);
  };

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 3000);
  };

  if (slides.length === 0) {
    return (
      <div className="relative overflow-hidden bg-black h-[600px] flex items-center justify-center">
        {/* Sports Background for Empty State */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1574629810360-7efbbe195018?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80')`,
            backgroundPosition: 'center',
            backgroundSize: 'cover',
            backgroundAttachment: 'fixed',
          }}
        >
          <div className="absolute inset-0 bg-black/80" />
        </div>
        <p className="text-white text-xl relative z-10">No slides available</p>
      </div>
    );
  }

  return (
    <div
      ref={sliderRef}
      className="relative overflow-hidden bg-black h-[500px] sm:h-[600px] lg:h-[700px]"
      role="region"
      aria-label="Hero image slider"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      {/* Dynamic Sports Background Animation - Behind Slideshow */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1574629810360-7efbbe195018?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80')`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
          backgroundAttachment: 'fixed',
        }}
      >
        {/* Dark Overlay for Readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/70" />
        
        {/* Red Accent Overlay for Sports Energy */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-600/12 via-transparent to-red-600/8" />
        
        {/* Gold Accent Overlay */}
        <div className="absolute inset-0 bg-gradient-to-tl from-transparent via-transparent to-gold-600/5" />
        
        {/* Animated Sports Pattern Overlay */}
        <div className="absolute inset-0 opacity-15">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M50 20 L60 50 L50 40 L40 50 Z' fill='%23dc2626' opacity='0.3'/%3E%3Ccircle cx='20' cy='20' r='3' fill='%23ffffff' opacity='0.2'/%3E%3Ccircle cx='80' cy='80' r='3' fill='%23ffffff' opacity='0.2'/%3E%3C/svg%3E")`,
            backgroundSize: '200px 200px',
            animation: 'shimmer 20s linear infinite',
          }} />
        </div>
      </div>

      {/* Floating Sports Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-red-600/15 rounded-full blur-xl animate-float animation-delay-200 z-0" />
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-gold-600/15 rounded-full blur-2xl animate-float animation-delay-400 z-0" />
      <div className="absolute top-1/2 right-20 w-16 h-16 bg-white/8 rounded-full blur-lg animate-float animation-delay-600 z-0" />
      <div className="absolute bottom-1/4 left-20 w-24 h-24 bg-red-600/12 rounded-full blur-xl animate-float animation-delay-300 z-0" />
      <div className="absolute top-1/4 left-1/3 w-28 h-28 bg-gold-600/12 rounded-full blur-2xl animate-float animation-delay-500 z-0" />

      {/* Slides - On Top of Sports Background */}
      <div className="relative w-full h-full z-10">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
            role="group"
            aria-roledescription="slide"
            aria-label={`Slide ${index + 1} of ${slides.length}`}
          >
            {/* Background Image - Slideshow on top of sports background */}
            <div className="absolute inset-0 overflow-hidden">
              <Image
                src={slide.imageUrl}
                alt={slide.alt}
                fill
                className="object-cover"
                style={{ 
                  objectFit: 'cover',
                  objectPosition: 'center',
                }}
                priority={index === 0}
                sizes="100vw"
                quality={90}
                unoptimized={false}
              />
              {/* Overlay for better text readability - Semi-transparent to show sports background */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/30 to-transparent" />
            </div>

            {/* Content */}
            <div className="relative z-10 h-full flex items-center">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div className="max-w-2xl">
                  {slide.title && (
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-white mb-4 animate-text-reveal drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                      {slide.title}
                    </h1>
                  )}
                  {slide.subtitle && (
                    <p className="mt-4 text-xl sm:text-2xl text-white/95 leading-relaxed animate-slide-up animation-delay-200 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" style={{ animationFillMode: 'forwards' }}>
                      {slide.subtitle}
                    </p>
                  )}
                  {slide.ctaText && slide.ctaLink && (
                    <div className="mt-8 animate-slide-up animation-delay-400" style={{ animationFillMode: 'forwards' }}>
                      <Link
                        href={slide.ctaLink}
                        className="group inline-flex items-center justify-center px-10 py-5 text-lg font-bold text-white bg-red-600 rounded-xl hover:bg-red-700 transform hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-glow-red focus:outline-none focus:ring-4 focus:ring-red-600/50 relative overflow-hidden"
                      >
                        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                        <span className="relative z-10 flex items-center">
                          {slide.ctaText}
                          <svg
                            className="ml-2 w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 7l5 5m0 0l-5 5m5-5H6"
                            />
                          </svg>
                        </span>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/40 backdrop-blur-md hover:bg-red-600/60 text-white p-3 rounded-full transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-red-600/50 shadow-glass border border-white/30 hover:border-red-600/50"
        aria-label="Previous slide"
        type="button"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>
      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/40 backdrop-blur-md hover:bg-red-600/60 text-white p-3 rounded-full transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-red-600/50 shadow-glass border border-white/30 hover:border-red-600/50"
        aria-label="Next slide"
        type="button"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>

      {/* Slide Indicators */}
      <div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex space-x-2"
        role="tablist"
        aria-label="Slide indicators"
      >
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            onClick={() => goToSlide(index)}
            className={`h-2 rounded-full transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-red-600/50 ${
              index === currentSlide
                ? 'w-8 bg-red-600 shadow-glow-red'
                : 'w-2 bg-white/50 hover:bg-white/75'
            }`}
            aria-label={`Go to slide ${index + 1}`}
            aria-selected={index === currentSlide}
            role="tab"
            type="button"
          />
        ))}
      </div>

      {/* Pause/Play Indicator */}
      {isPaused && (
        <div className="absolute top-4 right-4 z-20 bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-full text-sm shadow-glass border border-white/30">
          Paused
        </div>
      )}
    </div>
  );
};

