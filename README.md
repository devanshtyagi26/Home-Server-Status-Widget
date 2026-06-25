# Home Server Health Widget

Android home screen widget for OnePlus Nord 4 showing real-time status of your server's services.

Built with **Expo + React Native** using [`react-native-android-widget`](https://saleksovski.github.io/react-native-android-widget/).

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

```env
EXPO_PUBLIC_STATUS_URL=https://status.devanshtyagi.me/api/status
EXPO_PUBLIC_STATUS_SECRET=276
EXPO_PUBLIC_SERVER_NAME=Devansh's Server
```

`EXPO_PUBLIC_` prefix is required — Expo inlines these at build time.  
**Never commit `.env` to git** (it's already in `.gitignore`).

### 3. Build (native required — Expo Go won't work)

```bash
# Generate native android/ folder
npx expo prebuild

# Build & install on connected Nord 4
npx expo run:android
```

Or via EAS cloud build:

```bash
eas build --platform android --profile development
```

---

## API contract

Your endpoint (`GET /api/status?secret=<SECRET>`) must return:

```json
{
  "crystalogix": "ONLINE",
  "dokploy": "ONLINE",
  "jellyfin": "OFFLINE"
}
```

Any value other than `"ONLINE"` is treated as `OFFLINE`.  
Services with issues sort to the top of the widget automatically.

---

## Adding the widget to your home screen

1. Install the app on your Nord 4.
2. Long-press any empty area → **Widgets**.
3. Find **Home Server Health** → drag onto screen.

The widget auto-refreshes every **30 minutes** (Android minimum).  
Open the app and tap **Refresh Now** to push an instant update.

---

## Project structure

```
├── .env                          ← your secrets (gitignored)
├── .env.example                  ← template to share
├── api.ts                        ← shared fetch helper (reads env vars)
├── app.config.ts                 ← Expo config + widget plugin
├── index.ts                      ← entry point, registers task handler
├── widget-task-handler.tsx       ← Android widget lifecycle
├── App.tsx                       ← in-app dashboard + widget preview
└── widgets/
    └── HomeServerHealthWidget.tsx ← widget UI component
```
