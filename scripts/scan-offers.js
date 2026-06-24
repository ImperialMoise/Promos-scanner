#!/usr/bin/env node
/*
  FastOffres hybrid scanner.

  Goal:
  - Fetch public official pages from data/sources.json.
  - Detect likely offer snippets using keywords and price patterns.
  - Save them to Supabase as `pending` offers when SUPABASE_URL and
    SUPABASE_SERVICE_ROLE_KEY are provided.
  - Otherwise print the detected payload so you can test locally first.

  Required Supabase tables are documented in supabase/schema.sql.
*/

const fs = require("node:fs/promises");
const path = require("node:path");

const ROOT_DIR = path.resolve(__dirname, "..");
const SOURCES_PATH = path.join(ROOT_DIR, "data", "sources.json");
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const USER_AGENT = "FastOffresBot/0.1 (+https://fastoffres.fr; MVP public-page scanner)";

function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&euro;/g, "€")
    .replace(/\s+/g, " ")
    .trim();
}

function splitSentences(text) {
  return text
    .split(/(?<=[.!?])\s+|\s{2,}|\n+/)
    .map((part) => part.trim())
    .filter((part) => part.length >= 24 && part.length <= 260);
}

function extractPrice(text) {
  const match = text.match(/(?:\d+[,.]?\d*)\s?(?:€|euros?)/i);
  return match ? match[0].replace(/euros?/i, "€") : null;
}

function scoreSentence(sentence, source) {
  const lower = sentence.toLowerCase();
  let score = 0;

  for (const keyword of source.keywords || []) {
    if (lower.includes(keyword.toLowerCase())) score += 2;
  }

  if (/\d+[,.]?\d*\s?(€|euros?)/i.test(sentence)) score += 3;
  if (/(offre|promo|deal|menu|réduction|reduction|gratuit|mardi|jeudi|étudiant|student|coupon|code|fidélité|app|livraison|formule)/i.test(sentence)) score += 2;
  if (lower.includes(source.brand.toLowerCase().split(" ")[0])) score += 1;

  return score;
}

function buildOfferCandidate(sentence, source) {
  const price = extractPrice(sentence);
  const title = sentence.length > 72 ? `${sentence.slice(0, 69).trim()}...` : sentence;

  return {
    brand: source.brand,
    title,
    description: sentence,
    price,
    old_price: null,
    badge: price ? "Offre détectée" : "À vérifier",
    badge_icon: price ? "local_fire_department" : "visibility",
    category: price ? "flash" : "new",
    city: source.city,
    source_url: source.url,
    source_id: source.id,
    source_type: source.type,
    status: "pending",
    confidence_score: Math.min(100, 45 + scoreSentence(sentence, source) * 8),
    detected_at: new Date().toISOString(),
    last_seen_at: new Date().toISOString(),
  };
}

async function fetchSource(source) {
  const response = await fetch(source.url, {
    headers: {
      "user-agent": USER_AGENT,
      accept: "text/html,application/xhtml+xml",
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} while fetching ${source.url}`);
  }

  return response.text();
}

async function scanSource(source) {
  const html = await fetchSource(source);
  const text = stripHtml(html);
  const sentences = splitSentences(text);

  const candidates = sentences
    .map((sentence) => ({ sentence, score: scoreSentence(sentence, source) }))
    .filter((item) => item.score >= 4)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((item) => buildOfferCandidate(item.sentence, source));

  return candidates;
}

async function upsertOffers(offers) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.log(JSON.stringify({ mode: "dry-run", offers }, null, 2));
    return;
  }

  const endpoint = `${SUPABASE_URL.replace(/\/$/, "")}/rest/v1/offers?on_conflict=source_id,title`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      "content-type": "application/json",
      prefer: "resolution=merge-duplicates,return=representation",
    },
    body: JSON.stringify(offers),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Supabase insert failed: ${response.status} ${body}`);
  }

  const inserted = await response.json();
  console.log(JSON.stringify({ mode: "supabase", inserted: inserted.length }, null, 2));
}

async function main() {
  const sources = JSON.parse(await fs.readFile(SOURCES_PATH, "utf8"))
    .filter((source) => source.enabled)
    .sort((a, b) => a.priority - b.priority);

  const allOffers = [];

  for (const source of sources) {
    try {
      const offers = await scanSource(source);
      allOffers.push(...offers);
      console.log(`[scan] ${source.brand}: ${offers.length} candidate(s)`);
    } catch (error) {
      console.error(`[scan] ${source.brand}: ${error.message}`);
    }
  }

  await upsertOffers(allOffers);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});