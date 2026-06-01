# FastFingers — Context for AI Agents

## Project Overview
FastFingers is a typing trainer (blind typing) built with React 18, TypeScript, Vite 6, Tailwind CSS, Framer Motion, Zustand, TanStack Query, and i18next.

## Tech Stack
- **Frontend**: React 18, TypeScript 5.3, Vite 6
- **Styling**: Tailwind CSS 3.4, Framer Motion 12
- **State**: Zustand 5 + TanStack Query 5
- **i18n**: i18next 25 + react-i18next (10 languages)
- **Testing**: Vitest 4 (unit), Playwright 1.60 (e2e)
- **Backend**: Supabase (auth, leaderboards, duels, cloud sync)
- **Platform**: Web, Capacitor (iOS/Android), Tauri (Desktop)

## Branch Strategy
- Only `main` branch is used. No `dev` branch exists.
- All changes are committed directly to `main`.

## Commands

### Test
- `npm run test:run` — full test suite
- `npm run test:run -- src/path/to/test` — single test file
- `npm run test:coverage` — with coverage

### Build
- `npm run build` — TypeScript check + production build
- `npm run build:fast` — skip TypeScript check

### Lint
- `npm run lint`

## Project Structure
```
src/
  components/   — UI components
  contexts/     — React context providers
  hooks/        — Custom React hooks
  i18n/         — Internationalization (locales/*.json)
  services/     — Supabase, auth, cloud sync
  stores/       — Zustand stores
  tests/        — Unit tests setup
  types/        — TypeScript types
  utils/        — Utilities (logger, notifications, storage)
  workers/      — Web Workers for stats
```
