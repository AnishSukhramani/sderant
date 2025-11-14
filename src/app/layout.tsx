import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CustomCursor } from "@/components/CustomCursor";
import { SmoothScroll } from "@/components/SmoothScroll";
import { AuthProvider } from "@/contexts/AuthContext";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

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
        url: '/favicon.svg',
        width: 256,
        height: 256,
        alt: 'sudonet anish sukhramani',
        type: 'image/svg+xml',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SUDONET — Cyberpunk Developer Terminal',
    description:
      'SUDONET is an anonymous cyberpunk bulletin board for developers. Share rants, lore, and insights with real-time posts, archetypes, and a neon terminal interface.',
    images: [
      {
        url: '/favicon.svg',
        alt: 'SUDONET neon terminal emblem',
      },
    ],
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' }
    ],
    shortcut: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
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
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
