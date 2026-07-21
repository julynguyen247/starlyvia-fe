---
name: starlyvia-write-docs
description: Create, update, or review accurate documentation for the Starlyvia React Native repository. Use for README instructions, ARCHITECTURE.md changes, architecture decision records, feature and user-flow documentation, API integration notes, setup guides, operational runbooks, or documentation audits in starlyvia-fe. Use after behavior changes when repository documentation must stay synchronized with the implementation.
---

# Starlyvia Documentation

Write documentation from verified repository evidence. Treat code, configuration, tests, and backend contracts as the source of truth.

## Workflow

1. Read `AGENTS.md`, the requested document, and any document it links to before editing.
2. Inspect the relevant implementation, `package.json`, configuration, navigation, services, types, tests, and Git diff. Do not document a library, command, route, environment variable, endpoint, or behavior from memory.
3. For API, authentication, validation, or backend behavior, invoke `$starlyvia-sync-api-contract` and verify `../starlyvia` before writing contract claims.
4. Identify the audience and select the narrowest appropriate location:
   - use `README.md` for onboarding, setup, common commands, and a short product overview;
   - use `ARCHITECTURE.md` for system boundaries, structure, data flow, state ownership, security boundaries, resilience, and intentional constraints;
   - use an existing feature or operations document for detailed behavior owned by that document;
   - create an ADR only for a durable architectural decision that needs context, alternatives, and consequences.
5. Read the applicable pattern in [references/templates.md](references/templates.md). Adapt it to the existing document instead of copying every heading.
6. Draft around verified user or developer outcomes. State prerequisites, exact commands, relative paths, expected results, failure modes, and limitations when relevant.
7. Separate these concepts explicitly:
   - current implemented behavior;
   - accepted decisions and constraints;
   - known gaps;
   - proposed future work.
8. Prefer one authoritative explanation and link to it from other documents. Remove or update contradictory statements within task scope rather than duplicating them.
9. Preserve the document's existing voice, heading hierarchy, terminology, and numbering. Keep prose concise and make examples copyable.
10. Review the complete diff and validate every technical claim against its source before handoff.

## Accuracy rules

- Never invent setup steps, environment variables, endpoints, response fields, UI states, commands, test coverage, or platform support.
- Never expose tokens, credentials, private URLs, real user data, or secret values. Use clearly marked placeholders.
- Mark optional settings as optional and explain their fallback behavior.
- Use exact names for screens, routes, services, types, scripts, and configuration keys.
- Use relative repository links and verify that referenced files and anchors exist.
- Keep code examples minimal and consistent with the repository's TypeScript and React Native patterns.
- Do not present planned behavior as shipped behavior. Use a clearly labeled proposal or evolution section.
- Add diagrams only when relationships or sequences are materially clearer than prose. Keep them maintainable in Markdown and explain uncommon notation.
- Avoid timestamps, versions, and status badges that cannot be maintained automatically unless the user requires them.

## Validation

Before completing the task:

1. Check that documented commands exist in `package.json` or the referenced tooling.
2. Check that referenced paths, symbols, routes, environment keys, and API contracts exist.
3. Re-read changed sections without relying on unstated code context.
4. Search the repository for stale statements or terminology made contradictory by the change.
5. Run relevant repository checks when documentation includes or accompanies code/configuration changes. For documentation-only edits, do not claim application checks were necessary or passed unless run.
6. Report changed documents, the evidence used, checks performed, and any claims that could not be verified.
