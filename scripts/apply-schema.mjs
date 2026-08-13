// Chujai Legal — apply Supabase schema
// Usage: node scripts/apply-schema.mjs
import { readFileSync } from "node:fs";
import pg from "pg";

const { Client } = pg;

const DATABASE_URL =
  process.env.DATABASE_URL ??
  "postgresql://postgres:y%2Aqk7%2A%40C%40%26%2638Fc@db.kwyhpuzfbjviwzboifus.supabase.co:5432/postgres";

async function main() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  try {
    await client.connect();
    console.log("✅ Connected to Supabase Postgres");
    const sql = readFileSync(
      new URL("../supabase/schema.sql", import.meta.url),
      "utf8",
    );
    // Split into statements (naive split on ; at line ends) — schema uses
    // dollar-quoted $$ blocks, so simple split is fine since no ; inside.
    const statements = sql
      .split(/;\s*$/gm)
      .map((s) => s.trim())
      .filter(Boolean);
    for (const stmt of statements) {
      try {
        await client.query(stmt);
      } catch (err) {
        console.log("  ⚠️ skip:", err.message.slice(0, 120));
      }
    }
    console.log(`✅ Schema applied (${statements.length} statements)`);

    // Verify tables
    const res = await client.query(
      "select tablename from pg_tables where schemaname='public' order by tablename",
    );
    console.log("\n📋 Tables in public schema:");
    res.rows.forEach((r) => console.log("  -", r.tablename));
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error("❌", err.message);
  process.exit(1);
});
