import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'sonner'

export const metadata: Metadata = {
  title: 'SolarPro — Solar Business Management',
  description: 'Professional solar quotation and business management system',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "'DM Sans', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" }}>
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  )
}