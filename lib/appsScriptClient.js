// lib/appsScriptClient.js

function mustGetEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

export async function callAppsScript(action, payload) {
  const url = process.env.APPS_SCRIPT_URL;
  const token = process.env.APPS_SCRIPT_TOKEN;

  if (!url) throw new Error("APPS_SCRIPT_URL belum diset di .env.local");
  if (!token) throw new Error("APPS_SCRIPT_TOKEN belum diset di .env.local");

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    // server-to-server (Next API -> Apps Script)
    body: JSON.stringify({ token, action, payload }),
  });

  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error("Apps Script response bukan JSON: " + text);
  }

  return json;
}
