# SONAR Dependency Inventory & Selection Rationale

All versions below were verified directly against `package.json` at initialization time on Node.js v24.18.0.

## Runtime Dependencies

| Package | Role in SONAR | Rationale |
|---|---|---|
| `next` (`16.4.6`) | Core App Router framework | Server Components by default, `proxy.ts` network boundary, `cacheComponents`, built-in font & image optimization. |
| `react`, `react-dom` (`19.3.0`) | UI runtime | Official React version paired with Next.js 16.4.6. |
| `@supabase/supabase-js`, `@supabase/ssr` | PostgreSQL, Auth, Storage, pgvector, RLS | Cookie-backed SSR auth with cryptographic `getUser()` validation and zero-trust RLS policies. |
| `ai`, `@ai-sdk/react`, `@ai-sdk/google` | Streaming AI chat & multimodal generation | Provider abstraction (`getChatModel`, `getVisionModel`, `getEmbeddingModel`) defaulting to Gemini without vendor lock-in. |
| `inngest` | Background document processing workflows | Serverless-compatible durable multi-step pipelines with automatic retries and progress tracking outside HTTP timeouts. |
| `pdfjs-dist` | PDF text layer extraction | Inspects native PDF pages before routing scanned pages to multimodal OCR/Vision. |
| `mathjax-full` | LaTeX-to-MathML conversion & validation | Generates sanitized `<math>` MathML for assistive technologies and penalizes confidence when parse errors occur. |
| `isomorphic-dompurify` | HTML & MathML sanitization | Prevents XSS when rendering extracted academic HTML or MathML markup. |
| `lucide-react`, `radix-ui`, `shadcn`, `cn`, `class-variance-authority`, `clsx`, `tailwind-merge`, `tw-animate-css` | Accessible component system | Radix primitives with custom SONAR WCAG 2.2 AA design tokens and keyboard/focus semantics. |
| `motion`, `gsap`, `@gsap/react` | Respectful UI & hero motion | Both configured to honor `prefers-reduced-motion` and explicit user reduction toggles. |
| `zustand`, `@tanstack/react-query` | Client UI prefs & async cache | Persists reading typography/contrast/audio settings cleanly without overlapping stores. |
| `@tanstack/react-table`, `recharts` | Review queue & course analytics | Tree-shakable v9 table (`createTableHook`) and charts always paired with tabular toggles. |
| `react-hook-form`, `zod`, `@hookform/resolvers` | Client & server validation | Single Zod schema source shared across forms, Server Actions, and Route Handlers. |
| `react-dropzone`, `cmdk`, `sonner`, `next-themes`, `date-fns`, `nanoid`, `server-only` | Upload UX, command menu, SR-bridged toasts, theming, IDs, server boundary guards | Minimal focused utilities with zero duplicate overlap. |

## Development & Testing Dependencies

| Package | Purpose |
|---|---|
| `vitest`, `@vitejs/plugin-react`, `jsdom`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event` | Fast unit and accessible React component testing. |
| `@playwright/test`, `@axe-core/playwright`, `axe-core` | Automated browser WCAG 2.2 Level AA and keyboard-only end-to-end verification. |
| `eslint-plugin-jsx-a11y`, `eslint-config-next`, `typescript`, `tsx` | Static accessibility linting and strict TypeScript verification. |
