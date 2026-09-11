"use server";

import { v4 as uuidv4 } from "uuid";
import { asc, eq, ilike } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { companies } from "@/db/schema";

export interface Company {
  id: string;
  name: string;
  createdAt: string;
}

export async function fetchCompaniesAction(): Promise<Company[]> {
  try {
    const rows = await db
      .select()
      .from(companies)
      .orderBy(asc(companies.name));

    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      createdAt: r.createdAt.toISOString(),
    }));
  } catch (error) {
    console.error("Failed to fetch companies:", error);
    return [];
  }
}

/**
 * Find an existing company by name (case-insensitive) or create a new one.
 */
export async function ensureCompanyAction(name: string): Promise<Company> {
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
    const r = existing[0];
    return {
      id: r.id,
      name: r.name,
      createdAt: r.createdAt.toISOString(),
    };
  }

  const created = {
    id: uuidv4(),
    name: trimmed,
    createdAt: new Date(),
  };

  await db.insert(companies).values(created);
  revalidatePath("/applications");
  revalidatePath("/verify");

  return {
    id: created.id,
    name: created.name,
    createdAt: created.createdAt.toISOString(),
  };
}
