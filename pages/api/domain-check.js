// pages/api/domain-check.js

export default async function handler(req, res) {
  try {
    const domainRaw = String(req.query.domain || "").trim().toLowerCase();

    // basic sanitization: hanya huruf/angka/dot/dash
    const domain = domainRaw.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
    const isValid = /^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(domain);

    if (!isValid) {
      return res.status(400).json({ ok: false, status: "unknown", message: "Domain tidak valid." });
    }

    // timeout helper
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 8000);

    // RDAP lookup
    const rdapUrl = `https://rdap.org/domain/${encodeURIComponent(domain)}`;
    const resp = await fetch(rdapUrl, {
      method: "GET",
      signal: controller.signal,
      headers: { "accept": "application/rdap+json, application/json" },
      redirect: "follow",
    });

    clearTimeout(t);

    if (resp.status === 200) {
      return res.status(200).json({ ok: true, status: "taken" });
    }

    if (resp.status === 404) {
      return res.status(200).json({ ok: true, status: "available" });
    }

    // kadang 429/5xx
    return res.status(200).json({ ok: true, status: "unknown" });
  } catch (e) {
    return res.status(200).json({ ok: true, status: "unknown" });
  }
}