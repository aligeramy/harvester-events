import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "ARC Raiders Harvester Event Timers",
  description: "Track Harvester event times for ARC Raiders. View current and upcoming Harvester events across all maps with real-time countdown.",
  keywords: ["ARC Raiders", "Harvester", "event timers", "game events", "ARC Raiders events"],
  openGraph: {
    title: "ARC Raiders Harvester Event Timers",
    description: "Track Harvester event times for ARC Raiders. View current and upcoming Harvester events across all maps.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "ARC Raiders Harvester Event Timers",
    description: "Track Harvester event times for ARC Raiders.",
  },
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
        {children}
      </body>
    </html>
  );
}
