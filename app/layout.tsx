import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/lib/auth/context'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'TrustLog — Trust infrastructure for AI agents',
  description: 'Cryptographic identity, behavioral verification, and certification for AI agents.',
}

// The AuthProvider wraps everything so every page and component
// in the app has access to the current user without prop drilling.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}