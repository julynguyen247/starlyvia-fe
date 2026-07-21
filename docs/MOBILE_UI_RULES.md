# Starlyvia Mobile UI Rules and Theme

**Status:** Accepted consistency guide. The light theme, semantic tokens, navigation theme, and shared UI primitives are implemented in `src/theme/` and `src/components/`. Guidance for states or motion not yet used by a screen defines the requirement for future implementation; it does not claim that behavior is already shipped.

## 1. Purpose

This document defines how Starlyvia should look, feel, and behave across Android and iOS. It extends the existing visual language rather than replacing it: warm neutral backgrounds, deep indigo structure, coral moments of delight, rounded surfaces, bold typography, and travel-inspired details.

The desired personality is **playful, optimistic, social, and capable**. Starlyvia should feel like planning an adventure with friends, not completing an administrative form. Playfulness must never reduce readability, accessibility, trust, or task completion.

## 2. Product personality

Use these traits to resolve visual and content decisions:

| Trait | Express it through | Avoid |
| --- | --- | --- |
| Playful | Rounded shapes, cheerful color accents, light travel motifs, warm copy, small moments of motion | Random decoration, novelty controls, childish language |
| Social | Avatars, group context, inclusive copy, visible collaboration states | Interfaces that feel isolated or transactional |
| Adventurous | Destination imagery, route and orbit motifs, energetic hero areas | Making every section compete for attention |
| Trustworthy | Strong hierarchy, predictable controls, explicit states, restrained semantic colors | Hiding failures, ambiguous actions, excessive animation |
| Calm | Warm canvas, generous spacing, limited emphasis per screen | Dense layouts, many saturated colors at once |

The simplest test is: **would this make trip planning feel lighter without making the next action less obvious?**

## 3. Core visual principles

### 3.1 One playful moment per screen

Each screen may have one dominant expressive element: a colorful hero, a friendly empty state, a route motif, a celebration, or a distinctive card. Supporting content should remain calm. Do not decorate every component.

### 3.2 Structure first, delight second

The page title, primary action, current state, and navigation must be understandable before decorative elements are noticed. Visual delight supports hierarchy; it never replaces hierarchy.

### 3.3 Rounded, not soft everywhere

Rounded cards and controls are part of the brand. Use the established radius scale. Avoid turning every label or container into a pill; reserve pills for compact filters, statuses, and short actions.

### 3.4 Color has a job

Indigo identifies the brand and primary actions. Coral provides small energetic accents. Green, amber, and red communicate semantic states. Do not use semantic colors as general decoration.

### 3.5 Native behavior wins

The visual system must preserve familiar native navigation, gestures, safe areas, keyboard behavior, scrolling, and touch feedback on both platforms.

## 4. Theme foundations

The current source of truth is `src/theme/tokens.ts`. Components must consume semantic tokens from that module rather than introducing isolated visual constants.

### 4.1 Color roles

The initial product theme is light-only.

| Token | Value | Intended use |
| --- | --- | --- |
| `background` | `#F7F5F2` | Warm app canvas |
| `surface` | `#FFFFFF` | Cards, inputs, navigation surfaces |
| `surfaceMuted` | `#EEEAE5` | Subtle grouped regions and neutral chips |
| `text` | `#17203B` | Primary copy and important icons |
| `textMuted` | `#62687A` | Supporting copy and secondary icons with AA contrast on the app canvas |
| `primary` | `#4F46E5` | Primary actions, selected controls, active navigation |
| `primaryDark` | `#312E81` | Expressive heroes and strong brand surfaces |
| `primarySoft` | `#E9E7FF` | Selected backgrounds and quiet brand emphasis |
| `accent` | `#F97360` | Decorative highlights, badges, small moments of energy |
| `accentSoft` | `#FFEAE5` | Quiet accent backgrounds |
| `success` / `successSoft` | `#16856B` / `#DCF5EC` | Confirmed and completed states |
| `successText` | `#11745E` | Readable success text on `successSoft` |
| `warning` / `warningSoft` | `#A96614` / `#FFF2D8` | Caution and recoverable service issues |
| `warningText` | `#945A0D` | Readable warning text on `warningSoft` |
| `danger` / `dangerSoft` | `#C4424F` / `#FFE5E8` | Destructive actions and errors |
| `dangerText` | `#AE3542` | Readable danger text on `dangerSoft` |
| `border` | `#E1DDD7` | Dividers and surface boundaries |
| `primaryBorder` | `#C9C5FF` | Selected or unread brand-tinted boundaries |
| `heroText` | `#FFFFFF` | Primary content on dark brand surfaces |
| `heroTextMuted` | `#E0E7FF` | Body copy on dark brand surfaces |
| `heroTextSubtle` | `#C7D2FE` | Metadata and eyebrow copy on dark brand surfaces |
| `heroDecoration` / `heroIconSurface` | translucent white | Decorative orbit and icon-well surfaces on heroes |
| `white` / `black` | `#FFFFFF` / `#000000` | Low-level neutral endpoints; `white` currently supports foregrounds on primary and selected surfaces, while `black` is reserved |
| `overlay` | `rgba(23, 32, 59, 0.48)` | Modal or scrim treatment |

Rules:

- Use `primary` for the main action on a screen. A screen should normally have only one visually dominant primary action.
- Use `accent` in small areas such as an unread dot, decorative star, or celebratory detail. It is not a default text or button color.
- Pair semantic colors with an icon, label, or message; never communicate status with color alone.
- Use `text` and `textMuted` for readable content. White text belongs only on a background proven to provide sufficient contrast.
- Add new colors as named semantic tokens, not as one-off hex values in screen styles.
- Hero-on-dark text, icon surfaces, decoration, and selected borders use their dedicated semantic tokens rather than screen-level literals.
- Prefer a semantic foreground role over `white` or `black`. Use those low-level primitives only when the component's contrast relationship is explicit; introduce a named semantic role when the meaning is shared.
- Do not infer a dark theme by inverting these values. A future dark theme must define each semantic role explicitly and be tested independently.
- `app.json` cannot import TypeScript tokens. Keep its splash `backgroundColor` synchronized with `colors.background` and its Android adaptive-icon `backgroundColor` synchronized with `colors.primaryDark` when either role changes.

### 4.2 Spacing

Use the existing 4-point-based scale:

| Token | Value | Typical role |
| --- | ---: | --- |
| `xs` | 4 | Tight icon or text relationship |
| `sm` | 8 | Control internals, compact stacks |
| `md` | 12 | Related content and compact padding |
| `lg` | 16 | Default screen gap and card padding |
| `xl` | 24 | Section separation and spacious cards |
| `xxl` | 32 | Major content separation |
| `xxxl` | 48 | Large breathing room or empty-state spacing |

Rules:

- Prefer token values for gaps, margin, and padding.
- Use `lg` horizontal padding as the default screen gutter.
- Group related elements more tightly than unrelated sections.
- Avoid arbitrary spacing unless geometry requires it, such as icon dimensions or an orbit illustration.
- Content must reflow on small screens; spacing cannot depend on a fixed screen width.

### 4.3 Shape

| Token | Value | Intended use |
| --- | ---: | --- |
| `sm` | 10 | Small icon wells and note containers |
| `md` | 16 | Buttons, inputs, compact cards |
| `lg` | 22 | Feature cards, heroes, large panels |
| `pill` | 999 | Chips, filters, compact rounded actions |

Use rounded geometry consistently, but keep nesting logical: a child radius should usually be smaller than its parent radius. Dashed borders are reserved for empty or add-new regions.

### 4.4 Typography

The current app uses the platform system font; no custom font dependency is installed. Preserve native rendering and the established type scale.

| Token | Size | Usage |
| --- | ---: | --- |
| `hero` | 34 | Auth or campaign-level headline |
| `title` | 26 | Screen and prominent card titles |
| `heading` | 20 | Section titles and card headings |
| `body` | 16 | Main reading and control text |
| `small` | 14 | Supporting copy and compact controls |
| `caption` | 12 | Metadata, timestamps, eyebrow labels |

Rules:

- Use weight and size to create hierarchy; do not rely on color alone.
- Bold weights (`800`–`900`) belong to short titles and moments of enthusiasm, not paragraphs.
- Body copy should normally use a line height around 1.4–1.5 times its font size.
- Avoid long uppercase strings. Uppercase is suitable only for brief eyebrow labels with added letter spacing.
- Allow text to wrap. Use truncation only where layout or navigation context makes the full value available elsewhere.
- Test large accessibility text sizes; critical actions and meaning must remain visible.

### 4.5 Elevation and borders

- Default cards use a one-pixel `border` plus the shared low-elevation shadow when separation is needed.
- Prefer borders over heavy shadows. Shadows should stay subtle and use the shared `shadows` token.
- Do not stack several elevated surfaces inside one another.
- Pressed state should be visible through opacity or a very small scale change, never a large jump.

### 4.6 Icons and imagery

- Reuse Ionicons from `@expo/vector-icons`; do not add another icon package for isolated needs.
- Use outline icons for inactive or neutral states and filled icons for active navigation or confirmed selection.
- Icon-only controls require an accessibility label, button role, and a touch area of at least 44 by 44 points.
- Travel motifs may include stars, orbits, route lines, pins, luggage, and small geometric confetti. They remain decorative and must not look interactive.
- Preserve image aspect ratio. The current `Avatar` falls back to initials when no URI is supplied; falling back after an invalid or unreachable URI is a known gap and a requirement for future image-backed UI.

## 5. Layout rules

### Screen shell

- Reuse `Screen` for standard scroll, safe-area, refresh, bottom-inset, and keyboard behavior.
- Primary content uses `spacing.lg` screen gutters and a vertical rhythm based on theme spacing.
- Avoid fixed content heights. Cards expand for long names, translated copy, and dynamic type.
- Keep the primary action reachable, but do not obscure content with floating controls.
- Full-screen lists should use `FlatList` or `SectionList` rather than rendering a large collection inside `ScrollView`.

### Hierarchy

A typical screen follows this order:

1. Navigation context or safe-area header.
2. Clear title and one-line purpose.
3. Primary content or task.
4. Supporting sections.
5. Secondary or destructive actions.

The order may change for a focused form or modal, but the primary task must remain obvious.

### Responsive behavior

- Design for narrow phones first and allow content to grow on larger devices.
- Rows containing user content must wrap, truncate intentionally, or stack when space is constrained.
- Two-column form rows must fall back to one column when fields would become cramped.
- Respect top and bottom safe areas, Android system navigation, iOS home indicators, and landscape insets.
- Avoid placing essential content beneath decorative absolute-positioned shapes.

## 6. Component rules

### Buttons

Reuse `AppButton`.

- **Primary:** the main forward action, such as creating a group or saving a stop.
- **Secondary:** a positive alternative with quieter emphasis.
- **Ghost:** low-emphasis or navigation-adjacent action.
- **Danger:** destructive action only, ideally after clear confirmation when consequences are material.
- Show an in-button loader during submission, disable repeated taps, and retain the label's meaning through an accessible loading description.
- Standard buttons have a minimum height of 52; compact buttons remain at least 42 high and need sufficient surrounding touch space.
- Button copy starts with a clear verb: “Create group,” “Add place,” or “Try again.”

### Inputs and forms

Reuse `AppInput` and existing form patterns.

- Labels remain visible; placeholders are examples, not replacements for labels.
- Validation appears near the affected field and uses helpful language.
- Set suitable keyboard type, capitalization, autocomplete, return key, and secure entry behavior.
- Preserve user input after failure.
- Keep the submit action disabled while a request is active.
- Use keyboard avoidance and `keyboardShouldPersistTaps="handled"` where search results or controls appear above the keyboard.
- Never display raw backend errors or secret values.

### Cards

- Cards represent one clear entity or decision: a group, plan, member, notification, or route summary.
- A tappable card should make the full expected region pressable and expose a button role and meaningful accessibility label when its visible copy is insufficient.
- Use at most one leading visual anchor and one trailing affordance.
- Keep metadata subordinate to the title.
- Reserve dark brand cards for high-value hero content, not routine list rows.

### Chips and status

- Reuse `Chip` for filters, compact choices, and statuses.
- Selected chips use primary emphasis and remain distinguishable without color through state, label, or icon.
- Status colors must reflect meaning consistently; do not recolor a warning as a decorative accent.
- Keep labels short and allow chip rows to wrap.

### Avatars

- Reuse `Avatar` so sizing and the missing-URI initials fallback remain consistent. Do not claim it handles remote image load failure until that behavior is implemented.
- Use grouped avatars sparingly and preserve readable member counts.
- Never make profile imagery required to identify a member; show a name or identifier as text.

### Navigation

- Preserve the typed React Navigation route structure and native stack behavior.
- Bottom tabs remain the four stable primary destinations: Home, Groups, Notifications, and Profile.
- Use filled tab icons for the focused route and outline icons otherwise.
- Modals must have an obvious dismissal path and preserve Android back behavior and iOS dismissal gestures where appropriate.
- Badge color may draw attention, but the route label and icon must still make sense without it.

## 7. Playful patterns

Use playfulness purposefully:

- **Hero moments:** deep indigo surface, one friendly headline, a subtle travel motif, and one primary next step.
- **Empty states:** a simple icon or illustration, an encouraging title, a short explanation, and an optional recovery or creation action.
- **Progress:** route lines, numbered stops, compact milestones, or completion checks that help users understand sequence.
- **Celebration:** a brief accent treatment after a meaningful success such as creating a first group or completing an itinerary. Do not celebrate routine toggles.
- **Personalization:** greet the traveler by name and reference the active group or destination when available.

Limit each screen to one large brand surface and two saturated colors visible at the same time, excluding small semantic status indicators.

## 8. Motion and interaction feedback

Motion should feel buoyant but fast.

- Press feedback: immediate and subtle, approximately 100–150 ms when animated.
- Small state transition: approximately 150–250 ms.
- Modal or larger reveal: approximately 250–350 ms and aligned with native navigation behavior.
- Prefer opacity and transform animations; avoid animating layout properties that cause frame drops.
- Do not block input while decorative animation completes.
- Avoid looping motion except for a clear loading indicator.
- Respect the device's reduced-motion preference. Replace nonessential travel, bounce, or confetti movement with a simple fade or static state.
- Do not add an animation dependency until built-in capabilities are insufficient and the dependency is explicitly approved.

## 9. Content and voice

Starlyvia speaks like an organized friend who is excited about the trip.

- Keep labels direct and familiar.
- Use warm encouragement in heroes, onboarding, and empty states.
- Use calm, precise language for errors and destructive actions.
- Avoid blame, jokes during failure, excessive exclamation marks, and forced slang.
- Prefer “We couldn't load your groups. Check your connection and try again.” over technical or backend language.
- Prefer “No travel circles yet” over “No data.”
- Keep the terms **travel circle**, **itinerary**, **place**, and **invitation** consistent across screens.

## 10. Required UI states

Every server-backed feature must define these states before it is considered complete:

| State | Required behavior |
| --- | --- |
| Initial loading | Show a meaningful loader or skeleton without implying the list is empty |
| Refreshing | Preserve existing content while showing native refresh feedback |
| Empty | Explain what is absent and offer a relevant next step when one exists |
| Error | Show a user-safe message and a retry or recovery path |
| Offline/unreachable | Identify the connection problem without exposing raw URLs in production copy |
| Submitting | Lock duplicate actions and preserve form values |
| Disabled | Use visual and accessibility state; do not rely only on lower opacity |
| Success | Confirm important mutations and update the visible data |
| Partial failure | Preserve useful results and explain what could not load |
| Pagination | Show initial, incremental, end-of-list, and retry behavior distinctly |

Optimistic updates must roll back if the request fails. Delayed search and route responses must not overwrite newer user choices or update unmounted screens.

## 11. Accessibility requirements

- Target WCAG 2.2 AA contrast: 4.5:1 for normal text and 3:1 for large text and essential graphical controls.
- Verify actual foreground/background pairs before promoting a decorative color to readable text.
- Interactive targets should be at least 44 by 44 points, with `hitSlop` where the visible icon is smaller.
- Every icon-only action needs an accessibility label and role.
- Provide accessibility state for disabled, selected, expanded, checked, and busy controls when relevant.
- Preserve a logical screen-reader order that matches the visual hierarchy.
- Do not use color, animation, or position as the only signal.
- Support dynamic text without clipping primary content or actions.
- Announce important asynchronous success or failure where a screen reader user would otherwise miss the update.
- Decorative motifs should be hidden from accessibility APIs.

## 12. Platform and release rules

- Check Android hardware/software back behavior and iOS back and modal gestures.
- Confirm safe-area treatment on devices with cutouts and home indicators.
- Verify forms with the keyboard open, including multiline inputs and place-search results.
- Confirm long content on a small Android phone and a large iPhone-class device.
- Use platform-specific code only when behavior genuinely differs.
- Keep provider failures graceful: missing Google Places or OpenRouteService credentials must not break unrelated itinerary features.
- The UI never displays or logs tokens, private environment variables, or provider keys.
- Expo web can help catch layout issues but does not replace native Android and iOS validation.

## 13. Reuse and implementation boundaries

Before creating new UI, check these existing building blocks:

- `Screen` for page layout, safe areas, keyboard handling, refresh, and scrolling;
- `AppButton` for actions and submission state;
- `AppInput` for labeled inputs and field errors;
- `Avatar` for traveler identity and image fallback;
- `Chip` for status and compact selection;
- `GroupCard` and `PlanCard` for domain cards;
- `SectionHeader` for section hierarchy;
- `StateView` for loading, empty, and error states;
- `src/theme/tokens.ts` and `navigationTheme.ts` for all shared styling roles.

Extract a new reusable component only when it is used more than once or clearly reduces screen complexity. Do not add a new styling, state, icon, or animation library solely to implement this visual direction.

## 14. Review checklist

Before accepting a new or revised screen:

- [ ] The primary task is obvious within a quick glance.
- [ ] The screen uses existing tokens and components where applicable.
- [ ] Playfulness is concentrated in one purposeful moment.
- [ ] There is only one dominant primary action.
- [ ] Loading, empty, error, offline, disabled, submission, and success behavior are defined as applicable.
- [ ] Content works with long names, long translations, and large text.
- [ ] Touch targets, labels, roles, states, focus order, and contrast are accessible.
- [ ] Safe areas, keyboard behavior, scrolling, and back behavior work on Android and iOS.
- [ ] Lists use stable IDs and paginate when supported.
- [ ] Async results cannot overwrite newer state or update an unmounted screen.
- [ ] Provider or backend failure degrades gracefully.
- [ ] No secrets, raw backend errors, or production `console.log` calls are exposed.
- [ ] TypeScript and lint checks pass, and relevant tests have been run.

## 15. Theme consistency workflow

Apply visual changes in this order:

1. Check whether an existing semantic role in `src/theme/tokens.ts` expresses the intent.
2. Reuse or update the relevant shared primitive in `src/components/` when the behavior appears in more than one place.
3. Keep React Navigation colors synchronized through `src/theme/navigationTheme.ts`.
4. Apply feature-specific layout only after shared tokens and components cover the common behavior.
5. Review the screen with the checklist above, then run `npm run typecheck` and `npm run lint`.
6. Report native, small-screen, large-text, keyboard, offline, and reduced-motion checks that were not performed.

The implemented theme is light-only. Dark mode, custom fonts, and additional animation tooling are not currently configured and remain future work. Adding any of them requires explicit semantic roles, platform and accessibility validation, and approval for new dependencies when applicable.
