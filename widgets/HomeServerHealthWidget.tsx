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
  /** Optional: minutes since lastChecked was computed. Drives the "stale" badge. */
  minutesSinceCheck?: number;
}

/* ------------------------------------------------------------------ */
/*  Design tokens — single source of truth for spacing/radius/colors  */
/*  so nothing drifts out of alignment as the widget evolves.         */
/* ------------------------------------------------------------------ */

const SPACE = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
};

const RADIUS = {
  card: 20,
  pill: 8,
  dot: 4,
};

const C = {
  bg: "#232323",
  bgElevated: "#2b2b2b",
  border: "#3a3a3a",
  divider: "#3a3a3a",
  textPrimary: "#f5f5f5",
  textSecondary: "#b5b5b5",
  textMuted: "#7a7a7a",
  green: "#4ade80",
  greenDim: "#153b26",
  amber: "#fbbf24",
  amberDim: "#3d2e08",
  rose: "#fb7185",
  roseDim: "#3a1420",
  track: "#3a3a3a",
};

function statusColor(s: ServiceStatus) {
  return s === "ONLINE" ? C.green : s === "OFFLINE" ? C.rose : C.amber;
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Offline first, then unknown, then online — the things that need
 *  attention should always be visible even if the list gets truncated. */
function sortedServices(services: Record<string, ServiceStatus>, max = 8) {
  const rank: Record<ServiceStatus, number> = {
    OFFLINE: 0,
    UNKNOWN: 1,
    ONLINE: 2,
  };
  return Object.entries(services)
    .sort(([, a], [, b]) => rank[a] - rank[b])
    .slice(0, max);
}

function StatusPill({
  label,
  color,
  bg,
}: {
  label: string;
  color: string;
  bg: string;
}) {
  return (
    <FlexWidget
      style={{
        backgroundColor: bg,
        borderRadius: RADIUS.pill,
        paddingHorizontal: SPACE.sm,
        paddingVertical: 4,
      }}
    >
      <TextWidget
        text={label}
        style={{ fontSize: 10, color, fontFamily: "sans-serif-medium" }}
      />
    </FlexWidget>
  );
}

/** Slim proportional bar showing onlineCount / totalCount at a glance —
 *  reads faster than the "3/5" text alone and fills otherwise-empty space
 *  in the header in a purposeful way. */
function UptimeBar({ ratio, color }: { ratio: number; color: string }) {
  const pct = Math.max(0, Math.min(1, ratio));
  return (
    <FlexWidget
      style={{
        height: 4,
        backgroundColor: C.track,
        borderRadius: 2,
        marginHorizontal: SPACE.lg,
        marginBottom: SPACE.sm,
      }}
    >
      <FlexWidget
        style={{
          height: 4,
          width: `${Math.round(pct * 100)}%` as unknown as number,
          backgroundColor: color,
          borderRadius: 2,
        }}
      />
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
        paddingVertical: SPACE.xs,
        paddingHorizontal: SPACE.lg,
      }}
    >
      <FlexWidget
        style={{
          width: 8,
          height: 8,
          borderRadius: RADIUS.dot,
          backgroundColor: color,
          marginRight: SPACE.sm,
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
    </FlexWidget>
  );
}

function Divider({ inset = SPACE.lg }: { inset?: number }) {
  return (
    <FlexWidget
      style={{ height: 1, backgroundColor: C.divider, marginHorizontal: inset }}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Main widget                                                       */
/* ------------------------------------------------------------------ */

export function HomeServerHealthWidget({ data }: { data?: ServerData }) {
  const allGood = data?.allOnline ?? true;
  const serverDown = data?.serverDown ?? false;
  const isStale = (data?.minutesSinceCheck ?? 0) > 15;

  const headerColor = serverDown ? C.amber : allGood ? C.green : C.rose;
  const headerBg = serverDown ? C.amberDim : allGood ? C.greenDim : C.roseDim;

  const offlineCount = data ? data.totalCount - data.onlineCount : 0;
  const shown = data ? sortedServices(data.services) : [];
  const hiddenCount = data
    ? Math.max(0, Object.keys(data.services).length - shown.length)
    : 0;

  return (
    // A single outer card owns the background + radius; nothing inside
    // re-declares a background color, which is what was causing the
    // misaligned/duplicated-corner look before.
    <FlexWidget
      clickAction="OPEN_APP"
      style={{
        height: "match_parent",
        width: "match_parent",
        flexDirection: "column",
        backgroundColor: C.bg,
        borderRadius: RADIUS.card,
      }}
    >
      {/* Header */}
      <FlexWidget
        style={{
          flexDirection: "column",
          paddingHorizontal: SPACE.lg,
          paddingTop: SPACE.lg,
          paddingBottom: SPACE.sm,
        }}
      >
        <FlexWidget style={{ flexDirection: "row", alignItems: "center" }}>
          <FlexWidget
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: headerColor,
              marginRight: SPACE.sm,
            }}
          />
          <TextWidget
            text={data?.serverName ?? "HOME SERVER"}
            style={{
              fontSize: 13,
              color: C.textPrimary,
              fontFamily: "sans-serif-medium",
            }}
          />
        </FlexWidget>

        {/* One-line status summary so the header carries meaning even
            at a glance, before reading the service list. */}
        <TextWidget
          text={
            serverDown
              ? "Unreachable"
              : allGood
                ? "All systems operational"
                : `${offlineCount} service${offlineCount === 1 ? "" : "s"} need attention`
          }
          style={{
            fontSize: 10,
            color: C.textSecondary,
            fontFamily: "sans-serif",
            marginTop: 2,
            marginLeft: SPACE.md + 4,
          }}
        />

        {/* Count pill on its own line, below the title block. */}
        <FlexWidget style={{ flexDirection: "row", marginTop: SPACE.sm }}>
          <StatusPill
            label={
              serverDown
                ? "DOWN"
                : data
                  ? `${data.onlineCount}/${data.totalCount} ONLINE`
                  : "…"
            }
            color={headerColor}
            bg={headerBg}
          />
        </FlexWidget>
      </FlexWidget>

      {data && !serverDown && (
        <UptimeBar
          ratio={data.totalCount ? data.onlineCount / data.totalCount : 1}
          color={headerColor}
        />
      )}

      <Divider inset={0} />

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
        <FlexWidget
          style={{
            flexDirection: "column",
            flex: 1,
            paddingVertical: SPACE.xs,
          }}
        >
          {shown.map(([name, status], i) => (
            <FlexWidget key={name} style={{ flexDirection: "column" }}>
              <ServiceRow name={name} status={status} />
              {i < shown.length - 1 && <Divider />}
            </FlexWidget>
          ))}
          {hiddenCount > 0 && (
            <TextWidget
              text={`+${hiddenCount} more`}
              style={{
                fontSize: 10,
                color: C.textMuted,
                fontFamily: "sans-serif",
                paddingHorizontal: SPACE.lg,
                paddingTop: SPACE.xs,
              }}
            />
          )}
        </FlexWidget>
      )}

      <Divider inset={0} />

      {/* Footer */}
      <FlexWidget
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: SPACE.lg,
          paddingVertical: SPACE.sm,
        }}
      >
        <TextWidget
          text={data ? `Updated ${data.lastChecked}` : ""}
          style={{ fontSize: 9, color: C.textMuted, fontFamily: "sans-serif" }}
        />
        <FlexWidget style={{ flexDirection: "row", alignItems: "center" }}>
          {isStale && (
            <TextWidget
              text="STALE"
              style={{
                fontSize: 9,
                color: C.amber,
                fontFamily: "sans-serif-medium",
                marginRight: SPACE.sm,
              }}
            />
          )}
          {/* Tap-to-refresh affordance. Wire "REFRESH" up in your
              widget task handler (widget-task-handler.ts) to re-run
              your health check and call requestWidgetUpdate. */}
          <FlexWidget
            clickAction="REFRESH"
            style={{
              paddingHorizontal: SPACE.sm,
              paddingVertical: 2,
              borderRadius: RADIUS.pill,
              backgroundColor: C.bgElevated,
            }}
          >
            <TextWidget
              text="REFRESH"
              style={{
                fontSize: 9,
                color: C.textSecondary,
                fontFamily: "sans-serif-medium",
              }}
            />
          </FlexWidget>
        </FlexWidget>
      </FlexWidget>
    </FlexWidget>
  );
}
