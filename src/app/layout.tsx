import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from '@/components/providers'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  metadataBase: new URL('https://8ballafrica.com'),
  title: {
    default: '8-Ball Africa | Premium Pool & Billiards Equipment',
    template: '%s | 8-Ball Africa',
  },
  description:
    'Premium pool tables, cues, cloth, and accessories for players across Africa. Shop professional-grade billiards equipment from top brands.',
  keywords: ['pool', 'billiards', '8-ball', 'cues', 'pool tables', 'Africa'],
  applicationName: '8-Ball Africa',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: '8-Ball Africa | Premium Pool & Billiards Equipment',
    description:
      'Shop professional-grade pool tables, cues, chalk, gloves, and accessories from trusted billiards brands.',
    type: 'website',
    url: 'https://8ballafrica.com',
    siteName: '8-Ball Africa',
  },
  twitter: {
    card: 'summary_large_image',
    title: '8-Ball Africa | Premium Pool & Billiards Equipment',
    description:
      'Shop professional-grade pool tables, cues, chalk, gloves, and accessories from trusted billiards brands.',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans bg-background text-text antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
