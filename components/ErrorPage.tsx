import Link from 'next/link';
import { Layout } from '@/components/Layout';
import { SEO } from '@/components/SEO';

export type ErrorPageVariant = 'notFound' | 'server' | 'client' | 'generic';

interface ErrorPageProps {
  statusCode?: number;
  title?: string;
  message?: string;
  /** Optional detail shown in a subtle box (e.g. API error text). */
  detail?: string;
  variant?: ErrorPageVariant;
  showRetry?: boolean;
  onRetry?: () => void;
  retryLabel?: string;
  retrying?: boolean;
}

const DEFAULT_COPY: Record<
  ErrorPageVariant,
  { title: string; message: string; seoTitle: string; seoDescription: string }
> = {
  notFound: {
    title: 'Page not found',
    message: "This page doesn't exist or may have been moved.",
    seoTitle: 'Page Not Found - Touch Munyun',
    seoDescription: "The page you're looking for doesn't exist or has been moved.",
  },
  server: {
    title: 'Something went wrong',
    message: 'Our servers hit a snag. Please try again in a moment.',
    seoTitle: 'Server Error - Touch Munyun',
    seoDescription: 'An internal server error occurred. Please try again later.',
  },
  client: {
    title: 'Something went wrong',
    message: 'This page ran into an unexpected error.',
    seoTitle: 'Error - Touch Munyun',
    seoDescription: 'An unexpected error occurred.',
  },
  generic: {
    title: 'Something went wrong',
    message: 'Please try again or return to the shop.',
    seoTitle: 'Error - Touch Munyun',
    seoDescription: 'An error occurred.',
  },
};

export function ErrorPage({
  statusCode,
  title,
  message,
  detail,
  variant = 'generic',
  showRetry = true,
  onRetry,
  retryLabel = 'Try again',
  retrying = false,
}: ErrorPageProps) {
  const copy = DEFAULT_COPY[variant];
  const displayTitle = title ?? copy.title;
  const displayMessage = message ?? copy.message;
  const code = statusCode ?? (variant === 'notFound' ? 404 : variant === 'server' ? 500 : undefined);

  const handleRetry =
    onRetry ??
    (() => {
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    });

  return (
    <>
      <SEO title={copy.seoTitle} description={copy.seoDescription} noindex nofollow />
      <Layout>
        <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 relative overflow-hidden bg-primary">
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse at center, rgba(220, 38, 38, 0.12) 0%, transparent 70%)',
            }}
          />

          <div className="relative z-10 max-w-lg w-full text-center">
            <div className="bg-gray-900/70 backdrop-blur-xl rounded-3xl shadow-glass-lg p-10 sm:p-12 border border-foreground/20">
              {code !== undefined && (
                <p className="text-6xl sm:text-7xl font-black text-button mb-4 tracking-tight">
                  {code}
                </p>
              )}

              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
                {displayTitle}
              </h1>
              <p className="text-foreground/70 mb-6 leading-relaxed">{displayMessage}</p>

              {detail && (
                <div className="mb-8 rounded-xl border border-foreground/15 bg-primary/60 px-4 py-3 text-left">
                  <p className="text-xs uppercase tracking-wide text-foreground/50 mb-1">Details</p>
                  <p className="text-sm text-foreground/80 break-words">{detail}</p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
                {showRetry && (
                  <button
                    type="button"
                    onClick={handleRetry}
                    disabled={retrying}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-button text-button-text font-semibold rounded-xl hover:bg-button-700 transition-all disabled:opacity-60 disabled:cursor-wait"
                  >
                    {retrying ? (
                      <>
                        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                          />
                        </svg>
                        Retrying...
                      </>
                    ) : (
                      retryLabel
                    )}
                  </button>
                )}
                <Link
                  href="/"
                  className="inline-flex items-center justify-center px-6 py-3 border border-foreground/20 text-foreground rounded-xl hover:bg-primary/80 transition-colors font-medium"
                >
                  Go home
                </Link>
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center px-6 py-3 border border-foreground/20 text-foreground rounded-xl hover:bg-primary/80 transition-colors font-medium"
                >
                  Shop
                </Link>
              </div>

              <Link
                href="/contact"
                className="text-sm text-foreground/60 hover:text-button transition-colors"
              >
                Need help? Contact support
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}
