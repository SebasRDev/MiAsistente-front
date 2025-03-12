/* eslint-disable react/no-children-prop */

import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { cookies } from "next/headers";
import { ReactNode } from "react";
import { Toaster } from "sonner";

import { Providers } from "@/app/providers";
import Header from "@/components/common/header/Header";
import NavigationFooter from "@/components/common/navigationFooter/NavigationFooter";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SKH APP",
  description: "Cotizador| Formulador Skinhealth Colombia",
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  // Also supported but less commonly used
  // interactiveWidget: 'resizes-visual',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  const session = cookies().then((cookies) => cookies.get('user-session') || null);
  return (
    <html lang="en">
      <body
        aria-label="Mi asistente SkinHealth"
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-dvh formula`}
      >
        <Providers children={undefined}>
          <Toaster richColors position="top-right" />
          <Header />
          <main className="text-foreground relative z-[1]">
            {children}
          </main>
          <NavigationFooter />
        </Providers>
      </body>
    </html>
  );
}
