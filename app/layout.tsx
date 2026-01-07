'use client';

import { Inter } from 'next/font/google'
import './globals.css'
import { TutorialProvider } from '@/lib/TutorialContext'
import { LanguageProvider } from '@/lib/LanguageContext'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <LanguageProvider>
                <TutorialProvider>
                    {children}
                </TutorialProvider>
                <LanguageProvider>
            </body>
        </html>
    )
}
