// src/app/layout.tsx
export const dynamic = 'force-dynamic';

import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/auth-context";
import { Toaster } from "react-hot-toast";
import '@/styles/flatpickr-theme.css';
import Providers from "@/components/Providers";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ThemeProvider } from "@/components/ThemeProvider";

// ── Premium Font Configuration ──────────────────────────────

// 1. Sans-Serif (Primary UI / paragraphs) - Inter for clean readability
const sansFont = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  preload: true,
  fallback: ["system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "sans-serif"],
});

// 2. Display (Titles, headers — brand identity) - Space Grotesk for premium feel
const displayFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["400", "500", "600", "700"],
  preload: true,
  fallback: ["Inter", "system-ui", "sans-serif"],
});

// 3. Monospace (Numbers, IDs, plates, amounts) - JetBrains Mono for tech premium
const monoFont = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "500", "600", "700"],
  preload: true,
  fallback: ["SF Mono", "Menlo", "Monaco", "Consolas", "monospace"],
});

// ── Metadata - Premium SEO ────────────────────────────────────
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://rentalgarage.co.ke'),
  title: {
    template: '%s | Rental Garage',
    default: 'Rental Garage - Enterprise Fleet Management',
  },
  description: "Enterprise-grade vehicle rental and fleet management platform. Streamline operations, boost revenue, and deliver exceptional service.",
  keywords: [
    'fleet management',
    'vehicle rental',
    'car rental software',
    'fleet tracking',
    'rental management',
    'enterprise fleet',
    'vehicle booking',
    'rental garage'
  ],
  authors: [
    { name: 'Rental Garage', url: 'https://rentalgarage.co.ke' }
  ],
  creator: 'Rental Garage',
  publisher: 'Rental Garage',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://rentalgarage.co.ke',
    siteName: 'Rental Garage',
    title: 'Rental Garage - Enterprise Fleet Management',
    description: 'Enterprise-grade vehicle rental and fleet management platform. Streamline operations, boost revenue, and deliver exceptional service.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Rental Garage - Enterprise Fleet Management',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rental Garage - Enterprise Fleet Management',
    description: 'Enterprise-grade vehicle rental and fleet management platform.',
    images: ['/og-image.jpg'],
    creator: '@rentalgarage',
    site: '@rentalgarage',
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'mask-icon',
        url: '/safari-pinned-tab.svg',
        color: '#4338CA',
      },
    ],
  },
  manifest: '/site.webmanifest',
  alternates: {
    canonical: 'https://rentalgarage.co.ke',
  },
  category: 'technology',
};

// ── Viewport Configuration ────────────────────────────────────
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#4338CA',
  colorScheme: 'light dark',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html 
      lang="en" 
      suppressHydrationWarning
      className={`${sansFont.variable} ${displayFont.variable} ${monoFont.variable}`}
    >
      <head>
        {/* Preconnect to Google Fonts for faster loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* DNS Prefetch for external resources */}
        <link rel="dns-prefetch" href="https://api.rentalgarage.co.ke" />
        <link rel="dns-prefetch" href="https://images.rentalgarage.co.ke" />
      </head>
      <body className={`
        font-sans 
        antialiased 
        bg-[var(--color-bg)] 
        text-[var(--color-ink-primary)] 
        selection:bg-[var(--color-primary-muted)] 
        selection:text-[var(--color-primary-text)]
        scroll-smooth
        min-h-screen
        transition-colors
        duration-300
      `}>
        {/* Skip to main content - Accessibility */}
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-surface focus:text-ink focus:rounded-lg focus:shadow-lg focus:border focus:border-primary"
        >
          Skip to main content
        </a>

        {/* Theme Provider for dark/light mode */}
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {/* Vercel Analytics — page views, visitors, devices, referrers */}
          <Analytics />
          
          {/* Speed Insights — real-user performance metrics */}
          <SpeedInsights />

          {/* Main Providers */}
          <Providers>
            <AuthProvider>
              {/* Toast Notifications - Premium Styling */}
              <Toaster 
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: 'var(--color-surface)',
                    color: 'var(--color-ink-primary)',
                    border: '1px solid var(--color-surface-border)',
                    boxShadow: 'var(--shadow-dropdown)',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '14px',
                    maxWidth: '380px',
                  },
                  success: {
                    style: {
                      borderColor: 'var(--color-success-border)',
                    },
                    iconTheme: {
                      primary: 'var(--color-success)',
                      secondary: 'var(--color-surface)',
                    },
                  },
                  error: {
                    style: {
                      borderColor: 'var(--color-danger-border)',
                    },
                    iconTheme: {
                      primary: 'var(--color-danger)',
                      secondary: 'var(--color-surface)',
                    },
                  },
                  loading: {
                    style: {
                      borderColor: 'var(--color-primary-border)',
                    },
                  },
                }}
              />
              
              {/* Main Content - No wrapper <main> here to allow layouts to control their own structure */}
              {children}
            </AuthProvider>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
