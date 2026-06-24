const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SCAN_SECRET = process.env.SCAN_SECRET;

const USER_AGENT = "FastOffresBot/0.1 (+https://fastoffres.fr; Vercel scanner)";
const MAX_SOURCES_PER_RUN = 10;
const FETCH_TIMEOUT_MS = 8000;

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

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

function hasFinancialSignal(text) {
  return /(-\s?\d+%|\d+\s?%|promo|promotion|offre|réduction|reduction|remise|gratuit|offert|coupon|code promo|bon plan|deal|moins cher|prix spécial|prix reduit|prix réduit|étudiant|student|mardi|jeudi|happy hour|1\s?acheté|1\s?achetée|2\s?pour\s?1|coupe du monde|world cup|\d+[,.]?\d*\s?(€|euros?))/i.test(text);
}

function hasOnlyRestaurantDescription(text) {
  return /(produits frais|viande de race|préparés avec|préparées avec|nos burgers|notre restaurant|venez découvrir|bienvenue|livraison|commande en ligne|horaires|adresse|nous contacter|halal|fait maison|qualité|saveur|délicieux)/i.test(text)
    && !hasFinancialSignal(text);
}

function extractPrice(text) {
  const match = text.match(/(?:\d+[,.]?\d*)\s?(?:€|euros?)/i);
  return match ? match[0].replace(/euros?/i, "€") : null;
}

function scoreSentence(sentence, source) {
  const lower = sentence.toLowerCase();
  let score = 0;

  if (hasOnlyRestaurantDescription(sentence)) return 0;
  if (!hasFinancialSignal(sentence)) return 0;

  for (const keyword of source.keywords || []) {
    if (lower.includes(keyword.toLowerCase())) score += 1;
  }

  if (/-\s?\d+%|\d+\s?%/i.test(sentence)) score += 8;
  if (/\d+[,.]?\d*\s?(€|euros?)/i.test(sentence)) score += 6;

  if (/(promo|promotion|réduction|reduction|remise|coupon|code promo|bon plan|deal)/i.test(sentence)) score += 7;
  if (/(gratuit|offert|1\s?acheté|1\s?achetée|2\s?pour\s?1)/i.test(sentence)) score += 7;
  if (/(étudiant|student)/i.test(sentence)) score += 6;
  if (/(mardi|jeudi|happy hour|soir|week-end|coupe du monde|world cup)/i.test(sentence)) score += 4;
  if (/(menu|formule|box|bucket|burger|pizza|tacos|sandwich)/i.test(sentence)) score += 2;

  if (lower.includes(source.brand.toLowerCase().split(" ")[0])) score += 1;

  return score;
}

function buildOfferCandidate(sentence, source) {
  const cleanSentence = sentence.replace(/\s+/g, " ").trim();
  const price = extractPrice(cleanSentence);
  const now = new Date().toISOString();

  return {
    brand: source.brand,
    title: cleanSentence.length > 72 ? `${cleanSentence.slice(0, 69).trim()}...` : cleanSentence,
    description: cleanSentence,
    price,
    old_price: null,

    badge: /étudiant|student/i.test(cleanSentence)
      ? "Étudiant"
      : /-\s?\d+%|\d+\s?%/i.test(cleanSentence)
        ? "Réduction"
        : /gratuit|offert|1\s?acheté|1\s?achetée|2\s?pour\s?1/i.test(cleanSentence)
          ? "Offert"
          : /mardi|jeudi|coupe du monde|world cup/i.test(cleanSentence)
            ? "Événement"
            : "Bon plan",

    badge_icon: /étudiant|student/i.test(cleanSentence)
      ? "school"
      : /mardi|jeudi|coupe du monde|world cup/i.test(cleanSentence)
        ? "event"
        : "local_fire_department",

    category: /étudiant|student/i.test(cleanSentence)
      ? "student"
      : /soir|happy hour|night/i.test(cleanSentence)
        ? "night"
        : hasFinancialSignal(cleanSentence)
          ? "flash"
          : "new",

    city: source.city,
    source_url: source.url,
    source_id: source.id,
    source_type: source.type,
    food_types: source.food_types || [],
    status: "pending",
    confidence_score: Math.min(100, 45 + scoreSentence(cleanSentence, source) * 8),
    detected_at: now,
    last_seen_at: now,
  };
}

async function supabaseFetch(path, options = {}) {
  return fetch(`${SUPABASE_URL.replace(/\/$/, "")}${path}`, {
    ...options,
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      ...(options.headers || {}),
    },
  });
}

async function loadSources() {
  const response = await supabaseFetch("/rest/v1/sources?enabled=eq.true&order=priority.asc");

  if (!response.ok) {
    throw new Error(`Impossible de charger les sources : ${response.status} ${await response.text()}`);
  }

  return response.json();
}

async function scanSource(source) {
 const response = await fetchWithTimeout(source.url, {
    headers: {
      "user-agent": USER_AGENT,
      accept: "text/html,application/xhtml+xml",
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} sur ${source.url}`);
  }

  const html = await response.text();
  const text = stripHtml(html);

  return splitSentences(text)
    .map((sentence) => ({
      sentence,
      score: scoreSentence(sentence, source),
    }))
    .filter((item) => item.score >= 8)
    .sort((a, b) => b.score - a.score)
    .slice(0, 2)
    .map((item) => buildOfferCandidate(item.sentence, source));
}

async function upsertOffers(offers) {
  if (offers.length === 0) return [];

  const response = await supabaseFetch("/rest/v1/offers?on_conflict=source_id,title", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      prefer: "resolution=merge-duplicates,return=representation",
    },
    body: JSON.stringify(offers),
  });

  if (!response.ok) {
    throw new Error(`Impossible d'insérer les offres : ${response.status} ${await response.text()}`);
  }

  return response.json();
}

module.exports = async function handler(req, res) {
  try {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return res.status(500).json({
        error: "Variables Supabase manquantes dans Vercel.",
      });
    }

    if (SCAN_SECRET && req.query.secret !== SCAN_SECRET) {
      return res.status(401).json({
        error: "Secret invalide.",
      });
    }

    const allSources = await loadSources();
const sources = allSources.slice(0, MAX_SOURCES_PER_RUN);
const offers = [];
const errors = [];

    for (const source of sources) {
      try {
        const found = await scanSource(source);
        offers.push(...found);
      } catch (error) {
        errors.push({
          source: source.id,
          brand: source.brand,
          message: error.message,
        });
      }
    }

    const inserted = await upsertOffers(offers);

    return res.status(200).json({
      ok: true,
      totalSourcesAvailable: allSources.length,
      scannedSources: sources.length,
      candidates: offers.length,
      inserted: inserted.length,
      errors,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error.message,
    });
  }
};