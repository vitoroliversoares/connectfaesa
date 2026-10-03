import type { Metadata } from 'next'
import { Toaster } from 'sonner'
import { Navbar } from '@/components/layout/Navbar'
import './globals.css'

export const metadata: Metadata = {
  title: 'Connect FAESA | Pessoas que fazem sua jornada acontecer',
  description: 'Encontre colegas por curso, matérias e interesses para estudar e criar juntos na FAESA.',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link rel="preconnect" href="https://cdn.fontshare.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href="https://api.fontshare.com/v2/css?f%5B%5D=satoshi%40400%2C500%2C700&display=swap" />
        <link rel="stylesheet" href="https://api.fontshare.com/v2/css?f%5B%5D=telma%40400&display=swap" />
        <script dangerouslySetInnerHTML={{ __html: `try{if(localStorage.theme==='dark'||(!localStorage.theme&&matchMedia('(prefers-color-scheme: dark)').matches))document.documentElement.classList.add('dark')}catch(e){}` }} />
      </head>
      <body>
        <Toaster position="top-center" richColors />
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  )
}
