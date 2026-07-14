import { UAParser } from 'ua-parser-js';
import type { ServerDetection } from './types';

export function detectFromUserAgent(userAgent: string): ServerDetection {
  const parser = new UAParser(userAgent);
  const result = parser.getResult();

  return {
    userAgent,
    os: {
      name: result.os.name ?? null,
      version: result.os.version ?? null,
    },
    browser: {
      name: result.browser.name ?? null,
      version: result.browser.version ?? null,
    },
    device: {
      vendor: result.device.vendor ?? null,
      model: result.device.model ?? null,
      type: result.device.type ?? null,
    },
    isMobile: result.device.type === 'mobile' || result.device.type === 'tablet',
  };
}

/**
 * Extracts the client's public IP from proxy headers. Behind a reverse proxy
 * (nginx, Traefik, a cloud LB) X-Forwarded-For carries the real client IP;
 * without one (e.g. `docker run -p`) only the container's view is available.
 */
export function extractClientIp(headers: Headers): { ip: string | null; viaProxy: boolean } {
  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor) {
    const first = forwardedFor.split(',')[0]?.trim();
    if (first) return { ip: first, viaProxy: true };
  }

  const realIp = headers.get('x-real-ip');
  if (realIp) return { ip: realIp.trim(), viaProxy: true };

  return { ip: null, viaProxy: false };
}
