function getEnvVar(key: string, fallback: string): string {
  const value = (import.meta.env as Record<string, unknown>)[key];
  return typeof value === 'string' ? value : fallback;
}

export const env = {
  apiUrl: getEnvVar('VITE_API_URL', 'http://localhost:8000/api/v1'),
} as const;
