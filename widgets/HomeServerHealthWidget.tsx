import React from "react";
import { FlexWidget, TextWidget } from "react-native-android-widget";

export type ServiceStatus = "ONLINE" | "OFFLINE" | "UNKNOWN";

export interface ServerData {
  serverName: string;
  services: Record<string, ServiceStatus>;
  allOnline: boolean;
  onlineCount: number;
  totalCount: number;
  lastChecked: string;
  serverDown?: boolean;
}

const C = {
  bg: "#2b2b2b",
  border: "#3f3f3f",
  dot: "#454545",
  textPrimary: "#f0f0f0",
  textMuted: "#888888",
  green: "#4ade80",
  amber: "#fbbf24",
  rose: "#fb7185",
  greenDim: "#14432a",
  roseDim: "#3b0f18",
};

function statusColor(s: ServiceStatus) {
  return s === "ONLINE" ? C.green : s === "OFFLINE" ? C.rose : C.amber;
}

function topServices(services: Record<string, ServiceStatus>, max = 9) {
  const entries = Object.entries(services);
  entries.sort(([, a], [, b]) => {
    if (a === b) return 0;
    if (a === "OFFLINE") return -1;
    if (b === "OFFLINE") return 1;
    return 0;
  });
  return entries.slice(0, max);
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function DotRow({ cols }: { cols: number }) {
  return (
    <FlexWidget style={{ flexDirection: "row", marginBottom: 10 }}>
      {Array.from({ length: cols }).map((_, i) => (
        <FlexWidget
          key={i}
          style={{
            width: 3,
            height: 3,
            borderRadius: 2,
            backgroundColor: C.dot,
            marginRight: 10,
          }}
        />
      ))}
    </FlexWidget>
  );
}

function ServiceRow({ name, status }: { name: string; status: ServiceStatus }) {
  const color = statusColor(status);
  return (
    <FlexWidget
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 6,
        paddingHorizontal: 12,
      }}
    >
      <FlexWidget
        style={{
          width: 7,
          height: 7,
          borderRadius: 4,
          backgroundColor: color,
          marginRight: 10,
        }}
      />
      <TextWidget
        text={capitalize(name)}
        style={{
          fontSize: 12,
          color: C.textPrimary,
          fontFamily: "sans-serif-medium",
          flex: 1,
        }}
      />
      <TextWidget
        text={status}
        style={{ fontSize: 10, color, fontFamily: "sans-serif" }}
      />
    </FlexWidget>
  );
}

function Divider() {
  return (
    <FlexWidget
      style={{ height: 1, backgroundColor: C.border, marginHorizontal: 12 }}
    />
  );
}

export function HomeServerHealthWidget({ data }: { data?: ServerData }) {
  const allGood = data?.allOnline ?? true;
  const serverDown = data?.serverDown ?? false;
  const headerDot = serverDown ? C.amber : allGood ? C.green : C.rose;
  const badgeBg = serverDown ? "#3d2a00" : allGood ? C.greenDim : C.roseDim;
  const shown = data ? topServices(data.services) : [];

  return (
    <FlexWidget
      style={{
        height: "match_parent",
        width: "match_parent",
        flexDirection: "column",
        backgroundColor: C.bg,
        borderRadius: 20,
      }}
    >
      {/* Decorative dots */}
      <FlexWidget
        style={{
          flexDirection: "column",
          paddingTop: 10,
          paddingLeft: 12,
          paddingRight: 12,
        }}
      >
        <DotRow cols={12} />
        <DotRow cols={12} />
      </FlexWidget>

      {/* Header */}
      <FlexWidget
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: 12,
          paddingBottom: 8,
        }}
      >
        <FlexWidget style={{ flexDirection: "row", alignItems: "center" }}>
          <FlexWidget
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: headerDot,
              marginRight: 7,
            }}
          />
          <TextWidget
            text={data?.serverName ?? "HOME SERVER"}
            style={{
              fontSize: 12,
              color: C.textPrimary,
              fontFamily: "sans-serif-medium",
            }}
          />
        </FlexWidget>
        <FlexWidget
          style={{
            backgroundColor: badgeBg,
            borderRadius: 6,
            paddingHorizontal: 8,
            paddingVertical: 3,
          }}
        >
          <TextWidget
            text={
              serverDown
                ? "SERVER DOWN"
                : data
                  ? `${data.onlineCount}/${data.totalCount}`
                  : "…"
            }
            style={{
              fontSize: 10,
              color: headerDot,
              fontFamily: "sans-serif-medium",
            }}
          />
        </FlexWidget>
      </FlexWidget>

      {/* Divider */}
      <FlexWidget
        style={{ height: 1, backgroundColor: "#555555", marginBottom: 4 }}
      />

      {/* Service list */}
      {shown.length === 0 ? (
        <FlexWidget
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <TextWidget
            text="Loading…"
            style={{
              fontSize: 12,
              color: C.textMuted,
              fontFamily: "sans-serif",
            }}
          />
        </FlexWidget>
      ) : (
        <FlexWidget style={{ flexDirection: "column", flex: 1 }}>
          {shown.map(([name, status], i) => (
            <FlexWidget key={name} style={{ flexDirection: "column" }}>
              <ServiceRow name={name} status={status} />
              {i < shown.length - 1 && <Divider />}
            </FlexWidget>
          ))}
        </FlexWidget>
      )}

      {/* Footer */}
      <FlexWidget style={{ height: 1, backgroundColor: "#555555" }} />
      <FlexWidget
        style={{
          flexDirection: "column",
          paddingBottom: 10,
          paddingTop: 4,
          paddingHorizontal: 12,
        }}
      >
        <TextWidget
          text={data ? `Updated ${data.lastChecked}` : ""}
          style={{ fontSize: 9, color: C.textMuted, fontFamily: "sans-serif" }}
        />
        <DotRow cols={12} />
      </FlexWidget>
    </FlexWidget>
  );
}
