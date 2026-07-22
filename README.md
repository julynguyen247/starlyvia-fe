# Starlyvia Mobile

React Native mobile client for the Starlyvia collaborative trip-planning backend in `../starlyvia`.

## Stack

- Expo SDK 57 and React Native 0.86
- TypeScript in strict mode
- React Navigation native stack and bottom tabs
- MapLibre Native with OpenFreeMap vector styles for map place selection
- Expo Secure Store and System UI for persisted sessions and adaptive appearance
- Plain React state for screen-local server and form state

## Documentation

- [Architecture](./docs/ARCHITECTURE.md) — system boundaries, data flow, state ownership, and known backend gaps.
- [Coding conventions and linting](./docs/CODING_CONVENTIONS.md) — source patterns, module boundaries, TypeScript rules, and the current static-check workflow.
- [Mobile UI rules and theme](./docs/MOBILE_UI_RULES.md) — visual tokens, shared components, responsive behavior, interaction states, and accessibility.

## Setup

MapLibre contains native code, so this app must run in a Starlyvia development build. **Expo Go is not supported.**

### Prerequisites

- Node.js and npm
- The backend prerequisites from the [Starlyvia backend README](../starlyvia/README.md#prerequisites)
- For Android: Android Studio, an Android SDK/emulator, and `adb`
- For iOS: macOS with Xcode and CocoaPods

Automated contributors must obtain user approval before installing dependencies, as required by `AGENTS.md`. After that approval—or during manual developer setup—install the mobile dependencies:

```bash
npm install
```

Create the frontend environment file:

```bash
cp .env.example .env
```

`EXPO_PUBLIC_API_URL` must point to the API gateway from the perspective of the device running the app:

| Runtime | Gateway URL |
| --- | --- |
| Android emulator | `http://10.0.2.2:8080` |
| iOS simulator | `http://localhost:8080` |
| Physical device | `http://<development-machine-LAN-IP>:8080` |

Restart Metro after changing `.env`; Expo public environment values are loaded when the JavaScript bundle starts.

### Start the backend

Configure the provider keys in `../starlyvia/.env` as described in the [backend setup](../starlyvia/README.md#quick-start-with-docker-compose), then start the stack:

```bash
cd ../starlyvia
docker compose up --build -d
docker compose ps
cd ../starlyvia-fe
```

The API gateway should be available on port `8080`. `GEOAPIFY_API_KEY` enables place search; `OPENROUTESERVICE_API_KEY` is only required for route calculation.

## Run on an Android emulator

1. Open Android Studio and start an Android Virtual Device.
2. Confirm that the emulator is available:

   ```bash
   adb devices
   ```

3. Set the frontend URL in `.env`:

   ```env
   EXPO_PUBLIC_API_URL=http://10.0.2.2:8080
   ```

4. Build, install, and launch the development client:

   ```bash
   npm run android
   ```

`10.0.2.2` is the Android Studio emulator alias for the development machine. Do not use `localhost` for the emulator API URL.

After the development client is installed, subsequent sessions can start Metro and open Android without rebuilding native code:

```bash
npm run start -- --android
```

Run `npm run android` again after changing native dependencies, Expo plugins, or native configuration.

## Run on a physical Android phone

### Connect over the local network

This is the recommended development setup.

1. Put the phone and development machine on the same Wi-Fi network.
2. On the phone, enable **Developer options** and **USB debugging**.
3. Connect the phone by USB, accept its debugging prompt, and verify the connection:

   ```bash
   adb devices
   ```

   The device must show as `device`, not `unauthorized`.

4. Find the development machine's LAN IP. On Linux, for example:

   ```bash
   hostname -I
   ```

5. Put that address in `.env`:

   ```env
   EXPO_PUBLIC_API_URL=http://192.168.1.10:8080
   ```

6. Install the development build on the connected phone:

   ```bash
   npm run android -- --device
   ```

7. For later sessions, start Metro in LAN mode and open the installed Starlyvia app:

   ```bash
   npm run start -- --lan
   ```

Allow inbound local-network access to ports `8080` for the API gateway and `8081` for Metro if the development machine's firewall asks. A Metro tunnel can carry the JavaScript bundle, but it does not automatically expose the local backend.

### Connect through USB only

When LAN discovery is blocked, forward Metro and the API gateway through `adb`:

```bash
adb reverse tcp:8081 tcp:8081
adb reverse tcp:8080 tcp:8080
```

Use the forwarded gateway in `.env`:

```env
EXPO_PUBLIC_API_URL=http://127.0.0.1:8080
```

Then install or launch the app:

```bash
npm run android -- --device
```

The reverse rules normally need to be applied again after disconnecting or restarting the phone.

## Run on iOS

These commands require macOS and Xcode.

For the iOS simulator, use `EXPO_PUBLIC_API_URL=http://localhost:8080`, then run:

```bash
npm run ios
```

For a physical iPhone, use the development machine's LAN IP in `.env`, connect and trust the device, and run:

```bash
npm run ios -- --device
```

Xcode may request a development team for code signing. Keep the phone and development machine on the same network, then use `npm run start -- --lan` for later sessions.

## Connection troubleshooting

| Problem | Check |
| --- | --- |
| Expo Go reports an unsupported native module | Use `npm run android` or `npm run ios` to install the Starlyvia development build. |
| `adb devices` shows `unauthorized` | Unlock the phone and accept the USB debugging prompt, then reconnect it. |
| The app cannot reach the backend | Check `docker compose ps` in `../starlyvia`, the `.env` URL, the machine firewall, and that the phone shares the same network. |
| Android emulator cannot reach `localhost:8080` | Use `http://10.0.2.2:8080`. |
| A physical phone cannot reach `10.0.2.2` | Use the development machine's LAN IP or the USB reverse setup. |
| The app still uses an old API URL | Stop Metro and restart it with `npm run start -- --clear`. |
| The phone cannot load the JavaScript bundle | Use `npm run start -- --lan`, or forward port `8081` with `adb reverse`. |
| The map loads but place search fails | Confirm that the backend `place-service` is healthy and `GEOAPIFY_API_KEY` is configured in `../starlyvia/.env`. |

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

Place lookup requires `GEOAPIFY_API_KEY` on the backend. Route calculation requires `OPENROUTESERVICE_API_KEY`. Neither key belongs in this mobile project.

The map is rendered by MapLibre Native with OpenFreeMap's public vector styles and requires no client-side map key. Search, details, and nearby discovery continue through the authenticated gateway to the backend Geoapify adapter. Map and search attribution remains visible in the place picker.
