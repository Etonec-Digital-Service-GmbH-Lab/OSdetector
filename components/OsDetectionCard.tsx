'use client';

import { useEffect, useState } from 'react';
import { UAParser } from 'ua-parser-js';
import { Card, InfoRow } from './Card';
import type { ServerDetection } from '@/lib/types';

interface NavigatorUAData {
  platform: string;
  mobile: boolean;
  brands: Array<{ brand: string; version: string }>;
  getHighEntropyValues?: (hints: string[]) => Promise<{
    platformVersion?: string;
    model?: string;
    fullVersionList?: Array<{ brand: string; version: string }>;
  }>;
}

interface ClientDetection {
  osName: string | null;
  osVersion: string | null;
  browserName: string | null;
  browserVersion: string | null;
  isMobile: boolean;
  viaClientHints: boolean;
}

function readClientHints(uaData: NavigatorUAData | undefined) {
  if (!uaData) return null;
  const brand = uaData.brands?.find((b) => !/not.a.brand/i.test(b.brand)) ?? uaData.brands?.[0];
  return {
    platform: uaData.platform,
    mobile: uaData.mobile,
    brand,
  };
}

async function detectOnClient(): Promise<ClientDetection> {
  const ua = navigator.userAgent;
  const parsed = new UAParser(ua).getResult();
  const uaData = (navigator as unknown as { userAgentData?: NavigatorUAData }).userAgentData;
  const hints = readClientHints(uaData);

  let osVersion = parsed.os.version ?? null;
  let osName = parsed.os.name ?? hints?.platform ?? null;

  if (uaData?.getHighEntropyValues) {
    try {
      const highEntropy = await uaData.getHighEntropyValues(['platformVersion', 'model']);
      if (highEntropy.platformVersion) {
        osVersion = mapWindowsVersion(hints?.platform ?? osName, highEntropy.platformVersion) ?? osVersion;
      }
    } catch {
      // Client Hints not permitted by the browser's Permissions Policy; fall back to UA string.
    }
  }

  return {
    osName,
    osVersion,
    browserName: hints?.brand?.brand ?? parsed.browser.name ?? null,
    browserVersion: hints?.brand?.version ?? parsed.browser.version ?? null,
    isMobile: hints?.mobile ?? (parsed.device.type === 'mobile' || parsed.device.type === 'tablet'),
    viaClientHints: Boolean(hints),
  };
}

/** Chromium reports Windows 11 as platformVersion >= 13.0.0 (a legacy quirk of Client Hints). */
function mapWindowsVersion(platform: string | null | undefined, platformVersion: string): string | null {
  if (platform !== 'Windows') return platformVersion;
  const major = parseInt(platformVersion.split('.')[0] ?? '0', 10);
  if (major >= 13) return '11';
  if (major > 0) return '10';
  return platformVersion;
}

export function OsDetectionCard({ server }: { server: ServerDetection }) {
  const [client, setClient] = useState<ClientDetection | null>(null);

  useEffect(() => {
    detectOnClient().then(setClient);
  }, []);

  const agreement =
    client && server.os.name && client.osName
      ? client.osName.toLowerCase() === server.os.name.toLowerCase()
      : null;

  return (
    <Card title="Operating System" accent="blue">
      <div className="mb-4 flex items-center gap-3">
        <div className="text-3xl font-bold text-white">
          {client?.osName ?? server.os.name ?? 'Detecting…'}
        </div>
        {(client?.osVersion ?? server.os.version) && (
          <span className="pill bg-brand-blue/20 text-brand-blue">
            v{client?.osVersion ?? server.os.version}
          </span>
        )}
        {agreement !== null && (
          <span
            className={`pill ${agreement ? 'bg-emerald-500/20 text-emerald-400' : 'bg-brand-red/20 text-brand-red'}`}
          >
            {agreement ? 'server & browser agree' : 'server & browser differ'}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-x-6 sm:grid-cols-2">
        <div>
          <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-white/40">
            From the server (User-Agent header)
          </h3>
          <InfoRow label="OS" value={server.os.name} />
          <InfoRow label="OS version" value={server.os.version} />
          <InfoRow label="Browser" value={server.browser.name} />
          <InfoRow label="Browser version" value={server.browser.version} />
          <InfoRow label="Device type" value={server.device.type ?? (server.isMobile ? 'mobile' : 'desktop')} />
        </div>
        <div>
          <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-white/40">
            From the browser (JavaScript)
          </h3>
          <InfoRow label="OS" value={client?.osName ?? 'detecting…'} />
          <InfoRow label="OS version" value={client?.osVersion ?? 'detecting…'} />
          <InfoRow label="Browser" value={client?.browserName ?? 'detecting…'} />
          <InfoRow label="Browser version" value={client?.browserVersion ?? 'detecting…'} />
          <InfoRow
            label="Client Hints API"
            value={client ? (client.viaClientHints ? 'supported' : 'not available') : 'detecting…'}
          />
        </div>
      </div>

      <p className="mt-4 rounded-lg bg-white/5 px-3 py-2 text-xs text-white/50">
        Raw User-Agent: <span className="break-all font-mono text-white/70">{server.userAgent}</span>
      </p>
    </Card>
  );
}
