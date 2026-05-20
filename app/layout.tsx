import type { Metadata } from 'next'
import { Inter, Fredoka, Bebas_Neue } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const fredoka = Fredoka({ subsets: ['latin'], variable: '--font-fredoka', weight: ['300','400','500','600','700'] })
const bebasNeue = Bebas_Neue({ subsets: ['latin'], variable: '--font-bebas', weight: '400' })

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
      <body className={`${inter.variable} ${fredoka.variable} ${bebasNeue.variable} min-h-full antialiased font-body`}>
        {children}
      </body>
    </html>
  )
}
