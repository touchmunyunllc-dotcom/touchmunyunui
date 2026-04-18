import { Html, Head, Main, NextScript } from 'next/document';

const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://touchmunyunapi.onrender.com';
const apiOrigin = rawApiUrl.replace(/\/+$/, '').replace(/\/api$/, '');

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://res.cloudinary.com" />
        
        {/* DNS Prefetch */}
        <link rel="dns-prefetch" href="https://api.stripe.com" />
        <link rel="dns-prefetch" href={apiOrigin} />
        
        {/* Favicon */}
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/icon-192x192.png" />
        
        {/* Manifest */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* Theme Color */}
        <meta name="theme-color" content="#5A5D68" />
        <meta name="msapplication-TileColor" content="#5A5D68" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

