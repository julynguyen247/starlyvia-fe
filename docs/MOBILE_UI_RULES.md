# Starlyvia Mobile UI System

**Status:** Implemented adaptive light/dark direction for the Expo React Native client.

## 1. Experience goal

Starlyvia should make collaborative trip planning feel energetic, friendly, and easy to finish. The interface combines calm neutral surfaces, fresh green highlights, warm orange actions, selective color, rounded typography, and compact travel illustrations. Playfulness belongs in focal moments and feedback rather than every border or card.

The design must remain useful before it is decorative. A traveler should always be able to identify the current screen, its state, and the next action at a glance.

## 2. Visual character

| Principle | Apply it with | Avoid |
| --- | --- | --- |
| Warm energy | Tangerine primary actions and sticker accents | Using orange for warnings or destructive actions |
| Fresh optimism | Green highlights, success moments, and selected secondary surfaces | Filling every screen with saturated green |
| Confident contrast | Charcoal heroes, strong headings, white copy | Low-contrast text or large pure-black regions |
| Friendly rhythm | Rounded cards, layered sections, asymmetric icon placement | Turning every label into a pill |
| Dynamic feedback | Quick press scale, one-shot reveals, focused navigation states | Continuous bouncing, blocking animation, or motion-only meaning |
| Clear travel identity | Consistent luggage, map, route, people, and compass motifs | Generic emoji or unrelated decorative icons |

Each screen gets one expressive focal area. Routine controls and long-form content stay calm so the product feels lively without becoming noisy.

## 3. Theme foundation

`src/theme/tokens.ts` is the source of truth. `ThemeContext` resolves System, Light, or Dark and persists the preference. Screens and components must consume semantic colors through `useAppTheme` rather than introducing isolated literals.

### 3.1 Color roles

| Token | Value | Role |
| --- | --- | --- |
| `background` | `#0C1511` | Default charcoal canvas |
| `surface` | `#14231C` | Primary dark card surface |
| `surfaceWarm` | `#192A22` | Raised form and content surface |
| `surfaceMuted` | `#22362C` | Quiet grouping surface |
| `text` | `#F8F4EC` | Primary text on dark surfaces |
| `textMuted` | `#AAB8AF` | Supporting text on dark surfaces |
| `primary` | `#FF7442` | Primary actions and active emphasis |
| `primaryDark` | `#142019` | Hero surface and text on bright stickers |
| `primarySoft` | `#3A241B` | Quiet orange emphasis |
| `accent` | `#68DA91` | Fresh highlight and positive emphasis |
| `accentSoft` | `#173925` | Quiet green surface |
| `accentText` | `#B2F0C4` | Readable green text on dark surfaces |
| `stickerPalette` | orange, green, yellow, blue, violet, coral | Stable domain-card backgrounds |
| `illustrationSun` | `#FFD15C` | Small celebratory highlights |
| `illustrationSky` | `#BEEAF2` | Supporting illustration color |

Success, warning, and danger tokens remain semantic. They are never reassigned simply to make a screen more colorful.

### 3.2 Color balance

- Use charcoal for the app canvas, navigation, forms, and routine reading surfaces.
- Raise sections through theme surfaces, spacing, and subtle borders.
- Use orange for the dominant action and small active markers.
- Use green for secondary emphasis, selection, invitations, and positive progress.
- Give domain cards a stable sticker color selected from orange, green, yellow, blue, violet, or coral.
- Use the full sticker palette across a list, but keep each individual card to one dominant color plus charcoal and translucent white.

### 3.3 Shape, spacing, and depth

- Use the shared 4, 8, 12, 16, 24, 32, and 48 point spacing scale.
- Use 16–30 point radii for primary cards and heroes; use pill radii only for compact status and selection controls.
- Prefer a strong silhouette and clear internal spacing over many borders.
- Keep routine cards to a subtle 1-point border and soft depth. Reserve sticker depth for a small number of expressive domain cards.
- Keep primary touch targets at least 44 by 44 points.

### 3.4 Typography character

- Body copy continues using the platform system face for predictable native rendering.
- Section headings and domain-card titles use the platform-native rounded display family from `fontFamilies.display` (`Avenir Next` on iOS and `sans-serif-rounded` on Android).
- Sticker labels, route stamps, and compact metadata use the condensed native family from `fontFamilies.label`.
- Use weight, width, and letter spacing to create hierarchy; do not add a font dependency solely for decorative card styling.

## 4. Icons and illustration

### 4.1 Package icons only

Use `Ionicons` from the installed `@expo/vector-icons` package for all interface icons and small decorative symbols.

- Do not draw an icon from borders, rotated squares, circles, text characters, emoji, or a stack of nested `View` elements.
- Choose a single recognizable glyph and keep its meaning consistent. For example, use `location`, `people`, `ticket`, `notifications`, `compass`, and `airplane` for their literal product concepts.
- Focused bottom-tab icons use the filled Ionicon; unfocused icons use the outline form.
- Icon-only controls require an accessibility label, button role, and a minimum 44-point target.
- Small visual badges such as notification counts may use shape primitives because they communicate state rather than imitate an icon.

### 4.2 Illustration assets

The raster travel scenes in `assets/illustrations/` are expressive artwork, not interface icons. They may be used in one hero, success, loading, or empty-state focal area. `TravelScene` owns their mapping, fallback, sizing, and reveal behavior.

Do not combine these scenes with emoji, stock photos, glossy 3D art, or unrelated illustration styles. If an asset fails to load, `TravelScene` falls back to an Ionicon rather than manually drawn substitute artwork.

## 5. Component rules

### 5.1 `PlayfulHero`

The shared hero is the most expressive surface:

- charcoal background with high-contrast copy;
- a compact green eyebrow label;
- orange and green Ionicon accents;
- one optional travel illustration;
- one optional primary action;
- rounded, clipped edges with restrained layered depth.

The hero title is the visual anchor. Decorative symbols are hidden from accessibility and must never cover the title, description, badge, or action when text grows.

### 5.2 `AppButton`

- Primary: orange fill, charcoal label, dark edge/shadow.
- Secondary: green-tinted fill with dark green label.
- Ghost: transparent or white surface with a neutral border.
- Danger: danger-tinted surface and literal destructive label.
- Keep loading, disabled, accessibility, and duplicate-submission behavior intact.
- Press feedback is a short opacity, translate, and scale response. The control must not wait for decorative animation.

### 5.3 `AppInput`

- Keep labels visible above fields.
- Use Ionicons for optional leading symbols.
- Use a raised warm-dark surface, a resting control border with at least 3:1 adjacent contrast, and an orange focus border.
- Show validation close to the field and preserve entered values after failure.
- Set appropriate keyboard, capitalization, autocomplete, and return-key behavior.

### 5.4 Cards and lists

- A card represents one entity or decision and keeps one clear text hierarchy even when its visual canvas is layered.
- Group type owns a stable sticker color: solo green, couple coral, friends blue, family yellow, double date violet, and custom orange.
- Group cards combine a large low-contrast type-icon canvas, category sticker, route symbols, descriptive copy, and one trailing open affordance.
- Itinerary status owns a stable sticker color: draft blue, planned yellow, completed green, and cancelled coral.
- Itinerary cards use ticket notches, a dark route strip, an illustrated itinerary sticker, status/date hierarchy, and a compact travel-canvas stamp.
- Decorative background art remains accessibility-hidden and must not reduce title, description, metadata, or target contrast.
- Notification types use a stable colored edge and icon sticker while their reading surface stays dark.
- The full expected card area is pressable and exposes a meaningful accessibility label.
- Lists use stable domain IDs, preserve content during refresh, and distinguish initial loading from incremental states.

### 5.5 Chips and selections

- Use `Chip` for compact states and choices.
- Selected chips use orange emphasis and include a check Ionicon.
- Semantic tones keep their literal success, warning, or danger meaning.
- Wrap long chip rows and do not rely on color alone to communicate selection.

### 5.6 Navigation

- Keep Home, Groups, Notifications, and Profile as the four primary tabs.
- Use filled and outline Ionicons for focus state.
- The active item may use a soft orange capsule and a small dark edge; it must remain stable rather than bounce continuously.
- Preserve typed routes, native gestures, keyboard hiding, and Android back history.

## 6. Screen composition

### Home

1. Personal greeting and notification control.
2. One expressive charcoal travel hero with an orange primary action.
3. A compact quick-action row using package icons for new circle, invitations, and trip browsing.
4. Travel circles and upcoming itineraries as layered, collectible-looking canvas cards that remain scannable.

### Authentication

1. Small Starlyvia brand lockup using the `sparkles` Ionicon.
2. Charcoal welcome hero with green label and travel illustration.
3. A single warm form card.
4. One orange submit action and one quiet text route to the alternate auth screen.

### Groups and invitations

Use colorful group stickers over the charcoal canvas and one green or orange invitation highlight. Empty and error states retain the same page structure instead of replacing the whole visual language.

### Itineraries

Use a dark high-level summary and a readable vertical sequence for stops. Orange identifies the active route action; green confirms a completed route. Timeline lines clarify order and are not treated as icons.

### Completion and success

Use a charcoal or orange-led frame, one green confirmation mark, one illustration, concise copy, and a single next action. Celebrate once; do not loop confetti or delay navigation.

## 7. Motion and interaction

Motion is brief, useful, and implemented with built-in React Native animation.

- Press response: approximately 100–150 ms.
- Small reveal or selection change: approximately 180–260 ms.
- Large native transition: approximately 250–350 ms.
- Animate opacity and transforms rather than layout-heavy properties.
- Travel illustrations and hero accents may reveal once on entry.
- Routine cards, tabs, fields, and destructive actions do not loop or wobble.
- Motion never blocks input or becomes the only signal of state.
- `useReducedMotion` disables nonessential travel, scale, and decorative reveals when the platform preference is enabled.
- Do not add another animation dependency until built-in APIs are insufficient and dependency approval is explicit.

## 8. State model

Every server-backed view defines the applicable states:

| State | Required behavior |
| --- | --- |
| Initial loading | Show progress without implying empty content |
| Refreshing | Preserve existing data with native refresh feedback |
| Empty | Explain what is missing and offer a relevant next action |
| Error | Show a safe message and retry or recovery path |
| Offline | Explain the connection issue without exposing production internals |
| Submitting | Lock duplicate actions and preserve form values |
| Disabled | Expose visual and accessibility state |
| Success | Confirm meaningful mutations and update visible data |
| Partial failure | Keep useful results and explain what could not refresh |
| Pagination | Separate initial, incremental, end, and retry states |

Stale asynchronous results must not overwrite newer choices or update an unmounted view. Optimistic state must roll back after a failed mutation.

## 9. Accessibility and responsive behavior

- Target WCAG 2.2 AA contrast: 4.5:1 for normal text and 3:1 for large text and essential controls.
- Never use color, position, or animation as the only signal.
- Support long names, wrapping copy, and dynamic text without hiding the primary action.
- Keep a logical screen-reader order matching the visible hierarchy.
- Hide decorative icons and illustrations from accessibility when they add no information.
- Add accessible roles, labels, selected/disabled/busy state, and live-region announcements where applicable.
- Respect safe areas, keyboard avoidance, native back behavior, and modal dismissal.
- Check compact Android-class widths and large iPhone-class layouts. Expo web is useful for layout inspection but does not replace native validation.

## 10. Shared implementation map

Before adding a screen-level pattern, reuse these primitives:

- `src/theme/tokens.ts` for color, spacing, radius, type, and depth;
- `src/theme/navigationTheme.ts` for navigation color synchronization;
- `Screen` for safe-area, keyboard, scrolling, refresh, and backdrop behavior;
- `DreamyBackdrop` for package-icon atmosphere;
- `PlayfulHero` for the charcoal focal surface;
- `TravelScene` for illustration selection, fallback, and reduced-motion reveal;
- `AppButton` and `AppInput` for controls;
- `Avatar`, `Chip`, and `SectionHeader` for common content patterns;
- `GroupCard` and `PlanCard` for domain entities;
- `StateView` for loading, empty, warning, error, offline, and success presentation.

Create a new shared component only when it is reused or materially reduces screen complexity. Do not add a styling, icon, state, or animation library for an isolated treatment.

## 11. Review checklist

- [ ] The primary task and dominant action are obvious.
- [ ] The screen uses the charcoal foundation and the controlled orange, green, yellow, blue, violet, and coral sticker palette.
- [ ] Package icons replace hand-built icon shapes and emoji.
- [ ] There is no more than one expressive focal area.
- [ ] Decorative elements remain secondary and hidden from accessibility where appropriate.
- [ ] Loading, refresh, empty, failure, disabled, submission, and success states are handled as applicable.
- [ ] Long text, small screens, safe areas, and keyboard behavior remain usable.
- [ ] Touch targets, labels, roles, state, focus order, and contrast are accessible.
- [ ] Motion is short, nonblocking, and reduced-motion aware.
- [ ] No token, credential, raw backend error, or production debug output is exposed.
- [ ] `npm run typecheck` and `npm run lint` pass.

## 12. Current boundaries

The React Native surface supports a persisted System, Light, or Dark preference, uses platform-native system, rounded, and condensed font families, and uses built-in React Native animation. `app.json` allows automatic platform appearance while the React tree updates navigation and status-bar colors live. Native place selection uses `react-native-maps`; standalone Android builds read a restricted Google Maps SDK key from `GOOGLE_MAPS_ANDROID_API_KEY` through `app.config.ts`, separate from the backend Places credential. The shared artwork remains raster PNG. Automated visual regression and native component-state tests are not configured, so Android and iOS device checks remain part of release validation.
