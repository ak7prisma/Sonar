# SONAR WCAG 2.2 Level AA Accessibility Architecture

1. **Structural Landmarks & Focus Management**: Every route renders a skip link (`Skip to main content` -> `#main-content`), `<header>`, labeled `<nav>`, `<main id="main-content">`, `<footer>`, a single `<h1>`, and automatic focus transition announcements via `RouteFocusManager`.
2. **Non-Color Status Signaling**: `StatusBadge` always pairs semantic color tokens with explicit icons and unambiguous text (`Verified by Reviewer`, `AI Draft — Unverified`, `Conversion Failed`).
3. **Reading & Cognitive Preferences**: `AccessibilityToolbar` and `/settings` adjust Atkinson Hyperlegible / Lexend / Inter fonts, pixel sizing, line height, column width, high-contrast mode, warm dyslexia paper background, and reduced motion.
4. **Form Accessibility**: `AuthForm`, `UploadForm`, and `ReviewWorkbench` link errors via `aria-invalid`, `aria-describedby`, and focusable summary alerts (`role="alert"`), and support keyboard-first file selection alongside drag-and-drop.
5. **Screen-Reader-Safe AI Streaming**: `AccessibleReaderStudio` announces assistant completion once when streaming ends rather than flooding live regions token-by-token.
6. **Accessible Data Visualization**: `StudyActivityPanel` couples every Recharts chart with an explicit `Data table` view toggle and descriptive ARIA summary.
