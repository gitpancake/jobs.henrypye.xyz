import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
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
  title: {
    default: "jobs. — Job Application Tracker",
    template: "%s | jobs.",
  },
  description:
    "Track applications. Land interviews. Get hired. A modern job search tracker with AI-powered analysis.",
  metadataBase: new URL("https://jobs.henrypye.xyz"),
  openGraph: {
    title: "jobs. — Job Application Tracker",
    description:
      "Track applications. Land interviews. Get hired. A modern job search tracker with AI-powered analysis.",
    siteName: "jobs.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "jobs. — Job Application Tracker",
    description:
      "Track applications. Land interviews. Get hired. A modern job search tracker with AI-powered analysis.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="dark">
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
