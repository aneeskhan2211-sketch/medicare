
const TOGETHER_API_KEY = process.env.TOGETHER_API_KEY;

export const callTogetherAI = async (messages: { role: string; content: string | any[] }[], model: string = "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo") => {
  if (!TOGETHER_API_KEY) {
    throw new Error("TOGETHER_API_KEY is not set");
  }

  const response = await fetch("https://api.together.xyz/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${TOGETHER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: model,
      messages: messages,
      temperature: 0.7,
      max_tokens: 1024,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error("Together AI Error:", errorData);
    throw new Error(errorData.error?.message || "Failed to get AI response");
  }

  const data = await response.json();
  return data.choices[0].message.content;
};
