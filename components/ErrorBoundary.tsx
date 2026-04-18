import React, { Component, ErrorInfo, ReactNode } from 'react';
import Link from 'next/link';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  showDetails: boolean;
  glitchActive: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  private glitchInterval: ReturnType<typeof setInterval> | null = null;

  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, showDetails: false, glitchActive: false };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  componentDidUpdate(_: Props, prevState: State) {
    if (this.state.hasError && !prevState.hasError) {
      this.startGlitch();
    }
  }

  componentWillUnmount() {
    if (this.glitchInterval) clearInterval(this.glitchInterval);
  }

  startGlitch = () => {
    // Periodic glitch effect
    this.glitchInterval = setInterval(() => {
      this.setState({ glitchActive: true });
      setTimeout(() => this.setState({ glitchActive: false }), 200);
    }, 3000);
  };

  handleReset = () => {
    if (this.glitchInterval) clearInterval(this.glitchInterval);
    this.setState({ hasError: false, error: null, showDetails: false, glitchActive: false });
  };

  handleGoBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = '/';
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center px-4 overflow-hidden relative">
          {/* Animated background particles */}
          <style jsx>{`
            @keyframes float {
              0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.3; }
              50% { transform: translateY(-30px) rotate(180deg); opacity: 0.8; }
            }
            @keyframes pulse-ring {
              0% { transform: scale(0.8); opacity: 0.5; }
              50% { transform: scale(1.2); opacity: 0; }
              100% { transform: scale(0.8); opacity: 0.5; }
            }
            @keyframes glitch-1 {
              0%, 100% { clip-path: inset(0 0 90% 0); transform: translate(-2px, 2px); }
              25% { clip-path: inset(30% 0 50% 0); transform: translate(2px, -1px); }
              50% { clip-path: inset(60% 0 10% 0); transform: translate(-1px, 1px); }
              75% { clip-path: inset(10% 0 70% 0); transform: translate(1px, -2px); }
            }
            @keyframes shake {
              0%, 100% { transform: translateX(0); }
              10% { transform: translateX(-5px) rotate(-1deg); }
              20% { transform: translateX(5px) rotate(1deg); }
              30% { transform: translateX(-3px); }
              40% { transform: translateX(3px); }
              50% { transform: translateX(0); }
            }
            @keyframes fadeInUp {
              from { opacity: 0; transform: translateY(30px); }
              to { opacity: 1; transform: translateY(0); }
            }
            @keyframes scanline {
              0% { top: -10%; }
              100% { top: 110%; }
            }
            .particle {
              position: absolute;
              width: 4px;
              height: 4px;
              background: #DC2626;
              border-radius: 50%;
              animation: float 4s ease-in-out infinite;
            }
            .glitch-text {
              position: relative;
            }
            .glitch-active .glitch-text::before,
            .glitch-active .glitch-text::after {
              content: 'OOPS!';
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
            }
            .glitch-active .glitch-text::before {
              color: #DC2626;
              animation: glitch-1 0.2s linear;
              z-index: -1;
            }
            .glitch-active .glitch-text::after {
              color: #3b82f6;
              animation: glitch-1 0.2s linear reverse;
              z-index: -1;
            }
            .fade-in-up {
              animation: fadeInUp 0.6s ease-out forwards;
            }
            .fade-in-up-delay-1 { animation-delay: 0.2s; opacity: 0; }
            .fade-in-up-delay-2 { animation-delay: 0.4s; opacity: 0; }
            .fade-in-up-delay-3 { animation-delay: 0.6s; opacity: 0; }
            .scanline::after {
              content: '';
              position: absolute;
              top: -10%;
              left: 0;
              width: 100%;
              height: 5%;
              background: linear-gradient(transparent, rgba(220, 38, 38, 0.08), transparent);
              animation: scanline 4s linear infinite;
              pointer-events: none;
            }
          `}</style>

          {/* Floating particles */}
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="particle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 4}s`,
                animationDuration: `${3 + Math.random() * 3}s`,
                background: i % 3 === 0 ? '#DC2626' : i % 3 === 1 ? '#d97706' : '#6b7280',
                width: `${2 + Math.random() * 4}px`,
                height: `${2 + Math.random() * 4}px`,
              }}
            />
          ))}

          {/* Scanline overlay */}
          <div className="absolute inset-0 scanline pointer-events-none" />

          <div className={`relative z-10 text-center max-w-lg ${this.state.glitchActive ? 'glitch-active' : ''}`}>
            {/* Animated warning icon with pulse rings */}
            <div className="relative inline-block mb-8 fade-in-up">
              <div className="absolute inset-0 rounded-full bg-red-600/20" style={{ animation: 'pulse-ring 2s ease-in-out infinite' }} />
              <div className="absolute inset-[-8px] rounded-full bg-red-600/10" style={{ animation: 'pulse-ring 2s ease-in-out infinite 0.5s' }} />
              <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                <svg className="w-16 h-16 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
            </div>

            {/* Glitch title */}
            <h1
              className="glitch-text text-5xl sm:text-6xl font-black text-white mb-3 tracking-tight fade-in-up"
              style={{ animation: this.state.glitchActive ? 'shake 0.3s ease-in-out' : undefined }}
            >
              OOPS!
            </h1>

            <p className="text-lg text-grey-400 mb-2 fade-in-up fade-in-up-delay-1">
              Something broke unexpectedly
            </p>
            <p className="text-sm text-grey-500 mb-8 fade-in-up fade-in-up-delay-1">
              Don&apos;t worry — it&apos;s not your fault. Let&apos;s get you back to shopping.
            </p>

            {/* Dev error details (collapsible) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-8 fade-in-up fade-in-up-delay-2">
                <button
                  onClick={() => this.setState({ showDetails: !this.state.showDetails })}
                  className="text-xs text-grey-500 hover:text-red-400 transition-colors flex items-center gap-1 mx-auto"
                >
                  <svg className={`w-3 h-3 transition-transform ${this.state.showDetails ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  {this.state.showDetails ? 'Hide' : 'Show'} Error Details
                </button>
                {this.state.showDetails && (
                  <pre className="mt-3 text-left text-xs text-red-400/80 bg-red-950/30 border border-red-900/30 rounded-xl p-4 overflow-auto max-h-32 backdrop-blur-sm">
                    {this.state.error.message}
                  </pre>
                )}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center fade-in-up fade-in-up-delay-2">
              <button
                onClick={this.handleReset}
                className="group relative px-8 py-3.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-glow-red overflow-hidden"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 transition-transform group-hover:-rotate-180 duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Try Again
                </span>
              </button>
              <button
                onClick={this.handleGoBack}
                className="px-8 py-3.5 border border-grey-700 text-grey-300 hover:text-white hover:border-grey-500 font-medium rounded-xl transition-all duration-300 hover:bg-white/5"
              >
                Go Back
              </button>
              <Link
                href="/"
                className="px-8 py-3.5 text-grey-400 hover:text-gold-500 font-medium rounded-xl transition-all duration-300"
              >
                Home
              </Link>
            </div>

            {/* Subtle footer */}
            <p className="mt-12 text-xs text-grey-600 fade-in-up fade-in-up-delay-3">
              If this keeps happening,{' '}
              <a href="mailto:TouchMunyunLLC@gmail.com" className="text-gold-600 hover:text-gold-500 transition-colors underline underline-offset-2">
                let us know
              </a>
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
