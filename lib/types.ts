export interface OsInfo {
  name: string | null;
  version: string | null;
}

export interface DeviceInfo {
  vendor: string | null;
  model: string | null;
  type: string | null;
}

export interface BrowserEngineInfo {
  name: string | null;
  version: string | null;
}

export interface ServerDetection {
  userAgent: string;
  os: OsInfo;
  browser: BrowserEngineInfo;
  device: DeviceInfo;
  isMobile: boolean;
}

export interface NetworkInfo {
  ip: string | null;
  city: string | null;
  region: string | null;
  country: string | null;
  countryCode: string | null;
  postalCode: string | null;
  latitude: number | null;
  longitude: number | null;
  timezone: string | null;
  isp: string | null;
  asn: string | null;
  source: 'forwarded-header' | 'direct-connection' | 'unavailable';
  error?: string;
}
