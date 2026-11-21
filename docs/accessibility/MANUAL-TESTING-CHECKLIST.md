# SONAR Manual Screen Reader & Keyboard Testing Checklist

Automated checks (`@axe-core/playwright` and `eslint-plugin-jsx-a11y`) verify baseline structural rules only. Complete these manual screen-reader passes before production release:

## Required Browser + Assistive Technology Matrix
- **Windows:** NVDA (latest) + Mozilla Firefox
- **macOS / iOS:** VoiceOver + Safari
- **Android:** TalkBack + Google Chrome

## Core User Journeys to Verify Manually
1. **Keyboard-Only Navigation:** Navigate `/`, `/login`, `/dashboard`, `/upload`, `/reader`, `/review`, `/settings` using only `Tab`, `Shift+Tab`, `Enter`, `Space`, `Escape`, and `Ctrl+K`. Confirm no keyboard traps exist and focus indicators remain visible in Light, Dark, and High Contrast modes.
2. **Heading & Landmark Rotor:** Open the screen reader elements/rotor menu and verify logical nesting (`h1 -> h2 -> h3`) and labeled `<nav>` regions.
3. **PDF Upload & Live Announcements:** Select a file using keyboard focus on `Browse PDF file`, submit, and verify validation/progress announcements without focus loss.
4. **Document Reader & Math Narration:** Navigate document outline links, verify `<th scope>` table cell announcements, expand layered figure descriptions, test `<math>` rendering, and verify Web Speech playback with `en-US` and `id-ID` voices.
5. **AI Assistant Flow:** Submit a question in `/reader`, confirm live region stays quiet while tokens stream, and confirm completion announcement fires cleanly once finished.
