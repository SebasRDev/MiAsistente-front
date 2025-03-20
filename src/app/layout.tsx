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
  title: "Mi Asistente SkinHealth",
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

export default async function RootLayout({ children }: { children: ReactNode }) {
  const cookieStore = cookies();
  const sessionCookie = (await cookieStore).get('user-session');
  const session = sessionCookie?.value || null;
  return (
    <html lang="en">
      <body
        aria-label="Mi asistente SkinHealth"
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-dvh formula`}
      >
        <Providers>
          <Toaster richColors position="top-right" />
          <Header session={session} />
          <main className="text-foreground relative z-[1]">
            {children}
          </main>
          <NavigationFooter />
        </Providers>
      </body>
    </html>
  );
}
