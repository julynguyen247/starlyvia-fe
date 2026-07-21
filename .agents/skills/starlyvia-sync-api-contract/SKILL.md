---
name: starlyvia-sync-api-contract
description: Verify and synchronize Starlyvia mobile API types and service calls against the Java backend. Use when adding, changing, reviewing, or debugging REST integrations, DTO mappings, authentication behavior, pagination, enums, dates, routes, notifications, groups, plans, places, or backend-client mismatches.
---

# Starlyvia API Contract Sync

Treat `../starlyvia` source code as the contract authority and keep the mobile transport layer exact.

## Inspect the contract

1. Read the applicable `AGENTS.md` in both repositories and the mobile `ARCHITECTURE.md`.
2. Trace the gateway route and authentication filter before inspecting the target service.
3. Read the backend controller, request and response DTOs, validation annotations, enums, service mapping, exception handling, and focused tests.
4. Read the matching mobile types, domain service, consuming screens, and session behavior.
5. Record a compact contract matrix with:
   - HTTP method and complete gateway path;
   - public or bearer-authenticated access;
   - path, query, header, and body fields;
   - required, optional, nullable, enum, UUID, date, and time constraints;
   - success status and response shape;
   - pagination, ordering, empty behavior, and expected failure statuses.

## Synchronize the client

- Map Java UUIDs, dates, times, records, lists, and Spring `Page<T>` explicitly in `src/types/api.ts`.
- Keep endpoint construction and HTTP methods in `src/services`; do not call `fetch` from screens.
- Send only fields accepted by the backend and omit absent optional values rather than fabricating data.
- Preserve exact enum strings and backend ordering semantics.
- Normalize errors in the API client; never display raw backend exceptions.
- Keep identity headers gateway-owned and secrets backend-owned.
- Update every affected caller when a shared type changes.

## Handle gaps

Do not infer an endpoint from a service method or database table. If no gateway route and controller endpoint exist, document the backend gap and keep the mobile UX within supported behavior. Do not modify the backend unless the user explicitly requests a coordinated backend change.

## Verify

Search all mobile references to changed types and services. Run package-defined type and lint checks when dependencies are present. Report the verified matrix, files synchronized, commands run, failures, and unresolved backend requirements.
