import type {
  ServerData,
  ServiceStatus,
} from "./widgets/HomeServerHealthWidget";

const STATUS_URL = process.env.EXPO_PUBLIC_STATUS_URL!;
const STATUS_SECRET = process.env.EXPO_PUBLIC_STATUS_SECRET!;
const SERVER_NAME = process.env.EXPO_PUBLIC_SERVER_NAME ?? "Home Server";

const HEALTH_URL = STATUS_URL.replace("/api/status", "/health");

function makeTimeout(ms: number) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  return { signal: controller.signal, clear: () => clearTimeout(id) };
}

async function isServerReachable(): Promise<boolean> {
  const { signal, clear } = makeTimeout(4000);
  try {
    const res = await fetch(HEALTH_URL, { signal });
    clear();
    return res.ok;
  } catch {
    clear();
    return false;
  }
}

export async function fetchServerData(): Promise<ServerData> {
  const lastChecked = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const serverName = SERVER_NAME.toUpperCase();

  const reachable = await isServerReachable();
  if (!reachable) {
    return {
      serverName,
      services: { "status server": "OFFLINE" },
      allOnline: false,
      onlineCount: 0,
      totalCount: 1,
      lastChecked,
      serverDown: true,
    };
  }

  const { signal, clear } = makeTimeout(10_000);
  try {
    const res = await fetch(`${STATUS_URL}?secret=${STATUS_SECRET}`, {
      signal,
    });
    clear();

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const json: Record<string, string> = await res.json();

    const services: Record<string, ServiceStatus> = {};
    for (const [key, val] of Object.entries(json)) {
      if (key.startsWith("_")) continue; // strip _meta fields
      services[key] =
        val === "ONLINE" ? "ONLINE" : val === "OFFLINE" ? "OFFLINE" : "UNKNOWN";
    }

    const values = Object.values(services);
    const onlineCount = values.filter((v) => v === "ONLINE").length;

    return {
      serverName,
      services,
      allOnline: onlineCount === values.length,
      onlineCount,
      totalCount: values.length,
      lastChecked,
      serverDown: false,
    };
  } catch {
    clear();
    return {
      serverName,
      services: {},
      allOnline: false,
      onlineCount: 0,
      totalCount: 0,
      lastChecked,
      serverDown: false,
    };
  }
}

export async function sendCommand(commandKey: string): Promise<{
  success: boolean;
  output: string;
  command: string;
}> {
  const BASE_URL = STATUS_URL.replace("/api/status", "");
  const { signal, clear } = makeTimeout(20_000); // longer timeout for commands like reboot

  try {
    const res = await fetch(`${BASE_URL}/api/command?secret=${STATUS_SECRET}`, {
      method: "POST",
      signal,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ commandKey }),
    });
    clear();
    return await res.json();
  } catch (err: any) {
    clear();
    return {
      success: false,
      command: commandKey,
      output: err.message ?? "Request failed",
    };
  }
}
