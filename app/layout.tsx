import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/Header';
import { FontTester } from '@/components/FontTester';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.yella.dev'),
  title: { default: 'Naren Yellavula', template: '%s | yella.dev' },
  description: 'Personal site of Naren Yellavula — Staff Cloud Security Engineer, writer, and builder.',
  openGraph: { images: ['https://d3bphourhbt2ew.cloudfront.net/images/nyell-crop.jpg'] },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en" data-scroll-behavior="smooth"><head><link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" /><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&display=swap" /></head><body><Header />{children}<footer className="footer">© {new Date().getFullYear()} Naren Yellavula</footer><FontTester /></body></html>;
}
