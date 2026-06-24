type Source = {
  id: string;
  brand: string;
  city: string;
  url: string;
  type: string;
  priority: number;
  enabled: boolean;
  keywords: string[];
};

type Offer = {
  brand: string;
  title: string;
  description: string;
  price: string | null;
  old_price: string | null;
  badge: string;
  badge_icon: string;
  category: string;
  city: string;
  source_url: string;
  source_id: string;
  source_type: string;
  status: "pending";
  confidence_score: number;
  detected_at: string;
  last_seen_at: string;
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const USER_AGENT = "FastOffresBot/0.1 (+https://fastoffres.fr; Supabase Edge Scanner)";

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

function stripHtml(html: string) {
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

function splitSentences(text: string) {
  return text
    .split(/(?<=[.!?])\s+|\s{2,}|\n+/)
    .map((part) => part.trim())
    .filter((part) => part.length >= 24 && part.length <= 260);
}

function extractPrice(text: string) {
  const match = text.match(/(?:\d+[,.]?\d*)\s?(?:€|euros?)/i);
  return match ? match[0].replace(/euros?/i, "€") : null;
}

function scoreSentence(sentence: string, source: Source) {
  const lower = sentence.toLowerCase();
  let score = 0;

  for (const keyword of source.keywords ?? []) {
    if (lower.includes(keyword.toLowerCase())) score += 2;
  }

  if (/\d+[,.]?\d*\s?(€|euros?)/i.test(sentence)) score += 3;
  if (/(offre|promo|deal|menu|réduction|reduction|gratuit|mardi|jeudi)/i.test(sentence)) score += 2;
  if (lower.includes(source.brand.toLowerCase().split(" ")[0])) score += 1;

  return score;
}

function buildOfferCandidate(sentence: string, source: Source): Offer {
  const price = extractPrice(sentence);
  const now = new Date().toISOString();

  return {
    brand: source.brand,
    title: sentence.length > 72 ? `${sentence.slice(0, 69).trim()}...` : sentence,
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
    detected_at: now,
    last_seen_at: now,
  };
}

async function supabaseFetch(path: string, init: RequestInit = {}) {
  return fetch(`${SUPABASE_URL.replace(/\/$/, "")}${path}`, {
    ...init,
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      ...(init.headers ?? {}),
    },
  });
}

async function loadSources() {
  const response = await supabaseFetch("/rest/v1/sources?enabled=eq.true&order=priority.asc");
  if (!response.ok) throw new Error(`Unable to load sources: ${response.status} ${await response.text()}`);
  return response.json() as Promise<Source[]>;
}

async function scanSource(source: Source) {
  const response = await fetch(source.url, {
    headers: {
      "user-agent": USER_AGENT,
      accept: "text/html,application/xhtml+xml",
    },
  });

  if (!response.ok) throw new Error(`HTTP ${response.status} while fetching ${source.url}`);

  const text = stripHtml(await response.text());
  return splitSentences(text)
    .map((sentence) => ({ sentence, score: scoreSentence(sentence, source) }))
    .filter((item) => item.score >= 4)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((item) => buildOfferCandidate(item.sentence, source));
}

async function upsertOffers(offers: Offer[]) {
  if (offers.length === 0) return [];

  const response = await supabaseFetch("/rest/v1/offers?on_conflict=source_id,title", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      prefer: "resolution=merge-duplicates,return=representation",
    },
    body: JSON.stringify(offers),
  });

  if (!response.ok) throw new Error(`Unable to upsert offers: ${response.status} ${await response.text()}`);
  return response.json();
}

Deno.serve(async () => {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return jsonResponse({ error: "Missing Supabase environment variables." }, 500);
  }

  const sources = await loadSources();
  const offers: Offer[] = [];
  const errors: Array<{ source: string; message: string }> = [];

  for (const source of sources) {
    try {
      offers.push(...await scanSource(source));
    } catch (error) {
      errors.push({ source: source.id, message: error instanceof Error ? error.message : String(error) });
    }
  }

  const inserted = await upsertOffers(offers);
  return jsonResponse({ scannedSources: sources.length, candidates: offers.length, inserted: inserted.length, errors });
});