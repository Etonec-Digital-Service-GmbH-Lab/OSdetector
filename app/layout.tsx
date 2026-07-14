import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'OS Detector',
  description: 'Detect the operating system, browser configuration, and network origin of a visiting device.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen text-white antialiased">{children}</body>
    </html>
  );
}
