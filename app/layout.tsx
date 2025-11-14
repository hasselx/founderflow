import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from "@vercel/analytics/next"
import Link from "next/link"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "FounderFlow - AI Startup Validation Platform",
  description:
    "Transform your startup idea into a validated, data-backed plan with AI-powered insights and community support",
  generator: "v0.app",
  icons: {
    icon: "/favicon.jpg",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" style={{ scrollBehavior: "smooth" }}>
      <head>
        <link rel="icon" href="/favicon.jpg" type="image/png" />
        <meta name="theme-color" content="#1e3a8a" />
        <script src="https://cdn.jsdelivr.net/npm/@studio-freight/lenis@1.0.42/dist/lenis.min.js" />
      </head>
      <body className={`font-sans antialiased`}>
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-base">FF</span>
          </div>
          <span className="text-xl font-bold text-foreground hidden sm:inline">FounderFlow</span>
        </Link>
        {children}
        <Analytics />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              const lenis = new Lenis({
                duration: 1.2,
                easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
                direction: 'vertical',
                gestureDirection: 'vertical',
                smooth: true,
                mouseMultiplier: 1,
                smoothTouch: false,
                touchMultiplier: 2,
                infinite: false,
              })

              function raf(time) {
                lenis.raf(time)
                requestAnimationFrame(raf)
              }

              requestAnimationFrame(raf)
            `,
          }}
        />
      </body>
    </html>
  )
}
