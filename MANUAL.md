# FastFingers Manual

## Overview
FastFingers is a web platform for touch typing training with AI personalization and gamification.

## Features
- 9 game modes: Practice, Sprint, Hardcore, SpeedTest, Reaction, Marathon, Code, Duel, Tournament
- 10 languages: ru, en, zh, he, de, fr, es, it, pt, ja
- Cross-platform: Web, PWA, Android (Capacitor), iOS (Capacitor), Windows/macOS/Linux (Tauri)
- Tech stack: React 18 + TypeScript, Tailwind CSS, Framer Motion, Vite, Supabase, React Query, Zustand, i18next

## Getting Started

### Prerequisites
- Node.js >= 20
- npm or yarn or pnpm
- Git

### Installation
```bash
git clone https://github.com/QuadDarv1ne/FastFingers.git
cd FastFingers
npm install
```

### Development
```bash
# Start dev server
npm run dev

# Run tests
npm run test:run

# Lint
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deployment
See `DEPLOY_GUIDE.md` for detailed instructions.
Quick options:
- Cloudflare Pages (recommended)
- GitHub Pages
- Vercel
- Netlify

## Environment Variables
Create `.env` based on `.env.example`. Variables must start with `VITE_` to be exposed to the client.

Example:
```env
VITE_API_URL=https://your-api.com
VITE_SENTRY_DSN=your-sentry-dsn
```

## Contributing
1. Fork the repository
2. Create a feature branch from `dev`
3. Make changes
4. Commit with short messages (no spaces, no Cyrillic): `git commit -m "feat:AddNewFeature"`
5. Push to your fork
6. Open a Pull Request to `dev`
7. After review, merge into `dev` then sync to `main` following the Git workflow.

## Git Workflow (summary)
- Work in branch `dev`
- Commit: `git commit -m "type:DescriptionWithoutSpaces"`
- Merge: `git merge --no-ff dev --no-edit`
- Sync: 
  ```
  git push origin dev
  git checkout main && git merge --no-ff dev --no-edit && git push origin main
  git checkout dev && git merge main --no-edit && git push origin dev
  ```

## License
MIT © 2025-2026 Dupley Maxim Igorevich
