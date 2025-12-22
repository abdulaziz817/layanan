export default async (request) => {
  console.log("Function hit!"); // memastikan function terpanggil

  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }

  try {
    const { messages } = await request.json();
    console.log("Messages:", messages);

    // Dummy response untuk test
    return new Response(JSON.stringify({
      reply: `Test OK. Kamu mengirim: ${messages[messages.length - 1]?.content || ""}`
    }), { status: 200 });

  } catch (err) {
    console.error("Function ERROR:", err);
    return new Response(JSON.stringify({ error: "AI error" }), { status: 500 });
  }
};
