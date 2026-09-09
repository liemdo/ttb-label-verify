# Quick Start Guide

Welcome to the AI-Powered Alcohol Label Verification App prototype.

## Setup & Running Locally

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure API Key (Required for AI Mode):**
   Create a `.env.local` file in the root directory:
   ```env
   OPENAI_API_KEY=sk-your-openai-api-key
   ```
   *(Alternatively, you can enter the key directly in the app's Settings page).*

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Walkthrough

### 1. Login
Select an agent profile. We recommend **Sarah Chen** (Supervisor) or **Dave Morrison** (Senior Agent).

*(Screenshot placeholder: Login Screen)*

### 2. Configure Settings
Navigate to **Settings** in the sidebar.
- Ensure **AI Vision (OpenAI)** is selected.
- If you didn't set `.env.local`, paste your API key here and click **Save**.

### 3. Verify a Label
Navigate to **Verify Label**.
1. Drag and drop a label image.
2. (Optional) Enter expected application data in the form on the right (e.g., Brand Name, Alcohol Content).
3. Click **Run Verification**.

*(Screenshot placeholder: Verify Screen - Upload State)*

### 4. Review Results
- Notice the **Time Saved** metric at the top.
- Review the **Field Checklist**. Green indicates a match, red indicates a failure.
- Look at the **Government Warning** section to see character-by-character diffs if the warning is incorrect.
- Click the **pencil icon** next to a field to manually override the AI's decision.
- Use the **Quick Approve** button (or press `A`) if everything looks good.

*(Screenshot placeholder: Verify Screen - Results State)*

### 5. Batch Processing
1. On the Verify page, click the **Batch Upload** toggle.
2. Drop multiple images (up to 300).
3. Click **Verify X Labels**.
4. Review the summary list, expand individual rows, or export to CSV.

### 6. Review Guidelines
Navigate to **TTB Guidelines** to see the reference material the AI is using to make its decisions.
