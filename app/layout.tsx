import { Inter } from 'next/font/google'
import './globals.css'
import { Metadata } from 'next'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'BRPolis - Sistema Político Avançado',
  description: 'Sistema completo de gestão política com IA vertical, WhatsApp em massa e analytics em tempo real para candidatos brasileiros.',
  keywords: 'política, candidatos, CRM, whatsapp, IA, brasil, eleições, campanha política',
  authors: [{ name: 'BRPolis Team' }],
  creator: 'BRPolis',
  publisher: 'BRPolis',
  robots: 'noindex, nofollow',
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#3B82F6',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className="h-full">
      <body className={`${inter.className} h-full bg-gray-50 dark:bg-gray-900`}>
        {children}
      </body>
    </html>
  )
}