import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Layout } from '@/components/Layout';
import { SEO } from '@/components/SEO';

export default function Custom404() {
  const router = useRouter();
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [countdown, setCountdown] = useState(15);
  const [searchQuery, setSearchQuery] = useState('');

  // Parallax eye-tracking effect
  const handleMouseMove = useCallback((e: MouseEvent) => {
    setMousePos({
      x: (e.clientX / window.innerWidth) * 100,
      y: (e.clientY / window.innerHeight) * 100,
    });
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);

  // Auto-redirect countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [router]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <>
      <SEO
        title="Page Not Found - TouchMunyun"
        description="The page you're looking for doesn't exist or has been moved."
      />
      <Layout>
        <div className="min-h-[70vh] flex items-center justify-center px-4 py-12 relative overflow-hidden">
          <style jsx>{`
            @keyframes fadeInUp {
              from { opacity: 0; transform: translateY(40px); }
              to { opacity: 1; transform: translateY(0); }
            }
            @keyframes bounce-slow {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-10px); }
            }
            @keyframes dash {
              to { stroke-dashoffset: 0; }
            }
            @keyframes float-item {
              0%, 100% { transform: translateY(0) rotate(0deg); }
              33% { transform: translateY(-15px) rotate(5deg); }
              66% { transform: translateY(-5px) rotate(-3deg); }
            }
            @keyframes countdown-ring {
              from { stroke-dashoffset: 0; }
              to { stroke-dashoffset: 251.2; }
            }
            .anim-in { animation: fadeInUp 0.7s ease-out forwards; }
            .anim-delay-1 { animation-delay: 0.15s; opacity: 0; }
            .anim-delay-2 { animation-delay: 0.3s; opacity: 0; }
            .anim-delay-3 { animation-delay: 0.45s; opacity: 0; }
            .anim-delay-4 { animation-delay: 0.6s; opacity: 0; }
            .floating-item {
              animation: float-item 5s ease-in-out infinite;
            }
          `}</style>

          {/* Ambient floating fashion items */}
          <div className="absolute inset-0 pointer-events-none">
            {['👟', '👕', '🧢', '👜', '🕶️'].map((emoji, i) => (
              <span
                key={i}
                className="absolute text-3xl floating-item select-none"
                style={{
                  left: `${15 + i * 18}%`,
                  top: `${20 + (i % 3) * 25}%`,
                  animationDelay: `${i * 0.8}s`,
                  opacity: 0.12,
                  transform: `translate(${(mousePos.x - 50) * (0.1 + i * 0.05)}px, ${(mousePos.y - 50) * (0.1 + i * 0.05)}px)`,
                  transition: 'transform 0.3s ease-out',
                }}
              >
                {emoji}
              </span>
            ))}
          </div>

          <div className="relative z-10 text-center max-w-xl w-full">
            {/* Big 404 with interactive parallax */}
            <div
              className="anim-in relative mb-6"
              style={{
                transform: `perspective(600px) rotateX(${(mousePos.y - 50) * 0.05}deg) rotateY(${(mousePos.x - 50) * 0.08}deg)`,
                transition: 'transform 0.15s ease-out',
              }}
            >
              <h1 className="text-[10rem] sm:text-[12rem] font-black leading-none tracking-tighter select-none">
                <span className="bg-gradient-to-b from-red-500 via-red-600 to-red-900 bg-clip-text text-transparent">4</span>
                <span className="relative inline-block" style={{ animation: 'bounce-slow 3s ease-in-out infinite' }}>
                  <span className="bg-gradient-to-b from-gold-400 via-gold-600 to-gold-800 bg-clip-text text-transparent">0</span>
                </span>
                <span className="bg-gradient-to-b from-red-500 via-red-600 to-red-900 bg-clip-text text-transparent">4</span>
              </h1>
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80 pointer-events-none" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 anim-in anim-delay-1">
              Lost in the Collection
            </h2>
            <p className="text-grey-400 mb-8 max-w-md mx-auto anim-in anim-delay-2">
              This page slipped through the stitches. It might have been moved, renamed, or never existed.
            </p>

            {/* Inline search */}
            <form onSubmit={handleSearch} className="mb-8 anim-in anim-delay-2">
              <div className="flex gap-2 max-w-sm mx-auto">
                <div className="relative flex-1">
                  <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-grey-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for products..."
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-grey-800 rounded-xl text-white placeholder-grey-600 focus:outline-none focus:border-gold-600 focus:ring-1 focus:ring-gold-600/30 transition-all text-sm"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-all hover:shadow-glow-red text-sm"
                >
                  Search
                </button>
              </div>
            </form>

            {/* Quick navigation */}
            <div className="flex flex-wrap gap-3 justify-center mb-10 anim-in anim-delay-3">
              <Link
                href="/"
                className="group flex items-center gap-2 px-5 py-3 bg-white/5 hover:bg-white/10 border border-grey-800 hover:border-gold-600/50 rounded-xl transition-all duration-300"
              >
                <svg className="w-4 h-4 text-grey-400 group-hover:text-gold-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span className="text-sm text-grey-300 group-hover:text-white transition-colors">Home</span>
              </Link>
              <Link
                href="/products"
                className="group flex items-center gap-2 px-5 py-3 bg-white/5 hover:bg-white/10 border border-grey-800 hover:border-red-600/50 rounded-xl transition-all duration-300"
              >
                <svg className="w-4 h-4 text-grey-400 group-hover:text-red-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <span className="text-sm text-grey-300 group-hover:text-white transition-colors">Shop</span>
              </Link>
              <Link
                href="/contact"
                className="group flex items-center gap-2 px-5 py-3 bg-white/5 hover:bg-white/10 border border-grey-800 hover:border-grey-600/50 rounded-xl transition-all duration-300"
              >
                <svg className="w-4 h-4 text-grey-400 group-hover:text-grey-300 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span className="text-sm text-grey-300 group-hover:text-white transition-colors">Help</span>
              </Link>
            </div>

            {/* Auto-redirect with circular countdown */}
            <div className="flex items-center justify-center gap-3 anim-in anim-delay-4">
              <div className="relative w-8 h-8">
                <svg className="w-8 h-8 -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="16" fill="none" stroke="#1a1a1a" strokeWidth="2" />
                  <circle
                    cx="18"
                    cy="18"
                    r="16"
                    fill="none"
                    stroke="#d97706"
                    strokeWidth="2"
                    strokeDasharray="100.5"
                    strokeDashoffset={100.5 * (1 - countdown / 15)}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-linear"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-gold-500">
                  {countdown}
                </span>
              </div>
              <span className="text-xs text-grey-600">
                Heading home in {countdown}s
              </span>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}
