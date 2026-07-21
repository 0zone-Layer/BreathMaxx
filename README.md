# BreathMaxx

BreathMaxx is an offline-first Expo + React Native breathing app with TypeScript.

## Features

- Techniques:
  - **4-7-8** (Inhale 4s → Hold 7s → Exhale 8s)
  - **Kumbhaka Pranayama** (Puraka, Antara Kumbhaka, Rechaka, Bahya Kumbhaka)
  - **Custom** phase durations + rounds
- Session screen with:
  - synced breathing circle animation (Reanimated)
  - phase label + countdown
  - total progress ring
  - pause/resume/stop controls
- Voice guidance (expo-speech) with de-bounced phase cues
- Sound cues + ambient loop + complete tone (expo-av) with preloaded local assets
- Haptic phase cues (expo-haptics)
- Local session history persistence (AsyncStorage)
- Settings store (Zustand + persistence) for voice/sound/theme/haptics
- Timer hook (`useBreathingTimer`) driven by timestamps to reduce drift and handle app resumes

## Project structure

- `src/components` – UI building blocks (animated breathing circle)
- `src/hooks` – `useBreathingTimer` and tests
- `src/screens` – Home, Session, History, Settings
- `src/store` – settings (Zustand) + history persistence
- `src/types` – shared breathing/session models
- `assets/audio` – bundled local cue/ambient sound assets

## Setup

```bash
npm install
```

## Run

```bash
npm start
npm run android
npm run ios
npm run web
```

## Test

```bash
npm test
npm run typecheck
```

## EAS Build

`eas.json` includes:
- `development`: Android APK internal build
- `preview`: Android APK + iOS simulator internal build
- `production`: Android AAB + iOS device build

Build examples:

```bash
npx eas build --platform android --profile production
npx eas build --platform ios --profile production
```
