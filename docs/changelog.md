# Changelog

All notable changes to this project will be documented in this file.

## [2026-09-09] - Initial Prototype Release

### Added
- **Project Foundation**
  - Next.js 14 App Router setup with TypeScript and Tailwind CSS.
  - shadcn/ui integration for accessible components.
  - Core data types and TTB compliance constants.

- **AI & Extraction Engine**
  - OpenAI GPT-4o integration for high-accuracy vision extraction (`lib/openai.ts`).
  - Tesseract.js integration for offline, local fallback extraction (`lib/tesseract.ts`).
  - Unified extraction interface to allow seamless switching between engines.

- **Verification Logic**
  - Dynamic rule engine based on Beverage Type (Beer, Wine, Spirits).
  - Field validators with fuzzy matching for case-insensitive comparisons.
  - Custom LCS (Longest Common Subsequence) diff engine for Government Warning character-by-character comparison.
  - Client-side image quality pre-checker.

- **User Interface**
  - `Login Page`: 4 predefined agent personas simulating different roles.
  - `Dashboard Page`: Analytics, time-saved calculator, and recent activity feed.
  - `Verify Page`: Single and Batch (up to 300) upload support.
  - `Verify Results`: Side-by-side image and data checklist, confidence bars, Quick Approve actions.
  - `Manual Override`: Agent capability to override AI decisions with logged reasoning.
  - `Agent Notes`: Free-form text capture per verification.
  - `Guidelines Page`: Interactive reference for TTB rules and common rejections.
  - `History Page`: Searchable log of past verifications with CSV export.
  - `Settings Page`: Toggle between AI and Offline modes, API key management.

- **UX Enhancements**
  - Global keyboard shortcuts (`A` to approve, `R` to reject, `N` to next, `O` to override).
  - "Time Saved" metrics calculated against a 7-minute manual review baseline.
