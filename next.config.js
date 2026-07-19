const { withSentryConfig } = require('@sentry/nextjs');

const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: /^\/(?:api|_next|static)\/.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'offlineCache',
        expiration: {
          maxEntries: 200,
        },
      },
    },
  ],
});

function resolveApiBaseUrl(raw) {
  const cleaned = String(raw || '')
    .replace(/^\uFEFF/, '')
    .replace(/[\r\n\t]/g, '')
    .trim()
    .replace(/^["']|["']$/g, '');

  const fallback = 'https://touchmunyunapi.onrender.com';
  const candidate = cleaned || fallback;
  const withoutTrailingSlash = candidate.replace(/\/+$/, '');
  const base = withoutTrailingSlash.replace(/\/api$/i, '');

  if (!/^https?:\/\//i.test(base)) {
    return fallback;
  }

  return base;
}

const apiBaseUrl = resolveApiBaseUrl(process.env.NEXT_PUBLIC_API_URL);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
  env: {
    // Fallbacks so production builds still work if Vercel env was set after deploy / wrong env scope.
    NEXT_PUBLIC_API_URL: apiBaseUrl,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
      'pk_test_51T4oO79SK4vSfGtGCnbWVLauXUz8hNDWcA3unRrV4Rax748AI98ph2t8NhzuTscTRJj8avlJ1fjMtrzMGIqdME5I001wxYHvI6',
    NEXT_PUBLIC_APP_VERSION: process.env.npm_package_version || '1.0.0',
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'https://touchmunyun.com',
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${apiBaseUrl}/api/:path*`,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com https://*.sentry.io https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: blob: https://res.cloudinary.com https://images.unsplash.com https://*.stripe.com https://www.gstatic.com/recaptcha/",
              "font-src 'self' https://fonts.gstatic.com",
              "connect-src 'self' https://api.stripe.com https://*.sentry.io https://*.ingest.sentry.io https://www.google.com/recaptcha/ " + apiBaseUrl,
              "frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://www.google.com/recaptcha/ https://recaptcha.google.com/",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; ')
          },
        ],
      },
    ];
  },
};

const sentryWebpackPluginOptions = {
  silent: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  widenClientFileUpload: true,
  hideSourceMaps: true,
  disableServerWebpackPlugin: false,
  disableClientWebpackPlugin: false,
};

module.exports = withSentryConfig(
  withPWA(nextConfig),
  sentryWebpackPluginOptions
);

