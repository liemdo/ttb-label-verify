# Design Notes & Assumptions

This document explains the rationale behind key design decisions, mapping them directly to stakeholder feedback from the discovery sessions.

## Stakeholder Feedback to Feature Mapping

### Sarah Chen (Deputy Director)
- **"My mother could figure out"**: Implemented large, touch-friendly cards, clear primary actions, and eliminated complex navigation.
- **"Batch uploads (200-300)"**: Built a batch upload pipeline handling up to 300 images with progress tracking.
- **"Needs to show value"**: Added a "Time Saved" calculator estimating manual vs. AI time, providing quantifiable metrics for leadership.

### Dave Morrison (Senior Agent, 28 years)
- **"Help me get through my queue faster"**: Implemented a "Quick Approve" / "Quick Reject" button group and global keyboard shortcuts (`A`, `R`, `N`).
- **"There's nuance, you need judgment"**: Added a manual override system for AI decisions, requiring a logged reason. Added an "Agent Notes" textarea for qualitative observations.
- **"STONE'S THROW vs Stone's Throw"**: Implemented case-insensitive fuzzy matching in `lib/validators.ts`.

### Jenny Park (Junior Agent, 8 months)
- **"Government warning must be exact"**: Built a custom text diffing engine (`lib/diff.ts`) that visually highlights exact character additions/removals in red and green.
- **"Checklist workflow"**: The UI presents results as a row-by-row checklist, mimicking her physical process. Added confidence bars so she knows where to focus her attention.
- **"Bad image quality"**: Added a pre-processing image quality check (`lib/image-quality.ts`) to warn agents if an image is too blurry/low-res before wasting API calls.

### Marcus Williams (IT Admin)
- **"Network blocks outbound traffic"**: Added Tesseract.js as an offline fallback that runs entirely in the browser (WebAssembly). 
- **"No sensitive data storage"**: State is persisted only to browser `localStorage`. No actual backend database is used for the prototype.

## Known Limitations & Trade-offs

1. **Client-side Storage**: To keep this a standalone prototype, we use `localStorage`. In production, this would be a real database.
2. **Fake Authentication**: The login system just sets a cookie/session object. It's for demonstrating multi-user flows, not actual security.
3. **Tesseract Accuracy**: Tesseract struggles with complex label layouts, curved text on bottles, and low contrast. It is provided strictly as a fallback for strict firewall environments. OpenAI GPT-4o is significantly better at this task.
4. **Confidence Scores (Tesseract)**: Tesseract's confidence scores are character-level averages and often misleading. OpenAI's confidence scores are simulated based on the model's self-assessment.

## Assumptions Made

1. We assume the "Application Data" (expected values) would eventually come from the COLA database via an API. For this prototype, we provide a form to manually input the expected data to simulate the comparison.
2. We assume agents are processing images (JPG/PNG), not PDFs.
