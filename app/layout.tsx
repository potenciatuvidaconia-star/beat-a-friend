import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Beat-a-Friend | Mundial 2026',
  description: 'Humilla a tus amigos prediciendo el Mundial 2026',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="h-full">
      <body className={`${inter.className} min-h-full bg-[#FAFAFA] text-[#1A1A2E] antialiased`}>
        {children}
      </body>
    </html>
  )
}
