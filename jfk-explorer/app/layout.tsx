import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from "next/script";

import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import { DataProvider } from "./lib/context/data-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "JFK Files Explorer",
  description: "Explore declassified JFK assassination documents",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <Script 
          src="https://aframe.io/releases/1.4.0/aframe.min.js" 
          strategy="afterInteractive"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <DataProvider>
          <Header />
          <main className="flex-1 p-6">{children}</main>
          <Footer />
        </DataProvider>
      </body>
    </html>
  );
}
