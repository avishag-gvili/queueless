export type ConsentCategory = 'essential' | 'analytics' | 'marketing';

export interface ConsentState {
  essential: true;
  analytics: boolean;
  marketing: boolean;
  decidedAt: string;
  version: number;
}

export const CURRENT_VERSION = 1;

const STORAGE_KEY = 'queueless_cookie_consent_v1';

export function getConsent(): ConsentState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ConsentState;
    if (parsed.version !== CURRENT_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function setConsent(state: ConsentState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function hasDecided(): boolean {
  return getConsent() !== null;
}
