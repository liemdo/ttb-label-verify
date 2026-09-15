# Design Notes & Assumptions

This document explains the rationale behind key design decisions, mapping them to stakeholder feedback from the discovery sessions.

## Stakeholder Feedback to Feature Mapping

### Sarah Chen (Deputy Director)

- **"My mother could figure out"**: Large primary actions, a single Approve or Reject footer, and a table queue instead of hunting for buttons.
- **"Batch uploads (200-300)"**: Batch upload up to 300 images, processed a few at a time with progress and per-file errors.
- **"If we can't get results back in about 5 seconds"**: Processing time is displayed. Times over 5 seconds are flagged. There is no hard timeout, because aborting a nearly-finished OpenAI call would waste the work.
- **"Matching" is the job**: Specialist Verify defaults to comparing application data to the label. Skip comparison is explicit.

### Dave Morrison (Senior Agent, 28 years)

- **"Help me get through my queue faster"**: One decision button, keyboard shortcuts (`A`, `R`, `O`, `N`).
- **"There's nuance, you need judgment"**: Override with a reason, plus agent notes. Approve is not blocked by optional fields the AI did not need to check.
- **"STONE'S THROW vs Stone's Throw"**: Case-insensitive normalize, then Levenshtein similarity — not positional character matching.

### Jenny Park (Junior Agent, 8 months)

- **"Government warning must be exact"**: Wording compare plus ALL CAPS header, with a character diff.
- **"All caps and bold"**: Caps are enforced. Bold and contrast cannot be read reliably from OCR, so they stay an agent visual check (called out on Guidelines and the warning panel).
- **"Checklist workflow"**: Field rows with status and confidence.
- **"Bad image quality"**: Pre-check for low resolution and tiny/huge files. Glare and camera angle are not measured; the OpenAI prompt asks the model to try anyway.

### Marcus Williams (IT Admin)

- **"Network blocks outbound traffic"**: Tesseract.js in the browser, with a prompt to switch when OpenAI is unreachable.
- **"No sensitive data" for the prototype**: Demo auth only. The app does store label images in Blob and company contacts (name, phone, email) so the applicants directory works. That is a documented trade-off for a usable demo, not a production privacy design.
- **Standalone POC**: No COLA integration.

## Known Limitations & Trade-offs

1. **Demo auth**: Login stores a session object. Not real security.
2. **5-second SLA**: Often missed with GPT-4o high-detail vision plus image upload. Shown, not enforced.
3. **Tesseract accuracy**: Weak on curved bottle text and low contrast. Fallback only.
4. **Formatting rules not auto-checked**: Type size, contrasting background, age statement, appellation, vintage, formula approval.
5. **Wine/beer ABV exceptions**: Documented in Guidelines; the form still treats ABV as required when comparing.
6. **Images only**: JPG, PNG, WebP. Not PDFs.
7. **Applicant portal**: Extra vs the original brief. Applicants confirm AI reads rather than typing the full form first.

## Assumptions Made

1. Application data would eventually come from COLA. Here, specialists type it (or applicants confirm what the AI read).
2. Agents process still images, not PDFs or multi-page scans.
3. Country of origin is required only for imports; a blank domestic field should not block Approve.
