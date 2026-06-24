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
    const { secret, id, action } = body;

    if (!SCAN_SECRET || secret !== SCAN_SECRET) {
      return res.status(401).json({
        ok: false,
        error: "Secret invalide.",
      });
    }

    if (!id || !["publish", "reject"].includes(action)) {
      return res.status(400).json({
        ok: false,
        error: "Paramètres invalides.",
      });
    }

    const nextStatus = action === "publish" ? "published" : "rejected";

    const payload = {
      status: nextStatus,
      updated_at: new Date().toISOString(),
    };

    if (action === "publish") {
      payload.published_at = new Date().toISOString();
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