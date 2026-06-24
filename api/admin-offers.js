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
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return res.status(500).json({
        ok: false,
        error: "Variables Supabase manquantes dans Vercel.",
      });
    }

    if (!SCAN_SECRET || req.query.secret !== SCAN_SECRET) {
      return res.status(401).json({
        ok: false,
        error: "Secret invalide.",
      });
    }

    const response = await supabaseFetch(
      "/rest/v1/offers?status=eq.pending&select=id,brand,title,description,price,old_price,badge,category,city,source_url,confidence_score,detected_at&order=detected_at.desc&limit=50"
    );

    if (!response.ok) {
      return res.status(response.status).json({
        ok: false,
        error: await response.text(),
      });
    }

    const offers = await response.json();

    return res.status(200).json({
      ok: true,
      offers,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error.message,
    });
  }
};