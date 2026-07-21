---
name: starlyvia-mobile-feature
description: Implement or modify an end-to-end feature in the Starlyvia Expo React Native client. Use for new screens, navigation flows, forms, authenticated interactions, reusable mobile UI, or API-backed product behavior in starlyvia-fe. Do not use for a contract-only audit or a review-only request.
---

# Starlyvia Mobile Feature

Build the requested behavior within the existing mobile architecture and backend capabilities.

## Workflow

1. Read `AGENTS.md`, `package.json`, and the relevant sections of `ARCHITECTURE.md` completely before editing.
2. Inspect the existing route types, navigator, screen, components, service, API types, theme tokens, and tests involved in the flow.
3. If the feature reads or writes server data, invoke `$starlyvia-sync-api-contract` before deciding request or response shapes.
4. Define the smallest coherent change and identify file ownership before delegating. Use `backend_explorer` for independent backend inspection, `mobile_builder` for an isolated implementation, and `reviewer` after substantial changes when multi-agent work is useful.
5. Implement from the data boundary inward:
   - update shared API types only from verified backend contracts;
   - add endpoint knowledge to an existing domain service;
   - keep server state near its consuming screen unless it is truly global;
   - centralize typed route parameters before adding navigation calls;
   - reuse presentational components and tokens before creating new UI;
   - keep business logic out of presentational components.
6. Cover loading, refreshing, empty, failure, disabled, success, stale-request, and duplicate-submission behavior as applicable.
7. Check safe areas, keyboard behavior, long text, touch targets, icon labels, dynamic content, Android back behavior, and iOS gestures.
8. Do not install dependencies, add a new state or styling library, change native projects, or modify `../starlyvia` without explicit approval.
9. Run the package-defined checks that are available. Never claim a command passed if it could not run.

## Contract boundaries

- Send traffic only through the configured API gateway.
- Never send trusted internal `X-User-*` headers from the client.
- Keep JWTs in the existing secure session layer.
- Keep provider and signing secrets out of Expo public environment variables.
- Do not invent endpoints to compensate for backend gaps; surface the gap and design a usable supported fallback.

## Completion

Return the implemented user behavior, important architectural decisions, changed files, exact validation commands and results, and only relevant residual risks.
