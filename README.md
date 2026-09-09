# AI-Powered Alcohol Label Verification App

A proof-of-concept compliance tool for the TTB (Alcohol and Tobacco Tax and Trade Bureau) to automate the verification of alcohol labels against application data and federal regulations.

This prototype demonstrates how AI vision can reduce manual data entry verification while empowering compliance agents with tools for judgment, override, and offline processing.

## Key Features

- **AI Vision (OpenAI GPT-4o)**: High-accuracy extraction of label fields, handling curved text, bad lighting, and glare.
- **Offline OCR (Tesseract.js)**: A secure, firewall-friendly fallback mode that runs entirely in the browser without sending images to external APIs.
- **Government Warning Diff Engine**: Character-by-character red/green highlighting to instantly spot deviations in the mandatory health warning.
- **Batch Processing**: Handle peak-season workloads with up to 300 labels processed simultaneously.
- **Power User Tools**: Global keyboard shortcuts, Quick Approve/Reject actions, and a time-saved calculator.
- **Agent Judgment**: Manual override system with required reasoning, plus free-form agent notes per verification.

## Getting Started

### Prerequisites

- Node.js 18+
- [OpenAI API Key](https://platform.openai.com/api-keys) (for AI Mode)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd tth-rgb
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   Create a `.env.local` file in the root directory:
   ```bash
   OPENAI_API_KEY=sk-your-openai-api-key
   ```
   *Note: If you don't set this, you can also enter the API key directly in the app's Settings page.*

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Documentation

For a detailed walkthrough, architecture decisions, and notes mapping features to stakeholder feedback, please see the `docs/` folder:

- [Quick Start Guide](docs/start.md)
- [Architecture & Tech Stack](docs/architecture.md)
- [Design Notes & Assumptions](docs/notes.md)
- [Changelog](docs/changelog.md)

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **AI/Vision**: OpenAI API (gpt-4o)
- **Offline OCR**: Tesseract.js (WebAssembly)

## Deployment

The easiest way to deploy this Next.js app is to use the [Vercel Platform](https://vercel.com/new).

When deploying, ensure you add `OPENAI_API_KEY` to your environment variables in the Vercel dashboard.
