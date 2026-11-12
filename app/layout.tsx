import type React from "react";
import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { AppWrapper } from "@/components/app-wrapper";
import "./globals.css";

export const metadata: Metadata = {
  title: "Made with App Studio",
  description:
    "Crypto Pi Token: tap the spinning Pi coin, mine passively, upgrade your rig, climb the leaderboard and take the daily crypto quiz.",
    generator: 'v0.app'
};

export const viewport: Viewport = {
  themeColor: "#1a1428",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark bg-background">
      <body className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased`}>
        <AppWrapper>{children}</AppWrapper>
      </body>
    </html>
  );
}
