/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/immutability */
/* eslint-disable react-hooks/purity */
/* eslint-disable @typescript-eslint/no-unused-vars */
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "RD CampusDex — Smart Campus ERP Platform",
    template: "%s | RD CampusDex",
  },
  description:
    "RD CampusDex is a modern, enterprise-grade Smart Campus ERP Platform for students and academic authorities. Manage attendance, assignments, timetables, notices, and more from a single platform.",
  keywords: ["campus", "ERP", "education", "attendance", "student management", "academic"],
  authors: [{ name: "RD CampusDex Team" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_APP_URL,
    title: "RD CampusDex — Smart Campus ERP Platform",
    description: "Modern Smart Campus ERP Platform for universities and educational institutions.",
    siteName: "RD CampusDex",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
