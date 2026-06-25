import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ServiceStatus = 'ONLINE' | 'OFFLINE' | 'UNKNOWN';

export interface ServerData {
  serverName: string;
  services: Record<string, ServiceStatus>;
  allOnline: boolean;
  onlineCount: number;
  totalCount: number;
  lastChecked: string;
}

// ─── Palette ──────────────────────────────────────────────────────────────────

const C = {
  bg: '#0f172a',
  surface: '#1e293b',
  border: '#334155',
  textPrimary: '#f1f5f9',
  textMuted: '#94a3b8',
  cyan: '#22d3ee',
  green: '#4ade80',
  amber: '#fbbf24',
  rose: '#fb7185',
  greenDim: '#14432a',
  roseDim: '#3b0f18',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function dotColor(s: ServiceStatus) {
  return s === 'ONLINE' ? C.green : s === 'OFFLINE' ? C.rose : C.amber;
}

// Clamp to at most 6 services shown in the widget to avoid overflow
function topServices(services: Record<string, ServiceStatus>, max = 6) {
  const entries = Object.entries(services);
  // show OFFLINE first so issues are immediately visible
  entries.sort(([, a], [, b]) => {
    if (a === b) return 0;
    if (a === 'OFFLINE') return -1;
    if (b === 'OFFLINE') return 1;
    return 0;
  });
  return entries.slice(0, max);
}

// ─── Service row ──────────────────────────────────────────────────────────────

function ServiceRow({
  name,
  status,
}: {
  name: string;
  status: ServiceStatus;
}) {
  const color = dotColor(status);
  return (
    <FlexWidget
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
        flex: 1,
      }}
    >
      {/* status dot */}
      <FlexWidget
        style={{
          width: 6,
          height: 6,
          borderRadius: 3,
          backgroundColor: color,
          marginRight: 6,
        }}
      />
      <TextWidget
        text={name}
        style={{
          fontSize: 11,
          color: C.textPrimary,
          fontFamily: 'Inter',
          flex: 1,
        }}
      />
      <TextWidget
        text={status}
        style={{
          fontSize: 9,
          color: color,
          fontFamily: 'Inter',
        }}
      />
    </FlexWidget>
  );
}

// ─── Main Widget ──────────────────────────────────────────────────────────────

export function HomeServerHealthWidget({ data }: { data?: ServerData }) {
  const allGood = data?.allOnline ?? true;
  const headerDot = allGood ? C.green : C.rose;
  const badgeBg = allGood ? C.greenDim : C.roseDim;
  const badgeText = allGood ? 'ALL GOOD' : 'ISSUES';

  const shown = data ? topServices(data.services) : [];

  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        flexDirection: 'column',
        backgroundColor: C.bg,
        borderRadius: 16,
        padding: 14,
      }}
    >
      {/* ── Header ── */}
      <FlexWidget
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 8,
        }}
      >
        <FlexWidget style={{ flexDirection: 'row', alignItems: 'center' }}>
          <FlexWidget
            style={{
              width: 7,
              height: 7,
              borderRadius: 4,
              backgroundColor: headerDot,
              marginRight: 6,
            }}
          />
          <TextWidget
            text={data?.serverName ?? 'HOME SERVER'}
            style={{ fontSize: 11, color: C.textPrimary, fontFamily: 'Inter' }}
          />
        </FlexWidget>

        <FlexWidget
          style={{
            backgroundColor: badgeBg,
            borderRadius: 6,
            paddingHorizontal: 7,
            paddingVertical: 2,
          }}
        >
          <TextWidget
            text={
              data
                ? `${data.onlineCount}/${data.totalCount} ${badgeText}`
                : '...'
            }
            style={{ fontSize: 9, color: headerDot, fontFamily: 'Inter' }}
          />
        </FlexWidget>
      </FlexWidget>

      {/* ── Divider ── */}
      <FlexWidget
        style={{ height: 1, backgroundColor: C.border, marginBottom: 9 }}
      />

      {/* ── Service list ── */}
      {shown.length === 0 ? (
        <FlexWidget
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <TextWidget
            text="Loading…"
            style={{ fontSize: 12, color: C.textMuted, fontFamily: 'Inter' }}
          />
        </FlexWidget>
      ) : (
        <FlexWidget style={{ flexDirection: 'column', flex: 1 }}>
          {shown.map(([name, status]) => (
            <ServiceRow key={name} name={name} status={status} />
          ))}
          {data && data.totalCount > 6 && (
            <TextWidget
              text={`+${data.totalCount - 6} more services`}
              style={{ fontSize: 9, color: C.textMuted, fontFamily: 'Inter', marginTop: 2 }}
            />
          )}
        </FlexWidget>
      )}

      {/* ── Footer ── */}
      <TextWidget
        text={data ? `Updated ${data.lastChecked}` : ''}
        style={{
          fontSize: 9,
          color: C.textMuted,
          fontFamily: 'Inter',
          marginTop: 6,
        }}
      />
    </FlexWidget>
  );
}
