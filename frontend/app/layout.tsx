/**
 * layout.tsx - Root Layout
 *
 * The root layout for the Bayesian Spaced Repetition app.
 * Wraps all pages with:
 *   - Global fonts (Geist Sans and Mono)
 *   - Global CSS styles
 *   - Navbar navigation component
 *
 * Children: All page components
 *
 * CSS: Sets up font variables and antialiased text rendering.
 */

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bayesian Spaced Repetition",
  description: "A flashcard app using Bayesian inference for optimal learning",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Navbar />
        {children}
      </body>
    </html>
  );
}
