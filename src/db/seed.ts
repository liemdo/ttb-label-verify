import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';
import * as dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load environment variables
dotenv.config({ path: '.env.local' });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required to seed the database.");
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql, { schema });

const COMPANIES = [
  "Napa Valley Vintners",
  "Oak Barrel Distilling Co.",
  "Crafty Brews LLC",
  "Highland Spirits",
  "Sonoma Coast Wineries",
  "Blue Mountain Brewery",
  "Silver Fox Distillers",
  "Riverstone Vineyards",
  "Golden State Brewers",
  "Apex Whiskey Co."
];

/** Contacts for the companies that have applicant portal logins. */
const PORTAL_CONTACTS: Record<string, string> = {
  "Oak Barrel Distilling Co.": "Ruth Alvarez",
  "Napa Valley Vintners": "Thomas Reed",
  "Crafty Brews LLC": "Priya Raman",
  "Highland Spirits": "Callum Fraser",
};

const AGENTS = [
  { id: "agent-1", name: "Sarah Chen" },
  { id: "agent-2", name: "Dave Morrison" },
  { id: "agent-3", name: "Elena Rodriguez" }
];

const BEVERAGE_TYPES = ["wine", "beer", "spirits"];

function getRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getBase64Image(beverageType: string): string {
  try {
    const filePath = join(process.cwd(), 'public', 'seed-images', `${beverageType}.jpg`);
    const fileBuffer = readFileSync(filePath);
    return `data:image/jpeg;base64,${fileBuffer.toString('base64')}`;
  } catch (error) {
    console.error(`Failed to load image for ${beverageType}:`, error);
    return "";
  }
}

async function seed() {
  console.log("Starting database seed...");

  console.log("Clearing existing verification results and companies...");
  await db.delete(schema.verificationResults);
  await db.delete(schema.companies);

  console.log(`Inserting ${COMPANIES.length} companies...`);
  await db.insert(schema.companies).values(
    COMPANIES.map((name) => ({
      id: `company-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      name,
      createdAt: new Date(),
    }))
  );

  const resultsToInsert = [];

  for (let i = 1; i <= 20; i++) {
    const beverageType = getRandom(BEVERAGE_TYPES);
    const company = getRandom(COMPANIES);
    const agent = getRandom(AGENTS);
    
    // Simulate varied verdicts
    const rand = Math.random();
    const viaPortal = i % 3 === 0;
    const verdict =
      viaPortal || rand > 0.5
        ? "pending"
        : rand > 0.25
          ? "rejected"
          : "approved";
    
    const base64Img = getBase64Image(beverageType);

    const portalContact = PORTAL_CONTACTS[company];

    resultsToInsert.push({
      id: `seed-app-${i}-${Date.now()}`,
      fileName: `applicant_label_${i}.jpg`,
      companyName: company,
      imageDataUrl: base64Img,
      beverageType: beverageType,
      overallVerdict: verdict,
      fields: [], // Dummy empty fields for seed data to keep it light
      ocrEngine: "openai",
      processingTimeMs: Math.floor(Math.random() * 2000) + 500,
      agentId: verdict === "pending" ? "unassigned" : agent.id,
      agentName: verdict === "pending" ? "Unassigned" : agent.name,
      timestamp: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)), // Random date in last 7 days
      agentNotes: verdict === "rejected" ? "Missing government warning" : null,
      timeSavedMs: Math.floor(Math.random() * 50000) + 10000,
      submissionSource: viaPortal ? "applicant" : "specialist",
      submittedByName: viaPortal ? (portalContact ?? "Compliance Contact") : null,
      reviewStatus: verdict === "pending" ? "awaiting_review" : "reviewed",
    });
  }

  console.log(`Inserting ${resultsToInsert.length} seed applicants...`);
  await db.insert(schema.verificationResults).values(resultsToInsert);

  console.log("Database seed complete!");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
