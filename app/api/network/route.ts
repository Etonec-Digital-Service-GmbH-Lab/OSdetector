import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { extractClientIp } from '@/lib/server-detection';
import type { NetworkInfo } from '@/lib/types';

export const dynamic = 'force-dynamic';

interface IpApiResponse {
  ip?: string;
  city?: string;
  region?: string;
  country_name?: string;
  country_code?: string;
  postal?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  org?: string;
  asn?: string;
  error?: boolean;
  reason?: string;
}

async function lookupIp(ip: string | null): Promise<IpApiResponse> {
  const url = ip ? `https://ipapi.co/${encodeURIComponent(ip)}/json/` : 'https://ipapi.co/json/';
  const res = await fetch(url, {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) {
    throw new Error(`Lookup service responded with ${res.status}`);
  }
  return (await res.json()) as IpApiResponse;
}

export async function GET() {
  const headerList = await headers();
  const { ip: forwardedIp, viaProxy } = extractClientIp(headerList);

  try {
    const data = await lookupIp(forwardedIp);

    if (data.error) {
      const info: NetworkInfo = {
        ip: forwardedIp,
        city: null,
        region: null,
        country: null,
        countryCode: null,
        postalCode: null,
        latitude: null,
        longitude: null,
        timezone: null,
        isp: null,
        asn: null,
        source: forwardedIp ? (viaProxy ? 'forwarded-header' : 'direct-connection') : 'unavailable',
        error: data.reason ?? 'Lookup service could not resolve this address.',
      };
      return NextResponse.json(info);
    }

    const info: NetworkInfo = {
      ip: data.ip ?? forwardedIp,
      city: data.city ?? null,
      region: data.region ?? null,
      country: data.country_name ?? null,
      countryCode: data.country_code ?? null,
      postalCode: data.postal ?? null,
      latitude: data.latitude ?? null,
      longitude: data.longitude ?? null,
      timezone: data.timezone ?? null,
      isp: data.org ?? null,
      asn: data.asn ?? null,
      source: viaProxy ? 'forwarded-header' : 'direct-connection',
    };
    return NextResponse.json(info);
  } catch (err) {
    const info: NetworkInfo = {
      ip: forwardedIp,
      city: null,
      region: null,
      country: null,
      countryCode: null,
      postalCode: null,
      latitude: null,
      longitude: null,
      timezone: null,
      isp: null,
      asn: null,
      source: forwardedIp ? (viaProxy ? 'forwarded-header' : 'direct-connection') : 'unavailable',
      error: err instanceof Error ? err.message : 'Unknown error while contacting the lookup service.',
    };
    return NextResponse.json(info, { status: 200 });
  }
}
