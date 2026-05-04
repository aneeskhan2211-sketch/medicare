
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const callGemini = async (messages: any[], model: string = "gemini-3-flash-preview") => {
  const contents = messages.map(m => {
    if (typeof m.content === 'string') {
        return {
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }]
        };
    }
    // Handle multimodal/complex content if needed
    return {
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: m.content.map((c: any) => {
            if (c.type === 'text') return { text: c.text };
            if (c.type === 'image_url') {
                const base64 = c.image_url.url.split(',')[1];
                const mimeType = c.image_url.url.split(';')[0].split(':')[1];
                return { inlineData: { data: base64, mimeType } };
            }
            return { text: '' };
        })
    };
  });

  // Extract system message if any
  const systemMessage = messages.find(m => m.role === 'system');
  const systemInstruction = systemMessage ? (typeof systemMessage.content === 'string' ? systemMessage.content : '') : undefined;
  
  // Filter out system message from contents
  const filteredContents = contents.filter(c => messages[contents.indexOf(c)].role !== 'system');

  try {
    const response = await ai.models.generateContent({
      model,
      contents: filteredContents,
      config: systemInstruction ? { systemInstruction } : undefined
    });

    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
