# Starlyvia Mobile Coding Conventions

## 1. Purpose

These conventions describe the patterns currently used by the Starlyvia React Native client. They apply to application code in `App.tsx` and `src/`. Follow the existing structure and make the smallest change that satisfies the requirement.

For visual decisions, use [MOBILE_UI_RULES.md](./MOBILE_UI_RULES.md). For system boundaries and state ownership, use [ARCHITECTURE.md](../ARCHITECTURE.md).

## 2. Current stack and constraints

- The app is Expo-managed React Native with TypeScript.
- Navigation uses typed React Navigation native stacks and bottom tabs; it does not use Expo Router.
- Styling uses React Native `StyleSheet` and tokens from `src/theme/`; it does not use a CSS-in-JS or utility-class library.
- `AuthContext` is the only global application state. Screens own their temporary form state and route-specific server state.
- Network access belongs in `src/services/`. UI code consumes typed service functions rather than calling `fetch` directly.
- Do not add a dependency, state library, styling system, formatter, or lint tool without approval.

## 3. Files, names, and exports

Follow the responsibility-based source layout:

| Location | Responsibility |
| --- | --- |
| `src/components/` | Reusable presentational UI |
| `src/context/` | Cross-application React context |
| `src/navigation/` | Navigator composition |
| `src/screens/` | Route-level UI and route-specific state |
| `src/services/` | HTTP transport and domain endpoint modules |
| `src/theme/` | Semantic visual tokens and navigation theme |
| `src/types/` | Shared API and navigation contracts |
| `src/utils/` | Framework-independent formatting, validation, and ID helpers |

Use the established naming patterns:

- PascalCase file names and named exports for components, screens, and providers, such as `AppButton.tsx` and `CreateGroupScreen`.
- camelCase for variables, functions, hooks, and service objects, such as `getErrorMessage`, `useAuth`, and `groupService`.
- A `Screen` suffix for route components, a `Service` suffix for domain service objects, and a `Props` type for component-local props.
- `App.tsx` remains the default application export; reusable modules use named exports.

Keep a component in its current file while it has one responsibility. Extract shared UI when it is reused or when doing so materially simplifies a screen; do not create pass-through wrappers.

### Source formatting

The current code consistently uses two-space indentation, single quotes, semicolons, and trailing commas in multiline constructs. Preserve that style in touched code. These are reviewed conventions, not formatter-enforced rules; the repository has no configured formatter.

## 4. TypeScript

- Keep strict typing compatible with `tsconfig.json`, including `strict` and `noUncheckedIndexedAccess`.
- Use `type` for props, request and response shapes, navigation parameter lists, and unions.
- Use `import type` when an import is used only by the type system.
- Do not use `any`. Accept uncertain caught or external values as `unknown`, then narrow them.
- Model nullable and optional values explicitly. Do not use a non-null assertion unless the surrounding invariant makes it unavoidable and verifiable.
- Reuse the contracts in `src/types/api.ts` and `src/types/navigation.ts`; do not recreate local versions of shared API or route types.
- Use string literal unions for closed backend or UI value sets, following `GroupType`, `PlanStatus`, and `TravelMode`.
- Type indexed mappings with `Record`, as used for button variants and navigation icons.

## 5. Imports and module boundaries

Group external imports before project-relative imports, with a blank line between the groups. Keep type-only imports explicit. Imports are currently relative because no source path aliases are configured.

Respect these dependency boundaries:

- Screens may import components, services, theme tokens, shared types, and utilities.
- Presentational components must not import services or navigation screens.
- Domain services import the shared API client and API types; they must not import React components or screens.
- Navigation imports route types from `src/types/navigation.ts` and screen components from `src/screens/`.
- Add endpoint paths, authentication behavior, serialization, and query construction to the service layer, not to JSX.

## 6. React Native components and state

- Use functional components and hooks.
- Keep screen-local data, loading, refreshing, error, and form state in the screen that owns the flow.
- Put state in context only when it is genuinely application-wide. The current example is the persisted identity session in `AuthContext`.
- Calculate derived values during render unless caching solves a measured rendering problem.
- Use early returns for full-screen loading and unrecoverable initial-error states.
- Use `FlatList` or `SectionList` for potentially large collections, with stable domain identifiers as keys.
- Ignore or cancel stale asynchronous work when a newer request or unmount can make its result invalid. The generation tracking in `NotificationsScreen` and place search flow are current examples.

For promise-returning event work, keep the async function readable and deliberately discard the returned promise at the event boundary:

```tsx
<AppButton label="Create travel circle" onPress={() => void submit()} />
```

## 7. Services, errors, and forms

- Use the configured `request<T>` client in `src/services/apiClient.ts` for REST calls.
- Keep domain endpoints grouped in their existing service object (`authService`, `groupService`, `planService`, `placeService`, or `notificationService`).
- Type request inputs and responses. Extend shared API types when the contract is shared across modules.
- Convert caught values to user-safe copy with `getErrorMessage`; never render raw backend exception text.
- Use `try`/`catch`/`finally` so failures are visible and submission/loading flags are always restored.
- Disable or lock mutating controls while a request is active to prevent duplicate submissions.
- When applying an optimistic change, keep enough prior state to roll it back on failure.
- Validate required input before submission, trim user-entered strings where appropriate, show field-specific errors near the input, and preserve input after failure.
- The current forms use local React state and helpers from `src/utils/validation.ts`; no form or schema-validation library is configured.
- Do not add production `console` calls. There is no application logger abstraction currently, so logging changes need an explicit project decision rather than an invented API.

## 8. Navigation

- Add route names and parameters to the appropriate list in `src/types/navigation.ts` before navigating to a new screen.
- Type screen props with `AuthScreenProps`, `RootScreenProps`, or `TabScreenProps` and the exact route name.
- Register each screen once in `RootNavigator.tsx`; do not navigate with untyped parameter objects or duplicate route strings in a parallel navigation model.
- Preserve native back behavior. Modal routes need an obvious dismissal path and must continue to support Android back and iOS dismissal behavior.

## 9. Styling, responsiveness, and accessibility

- Define component styles with `StyleSheet.create` at the bottom of the module.
- Reserve inline style objects for values that are calculated at render time, such as safe-area padding or component dimensions.
- Import semantic values from `src/theme/tokens.ts`; do not add screen-level color literals when an existing role applies.
- Reuse `Screen`, `AppButton`, `AppInput`, `StateView`, cards, chips, avatars, and other shared components before creating a local substitute.
- Prefer theme spacing and radius values. Literal geometry is acceptable for intrinsic sizes such as icon wells or decorative shapes.
- Avoid fixed content heights. Account for safe areas, the keyboard, long content, narrow screens, and dynamic text.
- Give icon-only and otherwise ambiguous controls an accessibility label and role. Expose disabled, selected, busy, or other relevant state and do not communicate meaning with color alone.

The complete visual and interaction rules live in [MOBILE_UI_RULES.md](./MOBILE_UI_RULES.md).

## 10. Static checks and linting

The currently implemented checks are:

```bash
npm run typecheck
npm run lint
```

Both scripts currently execute `tsc --noEmit`. This validates the TypeScript program without producing build output. The compiler uses Expo's base configuration plus `strict` and `noUncheckedIndexedAccess` from `tsconfig.json`.

Current limitations:

- There is no ESLint configuration or ESLint dependency.
- There is no Prettier or other formatter configuration.
- There is no automated test script in `package.json`.
- `npm run lint` is therefore a compatibility command for the TypeScript check; it does not enforce formatting or additional React, hooks, accessibility, or style rules.

Until dedicated tools are approved and configured, review changed code against this guide and [MOBILE_UI_RULES.md](./MOBILE_UI_RULES.md), then run both existing commands. Do not claim formatting, unit tests, or native platform checks passed unless they were actually performed.

## 11. Change checklist

Before handing off an implementation:

- [ ] The change stays within the existing source boundaries and avoids unrelated rewrites.
- [ ] Shared API, navigation, and prop types are explicit; no `any` or unjustified non-null assertion was added.
- [ ] Network work remains in services and user-visible errors are safe.
- [ ] Loading, empty, error, disabled, submission, and success states are handled where applicable.
- [ ] Theme tokens and shared components are reused, and the layout accounts for accessibility and both native platforms.
- [ ] `npm run typecheck` was run.
- [ ] `npm run lint` was run with the understanding that it is currently the same TypeScript check.
- [ ] Relevant tests and native smoke checks were run if available; any missing validation is reported.
