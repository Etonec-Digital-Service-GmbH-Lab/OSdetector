'use client';

import { useEffect, useState } from 'react';
import { Card, InfoRow } from './Card';
import type { NetworkInfo } from '@/lib/types';

export function NetworkInfoCard() {
  const [info, setInfo] = useState<NetworkInfo | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/network')
      .then((res) => res.json())
      .then((data: NetworkInfo) => {
        if (!cancelled) setInfo(data);
      })
      .catch(() => {
        if (!cancelled) setLoadError('Could not reach the network information API.');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const location = [info?.city, info?.region, info?.countryCode].filter(Boolean).join(', ');

  return (
    <Card title="Network" accent="red">
      <InfoRow label="IP address" value={info?.ip ?? (info ? 'unavailable' : 'looking up…')} />
      <InfoRow label="ISP / Organization" value={info?.isp} />
      <InfoRow label="ASN" value={info?.asn} />
      <InfoRow label="Location" value={location || undefined} />
      <InfoRow label="Postal code" value={info?.postalCode} />
      <InfoRow
        label="Coordinates"
        value={info?.latitude != null && info?.longitude != null ? `${info.latitude}, ${info.longitude}` : undefined}
      />
      <InfoRow label="Timezone (by IP)" value={info?.timezone} />
      <InfoRow
        label="Source"
        value={
          info?.source === 'forwarded-header'
            ? 'X-Forwarded-For header'
            : info?.source === 'direct-connection'
              ? 'direct connection'
              : info
                ? 'unavailable'
                : undefined
        }
      />
      {(info?.error || loadError) && (
        <p className="mt-3 rounded-lg bg-brand-red/10 px-3 py-2 text-xs text-brand-red">
          {info?.error ?? loadError}
        </p>
      )}
    </Card>
  );
}
