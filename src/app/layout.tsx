import './globals.css'
import type { Metadata } from 'next'
import { Inter, Cinzel } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })
const cinzel = Cinzel({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'GM Forge',
  description: 'AI-powered RPG Game Master',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${cinzel.className}`}>{children}</body>
    </html>
  )
}