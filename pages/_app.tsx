import type { AppProps } from 'next/app';
import Head from 'next/head';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { InstallPWA } from '@/components/InstallPWA';
import { UpdateAvailable } from '@/components/UpdateAvailable';
import { SEO } from '@/components/SEO';
import { StructuredData } from '@/components/StructuredData';
import { Toaster } from 'react-hot-toast';
import '@/styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <SEO />
      <StructuredData type="Organization" />
      <StructuredData type="WebSite" />
      <Head>
        <meta name="application-name" content="TouchMunyun" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="TouchMunyun" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#5A5D68" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="theme-color" content="#5A5D68" />

        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/icon-192x192.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="shortcut icon" href="/favicon.ico" />
      </Head>
      <AuthProvider>
        <CartProvider>
          <ErrorBoundary>
            <Component {...pageProps} />
          </ErrorBoundary>
          <Toaster 
            position="top-right"
            toastOptions={{
              style: {
                background: 'rgba(90, 93, 104, 0.95)',
                backdropFilter: 'blur(12px)',
                color: '#E9EFF1',
                border: '1px solid rgba(233, 239, 241, 0.2)',
                borderRadius: '12px',
                padding: '16px',
                boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
              },
              success: {
                iconTheme: {
                  primary: '#f59e0b',
                  secondary: '#E9EFF1',
                },
                style: {
                  background: 'rgba(90, 93, 104, 0.95)',
                  backdropFilter: 'blur(12px)',
                  color: '#E9EFF1',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#E9EFF1',
                },
                style: {
                  background: 'rgba(90, 93, 104, 0.95)',
                  backdropFilter: 'blur(12px)',
                  color: '#E9EFF1',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                },
              },
              loading: {
                iconTheme: {
                  primary: '#D2D3DA',
                  secondary: '#5A5D68',
                },
              },
            }}
          />
          <InstallPWA />
          <UpdateAvailable />
        </CartProvider>
      </AuthProvider>
    </>
  );
}

