import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

// Fallback prevents build errors on Vercel without environment variables,
// but runtime will fail if DATABASE_URL is genuinely missing.
const sql = neon(process.env.DATABASE_URL || "postgres://dummy:dummy@dummy.neon.tech/neondb");
export const db = drizzle(sql, { schema });
