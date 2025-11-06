import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CustomCursor } from "@/components/CustomCursor";
import { SmoothScroll } from "@/components/SmoothScroll";
import { AuthProvider } from "@/contexts/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Life as an SDE",
  description: "Anonymous tech discussions, memes, and developer life. Share your thoughts, experiences, and memes without accounts. Real-time updates, reactions, and community-driven content.",
  keywords: ["tech", "developer", "programming", "anonymous", "bulletin board", "discussions", "memes", "community"],
  authors: [{ name: "Life as an SDE" }],
  creator: "Life as an SDE",
  publisher: "Life as an SDE",
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
    url: 'https://life-as-sde.vercel.app',
    title: 'Life as an SDE - Tech Bulletin Board',
    description: 'Anonymous tech discussions, memes, and developer life. Share your thoughts, experiences, and memes without accounts.',
    siteName: 'Life as an SDE',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Life as an SDE - Tech Bulletin Board',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Life as an SDE - Tech Bulletin Board',
    description: 'Anonymous tech discussions, memes, and developer life. Share your thoughts, experiences, and memes without accounts.',
    images: ['/og-image.png'],
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' }
    ],
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#10b981" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="alternate icon" href="/favicon.ico" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        <AuthProvider>
          <CustomCursor />
          <SmoothScroll />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
