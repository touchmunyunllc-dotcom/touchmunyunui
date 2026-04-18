import React from 'react';
import Link from 'next/link';

export const Hero: React.FC = () => {
  return (
    <div className="relative overflow-hidden bg-primary">
      {/* Premium Background Pattern with Depth */}
      <div className="absolute inset-0">
        {/* Subtle radial gradients for depth */}
        <div className="absolute inset-0 bg-gradient-radial from-premium-black-deep/40 via-transparent to-transparent opacity-50" />
        {/* Subtle texture pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        {/* Subtle color accent overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-primary-900/5 to-transparent" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
        <div className="text-center">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold mb-6 animate-fade-in">
            <span className="block text-white">Handcrafted fashion for</span>
            <span className="block text-red-600">
              bold, modern sportswear.
            </span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-xl sm:text-2xl text-foreground/80 leading-relaxed">
            where artistry meets sophistication, offering unique handcrafted treasures that elevate your lifestyle.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/products"
              className="group inline-flex items-center justify-center px-10 py-5 text-lg font-bold text-white bg-red-600 rounded-xl hover:bg-red-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl border border-red-500/50 hover:shadow-glow-red"
            >
              Shop Now
              <svg
                className="ml-2 w-5 h-5 transform group-hover:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
            <Link
              href="/about"
              className="group inline-flex items-center justify-center px-10 py-5 text-lg font-semibold text-white bg-black/40 backdrop-blur-md rounded-xl border-2 border-white/30 hover:border-red-600/50 hover:bg-black/60 transform hover:scale-105 transition-all duration-200 shadow-glass"
            >
              Our Story
            </Link>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-primary to-transparent" />
    </div>
  );
};

