# Starlyvia Mobile

React Native mobile client for the Starlyvia collaborative trip-planning backend in `../starlyvia`.

## Stack

- Expo SDK 57 and React Native 0.86
- TypeScript in strict mode
- React Navigation native stack and bottom tabs
- `react-native-maps` for native map place selection
- Expo Secure Store and System UI for persisted sessions and adaptive appearance
- Plain React state for screen-local server and form state

## Documentation

- [Architecture](./docs/ARCHITECTURE.md) — system boundaries, data flow, state ownership, and known backend gaps.
- [Coding conventions and linting](./docs/CODING_CONVENTIONS.md) — source patterns, module boundaries, TypeScript rules, and the current static-check workflow.
- [Mobile UI rules and theme](./docs/MOBILE_UI_RULES.md) — visual tokens, shared components, responsive behavior, interaction states, and accessibility.

## Setup

Automated contributors must obtain user approval before installing dependencies, as required by `AGENTS.md`. After that approval—or during manual developer setup—run:

```bash
npm install
```

Copy the environment example:

```bash
cp .env.example .env
```

Set `EXPO_PUBLIC_API_URL` for the device running the app:

| Runtime | Gateway URL |
| --- | --- |
| Android emulator | `http://10.0.2.2:8080` |
| iOS simulator | `http://localhost:8080` |
| Physical device | `http://<development-machine-LAN-IP>:8080` |

Start the backend from `../starlyvia`, then run one of:

```bash
npm run start
npm run android
npm run ios
```

## Checks

```bash
npm run typecheck
npm run lint
```

Both commands currently run `tsc --noEmit`. See the [coding conventions and linting guide](./docs/CODING_CONVENTIONS.md#10-static-checks-and-linting) for the current scope and known tooling gaps.

## Product flow

1. Register or sign in.
2. Create a travel circle or accept an invitation.
3. Open the circle and create an itinerary.
4. Add stops by dropping a map pin, exploring nearby places, searching by name, or entering one manually.
5. With two coordinate-backed stops, calculate a drive, walk, or bicycle route.
6. Review collaboration activity in Updates.

Appearance follows the device by default. Travelers can choose System, Light, or Dark from Profile; the preference is restored securely on the next launch.

Place lookup requires `GOOGLE_PLACES_API_KEY` on the backend. Route calculation requires `OPENROUTESERVICE_API_KEY`. Neither key belongs in this mobile project.

The map uses each platform's native provider through `react-native-maps`. Expo Go supplies development map configuration. For a standalone Android build, set a restricted `GOOGLE_MAPS_ANDROID_API_KEY` in the build environment; `app.config.ts` passes it to the native Maps plugin. Do not reuse the backend Places key.
