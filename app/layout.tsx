import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { getLocale } from "next-intl/server";
import "./globals.css";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import { PosthogProvider } from "@/components/analytics/posthog-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = "https://izayid.dev"

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Izayid Ali — Développeur Full-Stack",
    template: "%s",
  },
  description: "Portfolio d'Izayid Ali (Iza), développeur full-stack — Next.js, Angular, Spring Boot, NestJS, Laravel.",
  keywords: ["Izayid Ali", "Izayid", "Iza", "développeur full-stack", "Next.js", "Angular", "Spring Boot"],
  authors: [{ name: "Izayid Ali", url: siteUrl }],
  creator: "Izayid Ali",
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon.png", type: "image/png", sizes: "192x192" },
      { url: "/favicon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: "/favicon.png",
  },
  openGraph: {
    type: "website",
    siteName: "Izayid Ali — Portfolio",
    images: [{ url: "/logo.png" }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background text-foreground`}
      >
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var theme = localStorage.getItem('theme');
                var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (theme === 'dark' || (!theme && prefersDark))
                  document.documentElement.classList.add('dark');
                else
                  document.documentElement.classList.remove('dark');
              })();
            `,
          }}
        />
        <GoogleAnalytics />
        <PosthogProvider />
        {children}
      </body>
    </html>
  );
}
