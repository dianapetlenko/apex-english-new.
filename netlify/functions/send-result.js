export default async (request) => {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ success: false, error: "Method not allowed" }), {
      status: 405, headers: { "Content-Type": "application/json" }
    });
  }
  try {
    const data = await request.json();
    const token = Netlify.env.get("TELEGRAM_BOT_TOKEN");
    const chatId = Netlify.env.get("TELEGRAM_CHAT_ID");
    if (!token || !chatId) throw new Error("Telegram settings are missing");
    const clean = (v, max=160) => String(v ?? "").replace(/[<>]/g, "").slice(0,max);
    const message = [
      "🎓 Новий результат тесту Apex", "",
      `Ім’я: ${clean(data.name) || "Не вказано"}`,
      `Instagram: ${clean(data.instagram) || "Не вказано"}`,
      `Рівень: ${clean(data.level,4)}`,
      `Бали: ${Number(data.score)||0} з ${Number(data.total)||30}`
    ].join("\n");
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method:"POST", headers:{"Content-Type":"application/json"},
      body:JSON.stringify({chat_id:chatId,text:message})
    });
    const payload = await res.json();
    if (!res.ok || !payload.ok) throw new Error("Telegram delivery failed");
    return new Response(JSON.stringify({success:true}), {
      status:200, headers:{"Content-Type":"application/json"}
    });
  } catch (err) {
    return new Response(JSON.stringify({success:false,error:err.message}), {
      status:500, headers:{"Content-Type":"application/json"}
    });
  }
};
