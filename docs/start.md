# Quick Start Guide

Welcome to the AI-Powered Alcohol Label Verification prototype.

Live app: [https://ttb-label-verify-git-main-realliemdo.vercel.app/](https://ttb-label-verify-git-main-realliemdo.vercel.app/)

## Setup & Running Locally

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Configure environment variables** in `.env.local`:

   ```env
   OPENAI_API_KEY=sk-your-openai-api-key
   DATABASE_URL=postgresql://user:password@endpoint.neon.tech/neondb?sslmode=require
   BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...
   ```

   You can also enter the OpenAI key on the Settings page.

3. **Push the database schema:**

   ```bash
   npx drizzle-kit push
   ```

4. **Start the development server:**

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000).

Do not run `npm run db:seed` unless you intend to replace existing demo rows.

## Walkthrough

### 1. Login

Pick Sarah Chen (specialist) or Oak Barrel Distilling Co. (applicant). Both appear on the same login page. This is fake auth for the prototype.

![Login page with Sarah Chen and Oak Barrel Distilling Co. demo accounts](images/quickstart-login.png)

### 2. Configure Settings

Open **Settings**. Use **AI Vision (OpenAI)** unless you need the offline Tesseract fallback.

![Settings page with AI Vision selected and the Tesseract fallback option](images/quickstart-settings.png)

### 3. Verify a Label (specialist)

Open **Verify Label**.

1. Drop a label image.
2. Choose the submitting company (and contact if it is a new company).
3. Fill the **application data** fields so the tool can match form vs label. Skip comparison only if you do not have those values.
4. Click **Run Verification**.

![Verify Label page in Single mode with the image dropzone](images/quickstart-verify.png)

### 4. Review Results

- Check the field list. Green is a match; red/amber needs a decision.
- Country of origin left blank on a domestic product does not block Approve.
- Fails and warnings must be overridden or the application is rejected.
- Press `O` to override the first blocking field, `A` to approve when clear, `R` to reject when blocked.
- Government warning: wording + ALL CAPS header are checked. Bold/contrast is a visual check.

![Application detail with label image, field checks, overrides, and reject action](images/quickstart-review.png)

### 5. Batch Processing

1. Toggle **Batch Upload**.
2. Drop up to 300 images. They run a few at a time (not all at once).
3. Failed files are listed with the error. Successful rows link to the full application review.
4. Export CSV includes both successes and failures.

![Verify Label page in Batch Upload mode for up to 300 images](images/quickstart-batch.png)

### 6. Applicants and queue

- **Applications** is the review queue.
- **Applicants** lists companies with contact name, phone, email, and pending/approved/rejected counts.
- Applicant users submit from **Portal**; they confirm what the AI read before filing.

![Applications queue with status, company, and reviewer filters](images/quickstart-applications.png)

![Applicants directory with contacts and pending, approved, and rejected counts](images/quickstart-applicants.png)

![Applicant portal submissions list with status and delete actions](images/quickstart-portal.png)

![Applicant Submit a Label page, step 1 of 2](images/quickstart-submit.png)

### 7. Guidelines

**TTB Guidelines** is the reference the rules engine uses (spirits, wine, beer). Extra rules such as age statements and type size are documented there, not auto-enforced.

![TTB Guidelines for distilled spirits, including mandatory fields and the health warning](images/quickstart-guidelines.png)
