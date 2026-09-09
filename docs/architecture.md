# Architecture

This document outlines the technical architecture of the AI-Powered Alcohol Label Verification App.

## System Diagram

```mermaid
graph TB
    subgraph "Frontend - Next.js App Router"
        LOGIN["/login"] --> DASH["/dashboard"]
        DASH --> VERIFY["/verify"]
        DASH --> GUIDE["/guidelines"]
        DASH --> HIST["/history"]
        DASH --> SETT["/settings"]
    end

    subgraph "Backend - Next.js API Routes"
        API["POST /api/verify"] --> ROUTER{"OCR Router"}
        ROUTER -->|AI Mode| OPENAI["OpenAI GPT-4o"]
        ROUTER -->|Network Fail| FALLBACK["Auto-suggest Tesseract"]
    end

    subgraph "Client-Side Processing"
        TESS["Tesseract.js (Web Worker)"]
    end

    subgraph "Verification Engine"
        VALID["Field Validators"]
        DIFF["Gov Warning Diff Engine"]
        TTB["TTB Rules by Beverage Type"]
    end

    VERIFY -->|AI Mode| API
    VERIFY -->|Tesseract Mode| TESS
    OPENAI --> VALID
    TESS --> VALID
    VALID --> DIFF
    TTB --> VALID
```

## Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Icons**: Lucide React
- **AI/Vision**: OpenAI API (gpt-4o)
- **Offline OCR**: Tesseract.js (WebAssembly)
- **Drag & Drop**: react-dropzone

## State Management

The application uses React Context for global state, persisted to `localStorage` (or `sessionStorage` for auth) to simulate a database for the prototype:

1. **`AuthContext`**: Manages the currently logged-in agent.
2. **`SettingsContext`**: Manages OCR engine choice, API keys, and preferences.
3. **`ResultsContext`**: Manages the history of verifications, manual overrides, agent notes, and dashboard statistics.

## Data Flow: Verification

1. **Upload**: User drops image(s). Client-side image quality check runs (`lib/image-quality.ts`).
2. **Extraction**:
   - *AI Mode*: Image sent to `/api/verify`. Server calls OpenAI Vision API with a strict JSON schema prompt.
   - *Offline Mode*: Image processed entirely in-browser via Tesseract WebWorker.
3. **Validation**: Extracted fields are passed to the Verification Engine (`lib/verification.ts`).
4. **Rules Application**: `lib/ttb-guidelines.ts` determines which fields are required based on beverage type.
5. **Diffing**: `lib/diff.ts` runs an LCS algorithm to find exact character differences in the Government Warning.
6. **Result Generation**: A `VerificationResult` object is created and saved to `ResultsContext`.

## OCR Abstraction Layer

The verification logic is decoupled from the extraction method. Both `lib/openai.ts` and `lib/tesseract.ts` must return the same `ExtractedField[]` interface. This allows seamless switching between AI and offline modes without changing downstream verification logic.
