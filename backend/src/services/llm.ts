import Groq from "groq-sdk";

type Role = "system" | "user" | "assistant";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const SYSTEM_PROMPT = `
You are a helpful support agent for a small e-commerce store.

Policies:
- Shipping: Ships in 2-3 business days. Delivery: India 3-5 days, international 7-14 days.
- Returns: 7-day return window for unused items. Refunds in 5 business days.
- Support hours: Mon–Fri, 9am–6pm IST.

Answer clearly and concisely.
`;

export async function generateReply(
  history: { sender: "user" | "ai"; text: string }[],
  userMessage: string
): Promise<string> {
  try {
    const messages: { role: Role; content: string }[] = [
      { role: "system", content: SYSTEM_PROMPT },
      ...history.map((m) => ({
        role: (m.sender === "user" ? "user" : "assistant") as Role,
        content: m.text,
      })),
      { role: "user", content: userMessage },
    ];

    const res = await groq.chat.completions.create({
      model: "openai/gpt-oss-20b",
      messages,
      temperature: 0.3,
      max_tokens: 300,
    });

    return (
      res.choices[0]?.message?.content ??
      "Sorry, I couldn't generate a response."
    );
  } catch (err) {
    console.error("Groq LLM error:", err);
    throw new Error("LLM_FAILED");
  }
}
