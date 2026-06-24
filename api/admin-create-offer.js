const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SCAN_SECRET = process.env.SCAN_SECRET;

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

function cleanText(value) {
  return typeof value === "string" ? value.trim() : "";
}

module.exports = async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ ok: false, error: "Méthode non autorisée." });
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return res.status(500).json({ ok: false, error: "Variables Supabase manquantes dans Vercel." });
    }

    const body = req.body || {};
    const { secret, offer = {} } = body;

    if (!SCAN_SECRET || secret !== SCAN_SECRET) {
      return res.status(401).json({ ok: false, error: "Secret invalide." });
    }

    const category = cleanText(offer.category) || "flash";

    const payload = {
      brand: cleanText(offer.brand) || "Enseigne à vérifier",
      title: cleanText(offer.title) || "Offre à vérifier",
      description: cleanText(offer.description) || null,
      price: cleanText(offer.price) || null,
      old_price: cleanText(offer.old_price) || null,
      badge: cleanText(offer.badge) || "Bon plan",
      badge_icon:
        category === "student"
          ? "school"
          : category === "night"
            ? "dark_mode"
            : "local_fire_department",
      category,
      city: cleanText(offer.city) || "Bordeaux",
      source_url: cleanText(offer.source_url) || null,
      source_id: `manual-${Date.now()}`,
      source_type: "manual",
      status: cleanText(offer.status) || "pending",
      confidence_score: 100,
      detected_at: new Date().toISOString(),
      last_seen_at: new Date().toISOString(),
      published_at: cleanText(offer.status) === "published" ? new Date().toISOString() : null,
      food_types: Array.isArray(offer.food_types) ? offer.food_types : ["burger"],
    };

    const response = await supabaseFetch("/rest/v1/offers", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        prefer: "return=representation",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      return res.status(response.status).json({ ok: false, error: await response.text() });
    }

    const created = await response.json();

    return res.status(200).json({ ok: true, created });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message });
  }
};