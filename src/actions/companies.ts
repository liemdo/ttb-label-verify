"use server";

import { v4 as uuidv4 } from "uuid";
import { asc, eq, ilike } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { companies, verificationResults } from "@/db/schema";
import { applicationStatus } from "@/lib/application-status";
import { companyContactFallback } from "@/lib/constants";
import type { ReviewStatus } from "@/types";

export interface Company {
  id: string;
  name: string;
  contactName: string | null;
  contactRole: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  createdAt: string;
}

export interface ApplicantDirectoryRow extends Company {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

export interface CompanyContactInput {
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  contactRole?: string;
}

type CompanyRow = typeof companies.$inferSelect;

function normalizeContact(input: CompanyContactInput) {
  const contactName = input.contactName.trim();
  const contactPhone = input.contactPhone.trim();
  const contactEmail = input.contactEmail.trim();
  const contactRole = input.contactRole?.trim() || null;

  if (!contactName) throw new Error("Contact person is required");
  if (!contactPhone) throw new Error("Phone number is required");
  if (!contactEmail) throw new Error("Email is required");
  if (!contactEmail.includes("@")) throw new Error("Enter a valid email address");

  return { contactName, contactPhone, contactEmail, contactRole };
}

function toCompany(row: CompanyRow): Company {
  const fallback = companyContactFallback(row.name);
  return {
    id: row.id,
    name: row.name,
    contactName: row.contactName?.trim() || fallback?.contactName || null,
    contactRole: row.contactRole?.trim() || fallback?.contactRole || null,
    contactPhone: row.contactPhone?.trim() || fallback?.phone || null,
    contactEmail: row.contactEmail?.trim() || fallback?.email || null,
    createdAt: row.createdAt.toISOString(),
  };
}

function revalidateCompanyViews() {
  revalidatePath("/applicants");
  revalidatePath("/applications");
  revalidatePath("/verify");
}

export async function fetchCompanyByNameAction(
  name: string
): Promise<Company | null> {
  const trimmed = name.trim();
  if (!trimmed) return null;

  try {
    const rows = await db
      .select()
      .from(companies)
      .where(ilike(companies.name, trimmed))
      .limit(1);

    if (rows.length === 0) return null;
    return toCompany(rows[0]);
  } catch (error) {
    console.error("Failed to fetch company:", error);
    return null;
  }
}

export async function fetchCompaniesAction(): Promise<Company[]> {
  try {
    const rows = await db
      .select()
      .from(companies)
      .orderBy(asc(companies.name));

    return rows.map(toCompany);
  } catch (error) {
    console.error("Failed to fetch companies:", error);
    return [];
  }
}

export async function fetchApplicantDirectoryAction(): Promise<
  ApplicantDirectoryRow[]
> {
  try {
    const [rows, results] = await Promise.all([
      db.select().from(companies).orderBy(asc(companies.name)),
      db
        .select({
          companyName: verificationResults.companyName,
          overallVerdict: verificationResults.overallVerdict,
          reviewStatus: verificationResults.reviewStatus,
        })
        .from(verificationResults),
    ]);

    const statsByCompany = new Map<
      string,
      { total: number; pending: number; approved: number; rejected: number }
    >();

    for (const result of results) {
      const key = result.companyName.trim().toLowerCase();
      const current = statsByCompany.get(key) ?? {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
      };
      current.total += 1;
      const status = applicationStatus({
        overallVerdict: result.overallVerdict,
        reviewStatus: result.reviewStatus as ReviewStatus,
      });
      current[status] += 1;
      statsByCompany.set(key, current);
    }

    return rows.map((row) => {
      const company = toCompany(row);
      const stats = statsByCompany.get(company.name.trim().toLowerCase()) ?? {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
      };
      return { ...company, ...stats };
    });
  } catch (error) {
    console.error("Failed to fetch applicant directory:", error);
    return [];
  }
}

/**
 * Find an existing company by name (case-insensitive) or create a new one.
 */
export async function ensureCompanyAction(
  name: string,
  contact?: CompanyContactInput
): Promise<Company> {
  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error("Company name is required");
  }

  const existing = await db
    .select()
    .from(companies)
    .where(ilike(companies.name, trimmed))
    .limit(1);

  if (existing.length > 0) {
    const current = existing[0];
    if (contact && (!current.contactName || !current.contactPhone || !current.contactEmail)) {
      const normalized = normalizeContact(contact);
      const filled = {
        contactName: current.contactName || normalized.contactName,
        contactRole: current.contactRole || normalized.contactRole,
        contactPhone: current.contactPhone || normalized.contactPhone,
        contactEmail: current.contactEmail || normalized.contactEmail,
      };
      await db.update(companies).set(filled).where(eq(companies.id, current.id));
      revalidateCompanyViews();
      return toCompany({ ...current, ...filled });
    }
    return toCompany(current);
  }

  const normalized = contact
    ? normalizeContact(contact)
    : {
        contactName: null,
        contactPhone: null,
        contactEmail: null,
        contactRole: null,
      };

  const created = {
    id: uuidv4(),
    name: trimmed,
    ...normalized,
    createdAt: new Date(),
  };

  await db.insert(companies).values(created);
  revalidateCompanyViews();

  return toCompany(created);
}

export async function createApplicantAction(input: {
  name: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  contactRole?: string;
}): Promise<ApplicantDirectoryRow> {
  const name = input.name.trim();
  if (!name) {
    throw new Error("Company name is required");
  }

  const contact = normalizeContact(input);

  const existing = await db
    .select()
    .from(companies)
    .where(ilike(companies.name, name))
    .limit(1);

  if (existing.length > 0) {
    throw new Error("An applicant with this company name already exists");
  }

  const created = {
    id: uuidv4(),
    name,
    ...contact,
    createdAt: new Date(),
  };

  await db.insert(companies).values(created);
  revalidateCompanyViews();

  return {
    ...toCompany(created),
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  };
}
