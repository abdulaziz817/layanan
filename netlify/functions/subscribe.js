const fs = require("fs");
const path = require("path");

const SUBS_PATH = path.join(__dirname, "_subs.json");

function readSubs() {
  try {
    return JSON.parse(fs.readFileSync(SUBS_PATH, "utf8"));
  } catch {
    return [];
  }
}

function writeSubs(subs) {
  fs.writeFileSync(SUBS_PATH, JSON.stringify(subs, null, 2));
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const sub = JSON.parse(event.body || "{}");
    if (!sub?.endpoint) {
      return { statusCode: 400, body: "Invalid subscription" };
    }

    const subs = readSubs();

    // biar nggak dobel
    const exists = subs.some((s) => s.endpoint === sub.endpoint);
    if (!exists) {
      subs.push(sub);
      writeSubs(subs);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true, total: subs.length }),
    };
  } catch (e) {
    return { statusCode: 500, body: "Server error" };
  }
};
