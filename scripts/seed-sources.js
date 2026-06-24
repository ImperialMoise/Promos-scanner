#!/usr/bin/env node
/*
  Push data/sources.json into Supabase `sources` table.

  Usage:
    SUPABASE_URL="https://xxx.supabase.co" \
    SUPABASE_SERVICE_ROLE_KEY="..." \
    node scripts/seed-sources.js
*/

const fs = require("node:fs/promises");
const path = require("node:path");

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SOURCES_PATH = path.resolve(__dirname, "..", "data", "sources.json");

async function main() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  }

  const sources = JSON.parse(await fs.readFile(SOURCES_PATH, "utf8"));
  const endpoint = `${SUPABASE_URL.replace(/\/$/, "")}/rest/v1/sources?on_conflict=id`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      "content-type": "application/json",
      prefer: "resolution=merge-duplicates,return=representation",
    },
    body: JSON.stringify(sources),
  });

  if (!response.ok) {
    throw new Error(`Unable to seed sources: ${response.status} ${await response.text()}`);
  }

  const inserted = await response.json();
  console.log(`Seeded ${inserted.length} source(s).`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});