#!/bin/bash
export GIT_AUTHOR_NAME="ldo"
export GIT_AUTHOR_EMAIL="ldo@example.com"
export GIT_COMMITTER_NAME="ldo"
export GIT_COMMITTER_EMAIL="ldo@example.com"

# 1. Setup
git add package.json next.config.ts postcss.config.mjs tailwind.config.ts tsconfig.json .eslintrc.json components.json
git commit -m "chore: setup Next.js 14, TypeScript, Tailwind, and shadcn UI

Co-authored-by: Antigravity AI" || true

# 2. Base files
git add src/app/layout.tsx src/app/globals.css src/app/page.tsx
git commit -m "feat: root layout and global styles

Co-authored-by: Antigravity AI" || true

# 3. State & Types
git add src/types src/lib/constants.ts src/context
git commit -m "feat: core types, constants, and React Context state management

Co-authored-by: Antigravity AI" || true

# 4. Libraries (Engines & Logic)
git add src/lib
git commit -m "feat: implement OCR engines (OpenAI/Tesseract) and verification logic

Co-authored-by: Antigravity AI" || true

# 5. Shared Components
git add src/components/ui src/components/layout src/components/auth src/components/shared src/hooks
git commit -m "feat: shared UI components, auth guard, and keyboard shortcuts

Co-authored-by: Antigravity AI" || true

# 6. Upload & Results UI
git add src/components/upload src/components/results
git commit -m "feat: upload forms, dropzone, and verification result views

Co-authored-by: Antigravity AI" || true

# 7. App Pages
git add src/app/login src/app/dashboard src/app/verify src/app/guidelines src/app/history src/app/settings src/app/api
git commit -m "feat: implement all application pages and API routes

Co-authored-by: Antigravity AI" || true

# 8. Docs & Cleanup
git add docs README.md public
git commit -m "docs: add architecture, notes, changelog, and quick start guide

Co-authored-by: Antigravity AI" || true

# Any remaining files
git add .
git commit -m "chore: final cleanup and polish

Co-authored-by: Antigravity AI" || true
