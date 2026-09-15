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

/** Contact for the company that has an applicant portal login. */
const PORTAL_CONTACTS: Record<string, string> = {
  "Oak Barrel Distilling Co.": "Ruth Alvarez",
};

const COMPANY_DIRECTORY: Record<
  string,
  { contactName: string; contactRole: string; phone: string; email: string }
> = {
  "Oak Barrel Distilling Co.": {
    contactName: "Ruth Alvarez",
    contactRole: "Compliance Contact",
    phone: "(502) 555-0142",
    email: "ruth.alvarez@oakbarreldistilling.com",
  },
  "Napa Valley Vintners": {
    contactName: "Thomas Reed",
    contactRole: "Label Coordinator",
    phone: "(707) 555-0188",
    email: "thomas.reed@napavalleyvintners.com",
  },
  "Crafty Brews LLC": {
    contactName: "Priya Raman",
    contactRole: "Brand Manager",
    phone: "(303) 555-0114",
    email: "priya.raman@craftybrews.com",
  },
  "Highland Spirits": {
    contactName: "Callum Fraser",
    contactRole: "Regulatory Affairs",
    phone: "(859) 555-0160",
    email: "callum.fraser@highlandspirits.com",
  },
  "Blue Mountain Brewery": {
    contactName: "Nina Kowalski",
    contactRole: "Brewery Operations",
    phone: "(503) 555-0177",
    email: "nina.kowalski@bluemountainbrewery.com",
  },
  "Apex Whiskey Co.": {
    contactName: "Jordan Hale",
    contactRole: "Compliance Contact",
    phone: "(502) 555-0194",
    email: "jordan.hale@apexwhiskey.com",
  },
  "Golden State Brewers": {
    contactName: "Marcus Delgado",
    contactRole: "Brand Manager",
    phone: "(415) 555-0133",
    email: "marcus.delgado@goldenstatebrewers.com",
  },
  "Riverstone Vineyards": {
    contactName: "Claire Nguyen",
    contactRole: "Label Coordinator",
    phone: "(707) 555-0181",
    email: "claire.nguyen@riverstonevineyards.com",
  },
  "Silver Fox Distillers": {
    contactName: "Owen Briggs",
    contactRole: "Regulatory Affairs",
    phone: "(270) 555-0156",
    email: "owen.briggs@silverfoxdistillers.com",
  },
  "Sonoma Coast Wineries": {
    contactName: "Isabel Moreau",
    contactRole: "Compliance Contact",
    phone: "(707) 555-0129",
    email: "isabel.moreau@sonomacoastwineries.com",
  },
};

const AGENTS = [
  { id: "sarah-chen", name: "Sarah Chen" },
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
    COMPANIES.map((name) => {
      const contact = COMPANY_DIRECTORY[name];
      return {
        id: `company-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
        name,
        contactName: contact?.contactName ?? null,
        contactRole: contact?.contactRole ?? null,
        contactPhone: contact?.phone ?? null,
        contactEmail: contact?.email ?? null,
        createdAt: new Date(),
      };
    })
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

/** Point reviewed specialist records at the single demo specialist login. */
async function normalizeDemoLogins() {
  console.log("Ensuring Oak Barrel Distilling Co. exists for the applicant login...");
  await sql`
    INSERT INTO companies (
      id, name, contact_name, contact_role, contact_phone, contact_email, created_at
    )
    VALUES (
      'company-oak-barrel-distilling-co',
      'Oak Barrel Distilling Co.',
      'Ruth Alvarez',
      'Compliance Contact',
      '(502) 555-0142',
      'ruth.alvarez@oakbarreldistilling.com',
      now()
    )
    ON CONFLICT (name) DO UPDATE SET
      contact_name = excluded.contact_name,
      contact_role = excluded.contact_role,
      contact_phone = excluded.contact_phone,
      contact_email = excluded.contact_email
  `;

  console.log("Normalizing specialist attribution to Sarah Chen...");
  const updated = await sql`
    UPDATE verification_results
    SET agent_id = 'sarah-chen', agent_name = 'Sarah Chen'
    WHERE agent_id <> 'unassigned'
      AND coalesce(agent_name, '') <> 'Unassigned'
    RETURNING id
  `;
  console.log(`Updated ${updated.length} reviewed application(s).`);
}

const normalizeOnly = process.argv.includes("--normalize-logins");

(normalizeOnly ? normalizeDemoLogins() : seed()).catch((err) => {
  console.error(normalizeOnly ? "Normalize failed:" : "Seed failed:", err);
  process.exit(1);
});
