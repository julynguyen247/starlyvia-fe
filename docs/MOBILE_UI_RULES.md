# Starlyvia Mobile UI System

**Status:** Implemented adaptive light/dark direction for the Expo React Native client.

## 1. Experience goal

Starlyvia should make collaborative trip planning feel energetic, friendly, and easy to finish. Light mode combines airy white and soft gray-lavender surfaces with progression-led purple, optimistic lime, and selective coral, sky, and gold rewards. Dark mode keeps its stepped near-black layers. Playfulness belongs in focal moments and feedback rather than every border or card.

The design must remain useful before it is decorative. A traveler should always be able to identify the current screen, its state, and the next action at a glance.

## 2. Visual character

| Principle | Apply it with | Avoid |
| --- | --- | --- |
| Forward momentum | Purple primary actions, focus, and progress | Giving every accent equal visual weight |
| Social optimism | Lime collaboration, success, and secondary emphasis | Using success color as generic decoration |
| Reward energy | Coral, sky, violet, and gold in small collectible accents | Saturating routine forms or long reading surfaces |
| Confident contrast | Airy light heroes or deep dark heroes with paired foreground roles | Low-contrast text or undifferentiated pure-black regions |
| Friendly rhythm | Rounded cards, layered sections, asymmetric icon placement | Turning every label into a pill |
| Dynamic feedback | Quick press scale, one-shot reveals, focused navigation states | Continuous bouncing, blocking animation, or motion-only meaning |
| Clear travel identity | Consistent luggage, map, route, people, and compass motifs | Generic emoji or unrelated decorative icons |

Each screen gets one expressive focal area. Routine controls and long-form content stay calm so the product feels lively without becoming noisy.

## 3. Theme foundation

[`src/theme/tokens.ts`](../src/theme/tokens.ts) is the source of truth for palette values. [`ThemeContext`](../src/context/ThemeContext.tsx) resolves `system`, `light`, or `dark`, persists an explicit preference in Secure Store, and exposes the resolved semantic colors through `useAppTheme`. [`navigationTheme.ts`](../src/theme/navigationTheme.ts) maps those colors into React Navigation.

Components choose a semantic role such as `primary`, `surface`, or `danger`; they do not choose a hex value. Light and dark values are intentionally different implementations of the same role, not colors that components may mix and match.

### 3.1 Color roles

Values below are written as **Light / Dark**.

#### Neutral foundation

| Token | Light / Dark | Use |
| --- | --- | --- |
| `background` | `#F8F7FB` / `#121114` | App canvas and screen background |
| `surface` | `#FFFFFF` / `#1A191D` | Cards, inputs, sheets, and primary content surfaces |
| `surfaceWarm` | `#F3F1F6` / `#211F24` | Raised sections and purple-tinted headers |
| `surfaceMuted` | `#ECE9F0` / `#2A282E` | Quiet groups, disabled wells, and secondary regions |
| `text` | `#2B2630` / `#FFFFFF` | Headings, body copy, and primary values |
| `textMuted` | `#6D6673` / `#A9A6AF` | Supporting copy, metadata, and placeholders |
| `border` | `#DED9E3` / `#37333A` | Subtle card and section boundaries |
| `controlBorder` | `#7C7483` / `#6C6872` | Resting input and essential control outlines |
| `overlay` | `rgba(20, 16, 23, 0.52)` / `rgba(8, 7, 10, 0.80)` | Modal and scrim backdrop |

#### Brand hierarchy

| Token family | Light / Dark | Use |
| --- | --- | --- |
| `primary` | `#8B3FD7` / `#984FE6` | One dominant action, active navigation, focus, progress, and selection |
| `primaryText` | `#8B3FD7` / `#B98AFF` | Standalone purple links, values, and small labels on neutral surfaces |
| `onPrimary` | `#FFFFFF` / `#FFFFFF` | Text and icons placed directly on `primary` |
| `primaryDark` | `#EEE8F5` / `#251C2D` | Adaptive hero surface: pale lavender in light mode, deep plum in dark mode |
| `primarySoft` | `#F2E6FC` / `#382447` | Selected rows, quiet badges, and low-emphasis purple regions |
| `primaryBorder` | `#7730C0` / `#8D46DE` | Focused control outline; not a general divider |
| `accent` | `#A9E53D` / `#B7F34A` | Lime collaboration, invitation, completion, and secondary emphasis |
| `onAccent` | `#253300` / `#172006` | Text and icons placed directly on `accent` |
| `accentSoft` | `#EAFBC5` / `#29351C` | Low-emphasis lime background |
| `accentText` | `#405D00` / `#D9FF8C` | Text and icons on `accentSoft` |
| `tertiary` | `#C8463E` / `#FF776D` | Small coral reward, illustration, or expressive accent |
| `tertiarySoft` | `#FFE4E1` / `#432522` | Low-emphasis coral background |
| `tertiaryText` | `#8B2F29` / `#FFB6AF` | Text and icons on `tertiarySoft` |

Purple owns product progress and is visually dominant. Lime supports social optimism and positive outcomes. Coral adds energy in small areas; it does not compete with the primary action.

#### Semantic feedback

| Meaning | Solid Light / Dark | Soft Light / Dark | Text Light / Dark |
| --- | --- | --- | --- |
| Success | `#5E7D00` / `#B7F34A` | `#EAFBC5` / `#29351C` | `#405D00` / `#D9FF8C` |
| Warning | `#A75D00` / `#FFBD5B` | `#FFF8E7` / `#28283A` | `#6A3D00` / `#FFE0A3` |
| Danger | `#C8463E` / `#FF776D` | `#FFE4E1` / `#432522` | `#8B2F29` / `#FFB6AF` |

Semantic aliases are chosen by meaning, even when they currently share a value with a brand token. Use `danger`, not `tertiary`, for deletion or failure. Use `success`, not `accent`, for a confirmed successful state. Warning surfaces remain neutral-gold rather than becoming muddy brown blocks in dark mode.

#### Navigation and fixed artwork colors

| Token | Light / Dark | Use |
| --- | --- | --- |
| `navigationSurface` | `#FFFFFF` / `#1B191F` | Floating navigation pill |
| `navigationBorder` | `#DED9E3` / `#353139` | Pill edge |
| `navigationIcon` | `#837C89` / `#8B8791` | Inactive tab icons |
| `stickerPalette.orange` | `#FF8A64` | Travel-circle foundation, type badge, and reward accent |
| `stickerPalette.green` | `#B7F34A` | Planned/completed itinerary and positive reward accent |
| `stickerPalette.yellow` | `#F8DB55` | Gold reward and supporting sticker accent |
| `stickerPalette.blue` | `#7EC8FF` | Draft itinerary and sky accent |
| `stickerPalette.violet` | `#B98AFF` | Collectible and supporting sticker accent |
| `stickerPalette.coral` | `#FF776D` | Cancelled itinerary and coral reward accent |
| `illustrationSun` | `#F4B942` / `#FFD166` | Small celebratory highlight |
| `illustrationSky` | `#8AD8F5` | Supporting illustration color in both themes |

The navigation pill follows the appearance mode: white in light mode and near-black in dark mode. The sticker palette remains stable as artwork. Pair sticker fills with `onSticker` (`#1C181F`) and `onStickerMuted` (`#3B353D`), not with theme `text`.

### 3.2 Color balance

- Neutral `background`, `surface`, `surfaceWarm`, and `surfaceMuted` carry the screen canvas, forms, long reading content, and spacing between focal cards.
- Purple remains the dominant interactive accent for primary actions, focus, selection, progress, and active navigation.
- In light mode, both domain cards use white `surface`; orange and itinerary status colors appear only on the top edge, icon stickers, and compact badges.
- In dark mode, travel circles restore the orange sticker foundation and itineraries restore their status foundation: blue for draft, lime for planned/completed, and coral for cancelled.
- Keep neutral spacing between cards and avoid placing another large saturated control directly beside them.
- Coral outside a cancelled card remains a small reward, illustration, or feedback accent.

### 3.3 Required foreground pairings

| Background | Foreground | Notes |
| --- | --- | --- |
| `background`, `surface`, `surfaceWarm`, `surfaceMuted` | `text`, `textMuted`, or `primaryText` | Default content; reserve `primaryText` for interactive or highlighted copy |
| `primary` | `onPrimary` | Primary buttons and solid active controls |
| `primaryDark` | `heroText`, `heroTextMuted`, or `heroTextSubtle` | Adaptive hero content only |
| `accent` | `onAccent` | Solid lime controls or badges |
| `accentSoft` | `accentText` | Quiet lime state |
| `tertiarySoft` | `tertiaryText` | Quiet coral state |
| `successSoft` | `successText` | Confirmed positive state |
| `warningSoft` | `warningText` | Caution and recoverable interruption |
| `dangerSoft` | `dangerText` | Destructive action, error, or cancellation |
| `navigationSurface` | `navigationIcon` when inactive; `primary` when active | Icons only; active state also has a shape marker |
| Sticker palette fill | `onSticker` or `onStickerMuted` | Collectible cards and artwork labels |

Do not infer a foreground from whether a color looks light or dark. Always use the paired semantic token. Every solid `primary` purple surface uses white `onPrimary` text and icons in both appearance modes.

### 3.4 Contrast contract

- Meet WCAG 2.2 AA: at least 4.5:1 for normal text and 3:1 for large text, icons, focus rings, and essential control boundaries.
- Current primary and secondary text pairings exceed 4.5:1 on their intended neutral canvases in both modes.
- Current solid button pairings—`onPrimary` on `primary` and `onAccent` on `accent`—meet 4.5:1 in both modes.
- Standalone `primaryText` purple maintains at least 4.54:1 across the light neutral layers and 5.65:1 across the dark neutral layers.
- `controlBorder` is the resting essential-control boundary; `border` is decorative and is not required to carry control meaning.
- White `onPrimary` text on purple measures 5.54:1 in light mode and 4.57:1 in dark mode, meeting normal-text AA contrast.
- Selection, status, and validation always include an icon, label, outline, or shape change. Color is never the only signal.

### 3.5 Light and dark mode behavior

- Light mode uses only white, soft gray, and pale purple-neutral backgrounds. Dark colors are reserved for readable text, icons, and transient overlays—not large surfaces.
- Dark mode uses stepped near-black layers rather than one flat black: `#121114` → `#1A191D` → `#211F24` → `#2A282E`.
- Preserve the semantic role when switching modes; never import `lightColors` or `darkColors` directly into a component to force an appearance.
- The floating navigation is a white floating pill in light mode and a dark floating pill in dark mode.
- System mode follows `useColorScheme`; an explicit Light or Dark choice overrides it and is persisted.
- Native system background, status bar treatment, and React Navigation colors update from the resolved theme.

### 3.6 Implementation rules

```tsx
const { colors } = useAppTheme();
const styles = useThemedStyles(createStyles);

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    card: { backgroundColor: colors.surface },
    title: { color: colors.text },
    caption: { color: colors.textMuted },
  });
}
```

- Use `useAppTheme` for runtime colors and `useThemedStyles` for theme-dependent style sheets.
- Use `primary` for solid fills and non-text active accents; use `primaryText` for standalone purple links, values, and small labels.
- Add a token only when an existing semantic role cannot express the need across both modes.
- Add every new semantic key to `darkColors`; the `ThemeColors` type then requires its light-mode value.
- Keep raw hex, RGB, and named colors inside the theme or stable artwork palette. A one-off translucent decorative layer may use a documented theme token instead of a screen literal.
- Do not use `white`, `black`, `primary`, or a sticker color merely because it visually fits; use the semantic foreground/background pair for the component state.
- Do not use opacity to repair an inaccessible text color. Choose the correct muted or paired token.

### 3.7 Shape, spacing, and depth

- Use the shared 4, 8, 12, 16, 24, 32, and 48 point spacing scale.
- Use 16–30 point radii for primary cards and heroes; use pill radii only for compact status and selection controls.
- Prefer a strong silhouette and clear internal spacing over many borders.
- Keep routine cards to a subtle 1-point border and soft depth. Reserve sticker depth for a small number of expressive domain cards.
- Keep primary touch targets at least 44 by 44 points.

### 3.8 Typography character

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

- pale lavender background with dark copy in light mode, and near-black plum with light copy in dark mode;
- a compact lime eyebrow label;
- purple, lime, and restrained reward accents;
- one optional travel illustration;
- one optional primary action;
- rounded, clipped edges with restrained layered depth.

The hero title is the visual anchor. Decorative symbols are hidden from accessibility and must never cover the title, description, badge, or action when text grows.

### 5.2 `AppButton`

- Primary: purple fill with white label, icon, and loading indicator.
- Secondary: lime-tinted fill with paired lime text.
- Ghost: transparent or white surface with a neutral border.
- Danger: danger-tinted surface and literal destructive label.
- Keep loading, disabled, accessibility, and duplicate-submission behavior intact.
- Press feedback is a short opacity, translate, and scale response. The control must not wait for decorative animation.

### 5.3 `AppInput`

- Keep labels visible above fields.
- Use Ionicons for optional leading symbols.
- Use a neutral surface, a resting control border with at least 3:1 adjacent contrast, and a purple focus border.
- Show validation close to the field and preserve entered values after failure.
- Set appropriate keyboard, capitalization, autocomplete, and return-key behavior.

### 5.4 Cards and lists

- A card represents one entity or decision and keeps one clear text hierarchy even when its visual canvas is layered.
- Group cards use a white surface with an orange top edge in light mode and an orange foundation in dark mode, plus a concise copy hierarchy, one layered dimensional icon sticker, and one trailing open affordance.
- Itinerary status owns a stable accent color: draft blue, planned and completed lime, and cancelled coral.
- Itinerary cards use a white foundation with a status-colored top edge in light mode and the full status foundation in dark mode, plus start time, stop metadata, and one layered airplane-and-pin sticker.
- Decorative background art remains accessibility-hidden and must not reduce title, description, metadata, or target contrast.
- Notification types use a stable colored edge and icon sticker while their reading surface stays neutral.
- The full expected card area is pressable and exposes a meaningful accessibility label.
- Lists use stable domain IDs, preserve content during refresh, and distinguish initial loading from incremental states.

### 5.5 Chips and selections

- Use `Chip` for compact states and choices.
- Selected chips use purple emphasis and include a check Ionicon.
- Semantic tones keep their literal success, warning, or danger meaning.
- Wrap long chip rows and do not rely on color alone to communicate selection.

### 5.6 Navigation

- Keep Home, Groups, Notifications, and Profile as the four functional routes.
- Present five visual positions in a floating rounded pill that is white in light mode and dark in dark mode: Home, Groups, the centered QR placeholder, Notifications, and Profile.
- Use filled and outline Ionicons for focus state; inactive icons stay minimal gray and focused routes use purple.
- Keep the centered QR control as a raised purple circle with a reduced-motion-aware one-shot reveal. It remains disabled until the scanner flow is implemented.
- Preserve typed routes, native gestures, keyboard hiding, and Android back history.

## 6. Screen composition

### Home

1. Personal greeting and notification control.
2. One expressive adaptive travel hero—pale lavender in light mode and deep plum in dark mode—with a purple primary action.
3. A compact quick-action row using package icons for new circle, invitations, and trip browsing.
4. Travel circles and itineraries on white light-mode cards or saturated dark-mode sticker cards, with dimensional accents that remain scannable.

### Authentication

1. Small Starlyvia brand lockup using the `sparkles` Ionicon.
2. Adaptive pale-lavender/deep-plum welcome hero with a lime label and travel illustration.
3. A single warm form card.
4. One purple submit action and one quiet text route to the alternate auth screen.

### Groups and invitations

Use colorful group accents over neutral surfaces and one lime invitation highlight. Empty and error states retain the same page structure instead of replacing the whole visual language.

### Itineraries

Use an adaptive high-level summary and a readable vertical sequence for stops. Purple identifies the active route action; lime confirms a completed route. Timeline lines clarify order and are not treated as icons.

### Completion and success

Use an adaptive neutral frame, one lime confirmation mark, one gold or coral reward accent, one illustration, concise copy, and a single next action. Celebrate once; do not loop confetti or delay navigation.

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
- `DreamyBackdrop` for small, bounded decorative accent dots that never overlap content;
- `PlayfulHero` for the adaptive pale-lavender/deep-plum focal surface;
- `TravelScene` for illustration selection, fallback, and reduced-motion reveal;
- `AppButton` and `AppInput` for controls;
- `Avatar`, `Chip`, and `SectionHeader` for common content patterns;
- `GroupCard` and `PlanCard` for domain entities;
- `StateView` for loading, empty, warning, error, offline, and success presentation.

Create a new shared component only when it is reused or materially reduces screen complexity. Do not add a styling, icon, state, or animation library for an isolated treatment.

## 11. Review checklist

- [ ] The primary task and dominant action are obvious.
- [ ] Light mode uses only white, soft gray, and pale lavender surfaces; dark mode uses stepped near-black layers.
- [ ] Purple progress, lime collaboration, and coral rewards remain controlled accents rather than large reading surfaces.
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

The React Native surface supports a persisted System, Light, or Dark preference, uses platform-native system, rounded, and condensed font families, and uses built-in React Native animation. `app.json` allows automatic platform appearance while the React tree updates navigation and status-bar colors live. Native place selection uses MapLibre with OpenFreeMap's dark and light vector styles; it requires a development or release build rather than Expo Go. Geoapify place credentials remain backend-only, and visible OpenStreetMap/Geoapify attribution stays with the place picker. The shared artwork remains raster PNG. Automated visual regression and native component-state tests are not configured, so Android and iOS device checks remain part of release validation.
