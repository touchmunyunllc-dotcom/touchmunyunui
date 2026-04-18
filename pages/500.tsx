import { useState, useEffect } from 'react';
import Link from 'next/link';
import { SEO } from '@/components/SEO';

export default function Custom500() {
  const [retrying, setRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [gearRotation, setGearRotation] = useState(0);

  // Slowly spinning gears animation
  useEffect(() => {
    const frame = setInterval(() => {
      setGearRotation((prev) => (prev + 0.5) % 360);
    }, 50);
    return () => clearInterval(frame);
  }, []);

  const handleRetry = async () => {
    setRetrying(true);
    setRetryCount((c) => c + 1);

    // Simulate a retry with a brief delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    // Try to go back or reload
    if (typeof window !== 'undefined') {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.href = '/';
      }
    }
    setRetrying(false);
  };

  return (
    <>
      <SEO
        title="Server Error - TouchMunyun"
        description="An internal server error occurred. Please try again later."
      />
      <div className="min-h-screen bg-black flex items-center justify-center px-4 relative overflow-hidden">
        <style jsx>{`
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(40px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes smoke {
            0% { opacity: 0.6; transform: translateY(0) scale(1); }
            100% { opacity: 0; transform: translateY(-60px) scale(2); }
          }
          @keyframes flicker {
            0%, 100% { opacity: 1; }
            5% { opacity: 0.4; }
            10% { opacity: 1; }
            15% { opacity: 0.7; }
            20% { opacity: 1; }
            80% { opacity: 1; }
            85% { opacity: 0.5; }
            90% { opacity: 1; }
          }
          @keyframes pulse-dot {
            0%, 100% { transform: scale(1); opacity: 0.8; }
            50% { transform: scale(1.5); opacity: 0.3; }
          }
          @keyframes progress-bar {
            0% { width: 0%; }
            100% { width: 100%; }
          }
          .anim-in { animation: fadeInUp 0.7s ease-out forwards; }
          .anim-delay-1 { animation-delay: 0.2s; opacity: 0; }
          .anim-delay-2 { animation-delay: 0.4s; opacity: 0; }
          .anim-delay-3 { animation-delay: 0.6s; opacity: 0; }
          .smoke-particle {
            position: absolute;
            width: 8px;
            height: 8px;
            background: radial-gradient(circle, rgba(220, 38, 38, 0.4), transparent);
            border-radius: 50%;
            animation: smoke 3s ease-out infinite;
          }
          .flicker { animation: flicker 4s ease-in-out infinite; }
          .retry-progress {
            animation: progress-bar 1.5s ease-in-out;
          }
        `}</style>

        {/* Background grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />

        {/* Smoke particles rising from the "broken" server */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="smoke-particle"
            style={{
              left: `${45 + Math.random() * 10}%`,
              bottom: '35%',
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}

        <div className="relative z-10 text-center max-w-lg w-full">
          {/* Animated broken gear illustration */}
          <div className="relative w-32 h-32 mx-auto mb-8 anim-in">
            <svg
              className="w-32 h-32 flicker"
              viewBox="0 0 100 100"
              fill="none"
              style={{ transform: `rotate(${gearRotation}deg)` }}
            >
              {/* Outer gear */}
              <path
                d="M50 10 L54 22 L62 14 L60 28 L72 24 L64 36 L76 38 L64 44 L74 52 L62 50 L66 62 L56 54 L54 66 L50 54 L46 66 L44 54 L34 62 L38 50 L26 52 L36 44 L24 38 L36 36 L28 24 L40 28 L38 14 L46 22 Z"
                stroke="#DC2626"
                strokeWidth="1.5"
                fill="none"
                opacity="0.6"
              />
              {/* Inner circle */}
              <circle cx="50" cy="38" r="12" stroke="#DC2626" strokeWidth="1.5" fill="none" opacity="0.4" />
              {/* Crack lines */}
              <line x1="44" y1="32" x2="56" y2="44" stroke="#f87171" strokeWidth="2" strokeLinecap="round" />
              <line x1="48" y1="30" x2="52" y2="46" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            {/* Second gear (counter-rotating) */}
            <svg
              className="absolute top-12 -right-4 w-16 h-16 opacity-30"
              viewBox="0 0 100 100"
              fill="none"
              style={{ transform: `rotate(${-gearRotation * 1.5}deg)` }}
            >
              <path
                d="M50 15 L53 25 L60 18 L58 30 L68 27 L62 37 L72 39 L62 44 L70 50 L60 49 L63 58 L55 52 L53 62 L50 52 L47 62 L45 52 L37 58 L40 49 L30 50 L38 44 L28 39 L38 37 L32 27 L42 30 L40 18 L47 25 Z"
                stroke="#6b7280"
                strokeWidth="1.5"
                fill="none"
              />
              <circle cx="50" cy="39" r="10" stroke="#6b7280" strokeWidth="1.5" fill="none" />
            </svg>
            {/* Status indicator */}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-red-950/50 border border-red-900/30 rounded-full px-3 py-1">
              <div className="w-2 h-2 rounded-full bg-red-500" style={{ animation: 'pulse-dot 1.5s ease-in-out infinite' }} />
              <span className="text-[10px] text-red-400 font-mono uppercase tracking-wider">Offline</span>
            </div>
          </div>

          {/* Error code */}
          <h1 className="text-7xl sm:text-8xl font-black text-white mb-2 tracking-tighter anim-in anim-delay-1">
            <span className="text-red-500">5</span>
            <span className="text-white">0</span>
            <span className="text-red-500">0</span>
          </h1>

          <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 anim-in anim-delay-1">
            Our servers are taking a breather
          </h2>
          <p className="text-grey-400 text-sm mb-8 max-w-sm mx-auto anim-in anim-delay-2">
            We hit a snag behind the scenes. Our team has been notified and is working on it. You can try again or browse while we fix things up.
          </p>

          {/* Retry button with progress indicator */}
          <div className="space-y-4 anim-in anim-delay-2">
            <button
              onClick={handleRetry}
              disabled={retrying}
              className="group relative px-8 py-4 bg-red-600 hover:bg-red-700 disabled:bg-red-900 text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-glow-red overflow-hidden disabled:cursor-wait"
            >
              {retrying && (
                <div className="absolute bottom-0 left-0 h-0.5 bg-red-300 retry-progress" />
              )}
              <span className="flex items-center justify-center gap-2.5">
                {retrying ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Reconnecting...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 transition-transform group-hover:-rotate-180 duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    {retryCount > 0 ? `Retry Again (${retryCount})` : 'Try Again'}
                  </>
                )}
              </span>
            </button>

            <div className="flex flex-wrap gap-3 justify-center">
              <Link
                href="/"
                className="flex items-center gap-2 px-5 py-3 bg-white/5 hover:bg-white/10 border border-grey-800 hover:border-gold-600/50 rounded-xl transition-all duration-300"
              >
                <svg className="w-4 h-4 text-grey-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span className="text-sm text-grey-300">Home</span>
              </Link>
              <Link
                href="/products"
                className="flex items-center gap-2 px-5 py-3 bg-white/5 hover:bg-white/10 border border-grey-800 hover:border-red-600/50 rounded-xl transition-all duration-300"
              >
                <svg className="w-4 h-4 text-grey-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <span className="text-sm text-grey-300">Shop</span>
              </Link>
              <a
                href="mailto:TouchMunyunLLC@gmail.com"
                className="flex items-center gap-2 px-5 py-3 bg-white/5 hover:bg-white/10 border border-grey-800 hover:border-grey-600/50 rounded-xl transition-all duration-300"
              >
                <svg className="w-4 h-4 text-grey-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-sm text-grey-300">Contact</span>
              </a>
            </div>
          </div>

          {/* Helpful status bar */}
          <div className="mt-12 anim-in anim-delay-3">
            <div className="inline-flex items-center gap-2 bg-white/[0.03] border border-grey-800/50 rounded-full px-4 py-2">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500" style={{ animation: 'pulse-dot 1.5s ease-in-out infinite' }} />
                <div className="w-1.5 h-1.5 rounded-full bg-gold-500" style={{ animation: 'pulse-dot 1.5s ease-in-out infinite 0.3s' }} />
                <div className="w-1.5 h-1.5 rounded-full bg-grey-500" style={{ animation: 'pulse-dot 1.5s ease-in-out infinite 0.6s' }} />
              </div>
              <span className="text-[11px] text-grey-500 font-mono">
                Our team has been notified &middot; Error ID: {Math.random().toString(36).substring(2, 8).toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
