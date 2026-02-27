import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Providers } from '@/components/features/Providers';
import '@/app/globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });

export const metadata: Metadata = {
  title: {
    default: 'Xamle Civic — Transparence des politiques publiques sénégalaises',
    template: '%s | Xamle Civic',
  },
  description:
    'Plateforme citoyenne de suivi et d\'évaluation des politiques publiques du Sénégal.',
  keywords: ['politiques publiques', 'Sénégal', 'transparence', 'civic tech', 'gouvernance'],
  authors: [{ name: 'Xamle Civic', url: 'https://xamle.sn' }],
  creator: 'Xamle Civic',
  openGraph: {
    type: 'website',
    locale: 'fr_SN',
    url: 'https://xamle.sn',
    siteName: 'Xamle Civic',
    title: 'Xamle Civic — Transparence et participation citoyenne',
    description: 'Plateforme de suivi des politiques publiques sénégalaises.',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Xamle Civic',
    description: 'Plateforme de suivi des politiques publiques sénégalaises.',
    images: ['/og-image.png'],
  },
  robots: { index: true, follow: true },
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#C0392B',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const messages = await getMessages();

  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <a href="#main-content" className="skip-link">
          Aller au contenu principal
        </a>
        <NextIntlClientProvider messages={messages}>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
