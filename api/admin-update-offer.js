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
      return res.status(405).json({
        ok: false,
        error: "Méthode non autorisée.",
      });
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return res.status(500).json({
        ok: false,
        error: "Variables Supabase manquantes dans Vercel.",
      });
    }

    const body = req.body || {};
    const { secret, id, action, edits = {} } = body;

    if (!SCAN_SECRET || secret !== SCAN_SECRET) {
      return res.status(401).json({
        ok: false,
        error: "Secret invalide.",
      });
    }

    if (!id || !["save", "publish", "reject"].includes(action)) {
      return res.status(400).json({
        ok: false,
        error: "Paramètres invalides.",
      });
    }

    const allowedCategories = ["flash", "student", "night", "new"];
    const allowedBadges = {
      flash: { badge: "Flash", badge_icon: "local_fire_department" },
      student: { badge: "Étudiant", badge_icon: "school" },
      night: { badge: "Soir", badge_icon: "dark_mode" },
      new: { badge: "Nouveau", badge_icon: "auto_awesome" },
    };

    const payload = {
      updated_at: new Date().toISOString(),
    };

    if (action === "save" || action === "publish") {
      const category = allowedCategories.includes(edits.category) ? edits.category : "new";
      const badgePreset = allowedBadges[category];

      payload.title = cleanText(edits.title) || "Offre à vérifier";
      payload.description = cleanText(edits.description) || null;
      payload.price = cleanText(edits.price) || null;
      payload.old_price = cleanText(edits.old_price) || null;
      payload.category = category;
      payload.badge = cleanText(edits.badge) || badgePreset.badge;
      payload.badge_icon = badgePreset.badge_icon;
      payload.source_url = cleanText(edits.source_url) || null;
      payload.confidence_score = 100;
    }

    if (action === "publish") {
      payload.status = "published";
      payload.published_at = new Date().toISOString();
    }

    if (action === "reject") {
      payload.status = "rejected";
    }

    const response = await supabaseFetch(`/rest/v1/offers?id=eq.${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
        prefer: "return=representation",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      return res.status(response.status).json({
        ok: false,
        error: await response.text(),
      });
    }

    const updated = await response.json();

    return res.status(200).json({
      ok: true,
      updated,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error.message,
    });
  }
};