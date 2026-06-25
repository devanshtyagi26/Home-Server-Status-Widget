import type { ServerData, ServiceStatus } from './widgets/HomeServerHealthWidget';

const STATUS_URL = process.env.EXPO_PUBLIC_STATUS_URL!;
const STATUS_SECRET = process.env.EXPO_PUBLIC_STATUS_SECRET!;
const SERVER_NAME = process.env.EXPO_PUBLIC_SERVER_NAME ?? 'Home Server';

export async function fetchServerData(): Promise<ServerData> {
  const lastChecked = new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(`${STATUS_URL}?secret=${STATUS_SECRET}`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const json: Record<string, string> = await res.json();

    const services: Record<string, ServiceStatus> = {};
    for (const [key, val] of Object.entries(json)) {
      services[key] =
        val === 'ONLINE' ? 'ONLINE' : val === 'OFFLINE' ? 'OFFLINE' : 'UNKNOWN';
    }

    const values = Object.values(services);
    const onlineCount = values.filter((v) => v === 'ONLINE').length;
    const totalCount = values.length;

    return {
      serverName: SERVER_NAME.toUpperCase(),
      services,
      allOnline: onlineCount === totalCount,
      onlineCount,
      totalCount,
      lastChecked,
    };
  } catch {
    return {
      serverName: SERVER_NAME.toUpperCase(),
      services: {},
      allOnline: false,
      onlineCount: 0,
      totalCount: 0,
      lastChecked,
    };
  }
}
