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
  metadataBase: new URL("https://life-as-sde.vercel.app"),
  title: {
    default: "sudonet",
    template: "%s | SUDONET",
  },
  applicationName: "SUDONET",
  description:
    "SUDONET is an anonymous cyberpunk bulletin board for developers. Share rants, lore, and insights with real-time posts, archetypes, and a neon terminal interface.",
  keywords: [
    "SUDONET",
    "developer community",
    "anonymous posting",
    "cyberpunk UI",
    "tech bulletin board",
    "real-time app",
    "supabase",
  ],
  authors: [{ name: "SUDONET" }],
  creator: "SUDONET",
  publisher: "SUDONET",
  category: "technology",
  alternates: {
    canonical: "https://life-as-sde.vercel.app",
  },
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
    title: 'SUDONET — Cyberpunk Developer Terminal',
    description:
      'SUDONET is an anonymous cyberpunk bulletin board for developers. Share rants, lore, and insights with real-time posts, archetypes, and a neon terminal interface.',
    siteName: 'SUDONET',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'SUDONET — Cyberpunk Developer Terminal',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SUDONET — Cyberpunk Developer Terminal',
    description:
      'SUDONET is an anonymous cyberpunk bulletin board for developers. Share rants, lore, and insights with real-time posts, archetypes, and a neon terminal interface.',
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
