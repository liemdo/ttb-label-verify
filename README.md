# AI-Powered Alcohol Label Verification App

A proof-of-concept for TTB label review: match a submitted label image to application data, then let a specialist approve or reject with judgment.

Live prototype: [https://ttb-label-verify-git-main-realliemdo.vercel.app/](https://ttb-label-verify-git-main-realliemdo.vercel.app/)

## Key Features

- **Application vs label matching**: Specialists enter application fields (brand, class/type, ABV, net contents, producer) so the checker compares the form to the artwork, not just reads the bottle.
- **AI Vision (OpenAI GPT-4o)**: Extracts label fields, including curved text and imperfect photos when the model can still read them.
- **Offline OCR (Tesseract.js)**: Browser-only fallback when a firewall blocks cloud APIs.
- **Government warning**: Word-for-word wording plus an ALL CAPS `GOVERNMENT WARNING:` header, with a character diff. Bold type and minimum type size are left as an agent visual check.
- **Batch processing**: Up to 300 images, processed a few at a time. Failed files are listed instead of dropped silently.
- **Review tools**: Approve or reject from one footer, field overrides with a reason, agent notes, keyboard shortcuts (`A`, `R`, `O`, `N`).
- **Applicant portal**: Companies can submit labels; specialists see an applicants directory with contacts.

## Getting Started

### Prerequisites

- Node.js 18+
- A [Neon](https://neon.tech) Postgres database
- [OpenAI API key](https://platform.openai.com/api-keys) (for AI mode)
- [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) token (for label images)

### Installation

1. Clone the repository and install dependencies:

   ```bash
   npm install
   ```

2. Create `.env.local`:

   ```bash
   OPENAI_API_KEY=sk-your-openai-api-key
   DATABASE_URL=postgresql://user:password@endpoint.neon.tech/neondb?sslmode=require
   BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...
   ```

   You can also paste an OpenAI key on the in-app Settings page.

3. Apply the schema:

   ```bash
   npx drizzle-kit push
   ```

4. Start the app:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000). Sign in as a specialist (for example Sarah Chen) or an applicant company.

Do not run `npm run db:seed` unless you intend to replace demo data.

## Documentation

- [Quick Start Guide](docs/start.md)
- [Architecture & Tech Stack](docs/architecture.md)
- [Design Notes & Assumptions](docs/notes.md)
- [Changelog](docs/changelog.md)

## Tech Stack

- **Framework**: Next.js 16 (App Router), React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **AI/Vision**: OpenAI API (gpt-4o)
- **Offline OCR**: Tesseract.js (WebAssembly)
- **Database**: Neon Postgres via Drizzle ORM
- **Images**: Vercel Blob (private store)

## Honest limits

- Extraction often takes longer than Sarah’s ~5 second bar. Processing time is shown; times over 5s are flagged. There is no hard abort.
- Batch is concurrent (4 at a time), not 300 simultaneous API calls.
- Image quality checks resolution and file size, not glare or camera angle.
- Age statements, appellations, vintage, formula approval, and type size are documented on TTB Guidelines but not auto-checked.
- Auth is a demo session in `sessionStorage`, not real SSO.
