import { Layout } from '@/components/Layout';
import Link from 'next/link';

export default function Offline() {
  return (
    <Layout>
      <div className="min-h-screen bg-primary flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 opacity-20" style={{
          background: 'radial-gradient(ellipse at center, rgba(220, 38, 38, 0.15) 0%, transparent 70%)'
        }} />
        <div className="max-w-md w-full text-center relative z-10">
          <div className="bg-gray-900/70 backdrop-blur-xl rounded-3xl shadow-glass-lg p-12 border-2 border-gray-800/50">
            {/* Offline Icon */}
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-primary-500/20 to-primary-600/10 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-primary-500/30 shadow-glass">
              <svg
                className="w-12 h-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>

            <h1 className="text-4xl font-bold text-primary-500 mb-4">
              You&apos;re Offline
            </h1>
            <p className="text-xl text-gray-400 mb-8">
              It looks like you&apos;ve lost your internet connection. Don&apos;t worry,
              you can still browse previously loaded content.
            </p>

            <div className="space-y-4">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-gradient-to-r from-primary-600/90 to-primary-700/90 backdrop-blur-md text-white font-semibold py-3 px-6 rounded-xl hover:from-primary-500 hover:to-primary-600 transform hover:scale-105 transition-all duration-200 shadow-glass-lg hover:shadow-glow-red-lg border border-primary-500/30"
              >
                Try Again
              </button>
              <Link
                href="/"
                className="block w-full text-center text-gray-400 hover:text-primary-500 font-medium py-3"
              >
                Go to Homepage
              </Link>
            </div>

            {/* Tips */}
            <div className="mt-8 pt-8 border-t border-gray-800">
              <p className="text-sm text-gray-400 mb-2">While offline, you can:</p>
              <ul className="text-sm text-gray-400 space-y-1 text-left">
                <li className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Browse cached products
                </li>
                <li className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  View your cart
                </li>
                <li className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Access saved pages
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

