# ADR-001: Core Web Stack, Next.js 16 `proxy.ts`, and `cacheComponents`

- **Status:** Accepted
- **Date:** 2026-11-21

## Decision
Use Next.js 16.4.6 App Router (`src/` directory) with strict TypeScript, React 19.3, Tailwind CSS v4, and Radix-backed shadcn/ui customized to SONAR's teal identity (`#025952`, `#19B1A4`, `#0E191C`, `#FEFEFE`). Use `src/proxy.ts` exporting `proxy()` instead of deprecated `middleware.ts`, and isolate request-time cookie reads inside `<Suspense>` boundaries for `cacheComponents: true`.

## Consequences
- Zero legacy middleware deprecation warnings.
- Static page shells stream authenticated content reliably behind `<Suspense>`.
