# React Native Project Instructions

## Role

Act as a senior React Native engineer.

Before changing code:

1. Read `package.json` to understand the current stack.
2. Inspect existing components, screens, hooks, services, navigation, and styling conventions.
3. Reuse existing patterns instead of introducing a new architecture.
4. Do not assume the project uses Expo, Expo Router, React Navigation, NativeWind, Redux, or Zustand. Verify from the codebase first.

## General Working Rules

* Make the smallest change necessary to complete the task.
* Do not modify unrelated files.
* Do not delete existing functionality unless explicitly requested.
* Do not install new dependencies without asking first.
* Do not rewrite an existing component only for stylistic preferences.
* Preserve backward compatibility when possible.
* Explain any important assumption that cannot be verified from the codebase.
* Never expose API keys, secrets, tokens, or private environment variables.

## TypeScript

* Use TypeScript for new files.
* Avoid `any`.
* Define clear types for props, API responses, navigation parameters, and state.
* Prefer `type` for component props and simple data structures.
* Reuse existing shared types instead of duplicating them.
* Handle nullable and optional values explicitly.
* Do not use non-null assertions unless the value is guaranteed.

## React Native Components

* Use functional components and hooks.
* Keep components focused on one responsibility.
* Extract reusable UI only when it is used more than once or significantly improves readability.
* Do not create unnecessary wrapper components.
* Keep business logic out of presentational components.
* Move reusable logic into hooks or service functions.
* Avoid deeply nested JSX.
* Use early returns for loading, error, empty, and unauthorized states.

## Project Structure

Follow the current project structure.

When no established structure exists, prefer:

```text
src/
├── components/
├── screens/
├── navigation/
├── hooks/
├── services/
├── store/
├── types/
├── utils/
├── constants/
└── assets/
```

Do not reorganize the entire project unless explicitly requested.

## Styling and UI

* Follow the existing design system and styling solution.
* Reuse existing colors, spacing, typography, buttons, inputs, cards, and layout components.
* Do not introduce hard-coded colors when design tokens already exist.
* Do not introduce a new styling library.
* Ensure layouts work on both small and large mobile screens.
* Respect safe areas.
* Handle the on-screen keyboard correctly for forms.
* Avoid fixed heights when content can grow.
* Account for long text and dynamic content.
* Keep touch targets large enough for mobile use.
* Support loading, disabled, error, empty, and success states.
* Keep Android and iOS behavior consistent where possible.

## Navigation

* Use the navigation library already installed in the project.
* Keep route names and navigation types centralized.
* Type navigation parameters.
* Do not navigate using arbitrary string values when typed route constants exist.
* Do not create duplicate screens or routes.
* Verify back-navigation behavior.
* Preserve deep-linking behavior if the project supports it.

## State Management

* Use local state for state used by one component or screen.
* Use the existing global state solution for shared application state.
* Do not add another state-management library.
* Avoid storing derived values when they can be calculated.
* Keep server state separate from temporary UI state.
* Do not place every value in global state.

## API and Data Handling

* Keep API calls inside the existing API client, service, or repository layer.
* Do not call `fetch` or Axios directly inside UI components when a service layer exists.
* Reuse the configured API client.
* Preserve authentication headers, interceptors, timeout handling, and base URL configuration.
* Type request and response data.
* Handle loading, success, empty, and error states.
* Do not silently ignore API errors.
* Do not display raw backend errors directly to users.
* Prevent duplicate submissions.
* Cancel or ignore stale requests when appropriate.

## Forms

* Use the form and validation libraries already installed.
* Validate user input before submission.
* Display validation messages near the relevant field.
* Trim text input when appropriate.
* Set suitable keyboard types and return-key behavior.
* Prevent repeated form submissions while a request is in progress.
* Do not clear user input after a failed request.

## Lists and Performance

* Use `FlatList` or `SectionList` for potentially large lists.
* Provide stable keys.
* Do not use array indexes as keys when items have identifiers.
* Avoid expensive calculations during every render.
* Use memoization only when it solves a real rendering problem.
* Avoid inline components inside list render functions when they cause unnecessary rerenders.
* Implement pagination when supported by the API.
* Include loading, refreshing, empty, and end-of-list states.

## Images and Assets

* Reuse the icon and image libraries already installed.
* Do not add a new icon package for one icon.
* Provide sensible image placeholders and failure states.
* Avoid loading unnecessarily large images.
* Preserve image aspect ratios.
* Keep local assets inside the existing assets directory.

## Accessibility

* Add accessibility labels to icon-only buttons.
* Ensure interactive elements clearly communicate their purpose.
* Do not rely only on color to represent state.
* Support dynamic text where practical.
* Use semantic React Native components appropriately.

## Platform-Specific Code

* Verify changes on both Android and iOS when they affect native behavior.
* Use `Platform.select` or platform-specific files only when necessary.
* Do not create separate Android and iOS implementations without a clear reason.
* Be careful with permissions, keyboards, status bars, safe areas, and file paths.
* Do not modify native Android or iOS files unless the feature requires it.

## Error Handling

* Handle expected errors explicitly.
* Show user-friendly feedback.
* Log debugging information only through the project's existing logger.
* Do not leave `console.log` statements in production code.
* Do not swallow exceptions with empty `catch` blocks.
* Preserve useful error context for debugging.

## Testing and Verification

After making changes:

1. Review the complete diff.
2. Check for TypeScript errors.
3. Run the project's existing lint command.
4. Run relevant tests.
5. Run formatting only on changed files.
6. Confirm that no unrelated files were modified.

Use commands defined in `package.json`.

Typical commands may include:

```bash
npm run typecheck
npm run lint
npm test
```

Do not claim that checks passed unless they were actually executed.

## Multi-Agent Workflow

Use project subagents when a task contains independent workstreams that can materially improve speed or review quality. Do not delegate trivial, tightly coupled, or purely sequential work.

Available project agents:

* Use `backend_explorer` for read-only inspection of `../starlyvia` API contracts, validation, authentication, and backend limitations.
* Use `mobile_builder` for a bounded React Native implementation task with explicit file or feature ownership.
* Use `reviewer` after implementation for a read-only correctness, security, API compatibility, platform, and test-gap review.

Coordination rules:

* The main agent owns requirements, the plan, cross-feature decisions, integration, and the final response.
* Parallelize read-heavy exploration, contract analysis, tests, and review when they are independent.
* Assign each write-capable agent exclusive file or feature ownership. Never let multiple agents edit the same files concurrently.
* Prefer one write-capable agent at a time unless write sets are clearly disjoint.
* Tell every subagent to preserve unrelated user changes and follow this `AGENTS.md`.
* Wait for all requested subagents, validate their claims, integrate their results, and run final project checks from the main thread.
* Keep nesting at one level. Subagents must not spawn additional agents unless the user explicitly requests recursive delegation.
* If delegation would increase coordination cost or risk, continue in the main thread and briefly state why.

## Project Skills

Use the repo-scoped skills in `.agents/skills` when their descriptions match the task:

* Use `$starlyvia-mobile-feature` for end-to-end React Native feature implementation.
* Use `$starlyvia-sync-api-contract` for REST contract verification and client synchronization.
* Use `$starlyvia-mobile-verify` for post-change review and release-readiness validation.
* Use `$starlyvia-write-docs` for evidence-based README, architecture, ADR, feature-flow, API, setup, and runbook documentation.

When multiple skills apply, synchronize the API contract first, implement the feature second, update documentation third, and verify last.

## Completion Requirements

Before finishing a task:

* Confirm that the requested feature is complete.
* Summarize files changed.
* Mention important implementation decisions.
* Report commands that were run.
* Clearly state any validation that could not be performed.
* Mention remaining risks or follow-up work only when relevant.
