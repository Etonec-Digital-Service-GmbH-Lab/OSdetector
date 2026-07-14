import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { extractClientIp } from '@/lib/server-detection';
import type { NetworkInfo } from '@/lib/types';

export const dynamic = 'force-dynamic';

// ip-api.com: no key/HTTPS required on the free tier, 45 req/min per caller IP.
// The free tier is HTTP-only, but this call runs server-side, so there's no
// browser mixed-content restriction.
const FIELDS =
  'status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,mobile,proxy,hosting,query';

interface IpApiComResponse {
  status: 'success' | 'fail';
  message?: string;
  country?: string;
  countryCode?: string;
  region?: string;
  regionName?: string;
  city?: string;
  zip?: string;
  lat?: number;
  lon?: number;
  timezone?: string;
  isp?: string;
  org?: string;
  as?: string;
  mobile?: boolean;
  proxy?: boolean;
  hosting?: boolean;
  query?: string;
}

async function lookupIp(ip: string | null): Promise<IpApiComResponse> {
  const target = ip ?? '';
  const url = `http://ip-api.com/json/${encodeURIComponent(target)}?fields=${FIELDS}`;
  const res = await fetch(url, {
    cache: 'no-store',
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) {
    throw new Error(`Lookup service responded with ${res.status}`);
  }
  return (await res.json()) as IpApiComResponse;
}

function connectionType(data: IpApiComResponse): NetworkInfo['connectionType'] {
  if (data.hosting) return 'hosting';
  if (data.proxy) return 'proxy';
  if (data.mobile) return 'mobile';
  return 'residential';
}

function emptyInfo(forwardedIp: string | null, viaProxy: boolean, error: string): NetworkInfo {
  return {
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
    connectionType: null,
    source: forwardedIp ? (viaProxy ? 'forwarded-header' : 'direct-connection') : 'unavailable',
    error,
  };
}

export async function GET() {
  const headerList = await headers();
  const { ip: forwardedIp, viaProxy } = extractClientIp(headerList);

  try {
    const data = await lookupIp(forwardedIp);

    if (data.status !== 'success') {
      return NextResponse.json(
        emptyInfo(forwardedIp, viaProxy, data.message ?? 'Lookup service could not resolve this address.'),
      );
    }

    const info: NetworkInfo = {
      ip: data.query ?? forwardedIp,
      city: data.city ?? null,
      region: data.regionName ?? null,
      country: data.country ?? null,
      countryCode: data.countryCode ?? null,
      postalCode: data.zip ?? null,
      latitude: data.lat ?? null,
      longitude: data.lon ?? null,
      timezone: data.timezone ?? null,
      isp: data.isp ?? data.org ?? null,
      asn: data.as ?? null,
      connectionType: connectionType(data),
      source: viaProxy ? 'forwarded-header' : 'direct-connection',
    };
    return NextResponse.json(info);
  } catch (err) {
    return NextResponse.json(
      emptyInfo(
        forwardedIp,
        viaProxy,
        err instanceof Error ? err.message : 'Unknown error while contacting the lookup service.',
      ),
    );
  }
}
