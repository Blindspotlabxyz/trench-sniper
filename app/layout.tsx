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
  title: "TRENCH SNIPER | Gamified Crypto Slang",
  description: "Crypto doesn’t teach you gently. In the trenches, you don't read definitions—you earn them. Capture the Green Alpha, avoid the Red Rug, and survive the consequences.",
  keywords: ["Trench Sniper", "CT Slang", "Guardian", "Tech Entrepreneur", "Onboarding", "Alpha", "Rugged"],
  openGraph: {
    title: "TRENCH SNIPER: Education Disguised as Competition",
    description: "I saw the idea on X. I didn't wait to capture the Aura. Play Trench Sniper: Green for Alpha, Red for the Rug.",
    url: "https://trench.mojeeb.xyz",
    siteName: "Trench Sniper",
    images: [
      {
        url: "/og-image.jpg", 
        width: 1200,
        height: 630,
        alt: "Trench Sniper Gameplay Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TRENCH SNIPER: Don't just learn the slang. Earn it.",
    description: "The high-stakes CT slang game for the modern Guardian. No hand-holding. Just consequences.",
    images: ["/og-image.jpg"],
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
        suppressHydrationWarning
      >
       
        {children}
      </body>
    </html>
  );
}
