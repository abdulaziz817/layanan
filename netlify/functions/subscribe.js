let SUBSCRIBERS = [];

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };

  try {
    const sub = JSON.parse(event.body || "{}");
    if (!sub?.endpoint) return { statusCode: 400, body: "Invalid subscription" };

    SUBSCRIBERS = SUBSCRIBERS.filter((s) => s.endpoint !== sub.endpoint);
    SUBSCRIBERS.push(sub);

    return { statusCode: 200, body: JSON.stringify({ ok: true, total: SUBSCRIBERS.length }) };
  } catch {
    return { statusCode: 500, body: "Server error" };
  }
};
