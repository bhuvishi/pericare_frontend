import React from "react"
import type { Metadata, Viewport } from 'next'
import { DM_Serif_Display, Nunito } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const dmSerifDisplay = DM_Serif_Display({ 
  weight: '400',
  subsets: ["latin"],
  variable: '--font-serif'
});

const nunito = Nunito({ 
  subsets: ["latin"],
  variable: '--font-sans'
});

export const metadata: Metadata = {
  title: 'Bloom - Your Perimenopause Wellness Companion',
  description: 'A nurturing wellness app designed to help women understand themselves through gentle tracking, pattern recognition, and emotional support during perimenopause.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${nunito.variable} ${dmSerifDisplay.variable} font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
