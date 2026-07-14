import { headers } from 'next/headers';
import { detectFromUserAgent } from '@/lib/server-detection';
import { OsDetectionCard } from '@/components/OsDetectionCard';
import { BrowserInfoCard } from '@/components/BrowserInfoCard';
import { NetworkInfoCard } from '@/components/NetworkInfoCard';

export default async function Home() {
  const userAgent = (await headers()).get('user-agent') ?? '';
  const serverDetection = detectFromUserAgent(userAgent);

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-8 px-4 py-10 sm:px-8">
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <span className="h-3 w-3 rounded-full bg-brand-red" />
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">OS Detector</h1>
        </div>
        <p className="max-w-2xl text-sm text-white/50">
          This page demonstrates how much a web server and browser script can learn about your device just
          from an ordinary page visit — no permissions requested, no cookies dropped.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6">
        <OsDetectionCard server={serverDetection} />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <BrowserInfoCard />
          <NetworkInfoCard />
        </div>
      </div>

      <footer className="flex flex-col gap-1 pb-6 text-center text-xs text-white/30">
        <span>Served over Next.js · detection runs both server-side and in your browser</span>
        <span>&copy; 2026 powered by etonec</span>
      </footer>
    </main>
  );
}
