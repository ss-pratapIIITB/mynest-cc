import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import SiteAnalytics from "@/components/site-analytics";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Surendra Pratap Singh",
  description: "Software engineer. Building things that matter.",
  metadataBase: new URL("https://mynest.cc"),
  openGraph: {
    title: "Surendra Pratap Singh",
    description: "Software engineer. Building things that matter.",
    url: "https://mynest.cc",
    siteName: "mynest.cc",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Surendra Pratap Singh",
    description: "Software engineer. Building things that matter.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased noise`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          {children}
        </ThemeProvider>
        <SiteAnalytics />
      </body>
    </html>
  );
}
