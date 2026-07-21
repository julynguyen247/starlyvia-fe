# Starlyvia Documentation Patterns

Use only the headings needed for the target document. Preserve an existing document's structure when updating it.

## README section

````markdown
## <Task or capability>

<What this enables and who needs it.>

### Prerequisites

- <Verified prerequisite>

### Run

```bash
<Command from package.json or verified tooling>
```

<Expected result and one or two common failure notes.>
````

## Architecture section

```markdown
## <Subsystem or concern>

### Responsibility

<What this part owns and deliberately does not own.>

### Components and flow

1. <Entry point>
2. <Processing or state transition>
3. <Result, persistence, or external boundary>

### Constraints and failure behavior

- <Verified constraint>
- <How failures, retries, or unavailable dependencies behave>

### Evolution

<Clearly labeled future direction, only when relevant.>
```

## Architecture decision record

Use the repository's existing ADR convention. If none exists and the user requests an ADR, use:

```markdown
# ADR <number>: <Decision title>

## Status

Proposed | Accepted | Superseded

## Context

<Problem, forces, and verified constraints.>

## Decision

<The chosen approach and its boundary.>

## Alternatives considered

- **<Alternative>:** <Why it was not selected.>

## Consequences

- <Positive consequence>
- <Cost, tradeoff, or follow-up obligation>
```

## Feature or user-flow document

```markdown
# <Feature>

## User outcome

<What the user can accomplish.>

## Entry conditions

- <Authentication, navigation, data, or platform requirement>

## Flow

1. <User action>
2. <Application response>
3. <Successful outcome>

## States and failures

| State | User experience | Recovery |
| --- | --- | --- |
| Loading | <Observed UI> | <Automatic or user action> |
| Empty | <Observed UI> | <Available next action> |
| Error | <Observed UI> | <Retry or fallback> |

## Implementation map

- Screen or route: `<verified path or symbol>`
- Service or data boundary: `<verified path or symbol>`
- Shared types: `<verified path or symbol>`
```

## API integration note

```markdown
## <Operation name>

- Method and path: `<METHOD /verified/path>`
- Authentication: `<verified requirement>`
- Client service: `<verified path or symbol>`

### Request

<Parameters, body fields, optionality, and validation that matter to the client.>

### Response

<Shape, nullability, pagination, and status behavior that matter to the client.>

### Errors and client behavior

| Condition | Backend result | Mobile behavior |
| --- | --- | --- |
| <Verified condition> | <Status or error shape> | <Handled state> |

### Known gaps

<Unsupported behavior or contract uncertainty, clearly distinguished from implemented behavior.>
```
