// هاد الملف كيخدم على سيرفر Netlify (ماشي فمتصفح المستخدم)
// المفتاح ديال Groq كايبقى مخبي فـ Environment Variables، ماكايبانش فالكود

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "GROQ_API_KEY ماشي معطى فـ Netlify" }),
    };
  }

  try {
    const { prompt, currentText } = JSON.parse(event.body || "{}");

    if (!prompt || !prompt.trim()) {
      return { statusCode: 400, body: JSON.stringify({ error: "خاصك تكتب شنو باغي تعاون بيه" }) };
    }

    const systemPrompt =
      "أنت مساعد كتابة إبداعي متخصص فالروايات العربية. جاوب بالعربية الفصحى أو الدارجة حسب سؤال المستخدم، وكون مختصر ومفيد ومباشر فالإبداع.";

    const userPrompt = currentText
      ? `النص اللي كتبت الحالي:\n"""${currentText.slice(-1500)}"""\n\nطلب المستخدم: ${prompt}`
      : `طلب المستخدم: ${prompt}`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 700,
        temperature: 0.9,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return { statusCode: response.status, body: JSON.stringify({ error: errText }) };
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "";

    return {
      statusCode: 200,
      body: JSON.stringify({ text }),
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
