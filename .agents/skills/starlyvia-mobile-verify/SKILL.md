---
name: starlyvia-mobile-verify
description: Audit and verify Starlyvia mobile changes for release readiness. Use after implementation, before handoff, or when diagnosing TypeScript, navigation, API, authentication, accessibility, Android/iOS, Expo configuration, visual-state, or test-coverage problems. Use for review and validation rather than feature implementation.
---

# Starlyvia Mobile Verification

Validate changed behavior from contracts through native user experience without silently fixing unrelated code.

## Establish scope

1. Read `AGENTS.md`, `package.json`, `ARCHITECTURE.md`, and the changed or user-identified files.
2. Preserve unrelated work. If the directory is not a Git worktree, state that diff-based scope validation is unavailable and inspect the explicit task files.
3. For API-backed changes, invoke `$starlyvia-sync-api-contract` before accepting integration behavior.

## Run static gates

Use commands defined in `package.json`:

```bash
npm run typecheck
npm run lint
```

- Do not install missing dependencies without explicit approval.
- Run formatting only on changed files when a project formatter exists.
- Validate `package.json`, `app.json`, and `tsconfig.json` after configuration changes.
- Use Expo diagnostics only when the command is already available or installation is approved.

## Review behavior

Check the affected flow for:

- secure session restoration, `401` handling, logout, and absence of leaked tokens or secrets;
- exact gateway paths, methods, query encoding, request bodies, response types, nullability, and enums;
- typed route parameters, parent navigation, Android back behavior, iOS gestures, and modal dismissal;
- loading, refresh, pagination, empty, error, offline, disabled, optimistic rollback, and duplicate-submission states;
- stale asynchronous results and state updates after unmount;
- safe areas, keyboard avoidance, small screens, long text, dynamic type, stable list keys, and accessible icon buttons;
- API base URLs for Android emulator, iOS simulator, and physical devices;
- graceful behavior when Google Places or OpenRouteService credentials are unavailable.

Use `$screenshot` for visual evidence when a runnable UI is available. Use `$playwright` only for the Expo web surface; do not treat web results as native Android or iOS validation.

## Report

Lead with actionable findings ordered by severity and include exact file references, impact, and remediation. If no findings remain, say so. Then list commands actually run, their outcomes, validation that could not be performed, and residual device or backend risks.
