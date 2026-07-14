'use client';

import { useEffect, useState } from 'react';
import { Card, InfoRow } from './Card';

interface BrowserConfig {
  language: string;
  languages: string;
  timezone: string;
  timezoneOffset: string;
  screenResolution: string;
  viewport: string;
  colorDepth: string;
  pixelRatio: string;
  platform: string;
  cores: string;
  deviceMemory: string;
  touchPoints: string;
  cookiesEnabled: string;
  doNotTrack: string;
  colorScheme: string;
  online: string;
}

function collectBrowserConfig(): BrowserConfig {
  const nav = navigator as Navigator & { deviceMemory?: number };
  const now = new Date();

  return {
    language: nav.language,
    languages: nav.languages?.join(', ') ?? nav.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    timezoneOffset: `UTC${now.getTimezoneOffset() <= 0 ? '+' : '-'}${Math.abs(now.getTimezoneOffset() / 60)}`,
    screenResolution: `${window.screen.width} × ${window.screen.height}`,
    viewport: `${window.innerWidth} × ${window.innerHeight}`,
    colorDepth: `${window.screen.colorDepth}-bit`,
    pixelRatio: `${window.devicePixelRatio}x`,
    platform: nav.platform || 'unknown',
    cores: nav.hardwareConcurrency ? String(nav.hardwareConcurrency) : 'unknown',
    deviceMemory: nav.deviceMemory ? `${nav.deviceMemory} GB` : 'unavailable',
    touchPoints: String(nav.maxTouchPoints ?? 0),
    cookiesEnabled: nav.cookieEnabled ? 'enabled' : 'disabled',
    doNotTrack: nav.doNotTrack === '1' ? 'enabled' : 'not set',
    colorScheme: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
    online: navigator.onLine ? 'online' : 'offline',
  };
}

export function BrowserInfoCard() {
  const [config, setConfig] = useState<BrowserConfig | null>(null);

  useEffect(() => {
    setConfig(collectBrowserConfig());
  }, []);

  return (
    <Card title="Browser Configuration" accent="blue">
      <InfoRow label="Language" value={config?.language} />
      <InfoRow label="All languages" value={config?.languages} />
      <InfoRow label="Timezone" value={config?.timezone} />
      <InfoRow label="UTC offset" value={config?.timezoneOffset} />
      <InfoRow label="Screen resolution" value={config?.screenResolution} />
      <InfoRow label="Viewport size" value={config?.viewport} />
      <InfoRow label="Color depth" value={config?.colorDepth} />
      <InfoRow label="Pixel ratio" value={config?.pixelRatio} />
      <InfoRow label="Platform" value={config?.platform} />
      <InfoRow label="CPU cores" value={config?.cores} />
      <InfoRow label="Device memory" value={config?.deviceMemory} />
      <InfoRow label="Touch points" value={config?.touchPoints} />
      <InfoRow label="Cookies" value={config?.cookiesEnabled} />
      <InfoRow label="Do Not Track" value={config?.doNotTrack} />
      <InfoRow label="Preferred color scheme" value={config?.colorScheme} />
      <InfoRow label="Connection" value={config?.online} />
    </Card>
  );
}
