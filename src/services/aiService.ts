
import { callTogetherAI } from "./togetherService";
import { Medicine, Lifestyle } from "../types";

export interface ExtractedMedInfo {
  name: string;
  dosage: string;
  type: string;
  frequency: string;
  times: string[];
  instructions: string;
  expiryDate?: string;
  stock?: number;
  confidence: {
    name: number;
    dosage: number;
    type: number;
    frequency: number;
    times: number;
    instructions: number;
    expiryDate?: number;
    stock?: number;
  };
}

export const extractMedicineInfo = async (base64Image: string, mimeType: string): Promise<ExtractedMedInfo[]> => {
  // Using llava-v1.6-13b for vision tasks.
  const messages = [
    {
      role: "user",
      content: [
        { type: "text", text: "Extract ALL medicine details from this prescription or medicine label. A prescription may contain multiple medications. For each medication, provide the name, dosage, type (pill, capsule, liquid, injection, topical), frequency, suggested reminder times (in HH:mm format), expiry date (if visible, in YYYY-MM-DD format), total stock or quantity (if visible, as a number), and any specific instructions. Also, provide a confidence score (0.0 to 1.0) for each extracted field based on how clearly it is visible in the image. Return as JSON array." },
        { type: "image_url", image_url: { url: `data:${mimeType};base64,${base64Image}` } }
      ],
    },
  ];
  
  const response = await callTogetherAI(messages, "llava-hf/llava-v1.6-mistral-7b-hf");
  try {
    return JSON.parse(response || "[]");
  } catch (error) {
    console.error("Failed to parse Together AI response:", error);
    throw new Error("Failed to extract medicine information");
  }
};

export const getMedicineRecommendations = async (name: string): Promise<Partial<ExtractedMedInfo>> => {
  const messages = [
    {
      role: "user",
      content: `Provide a recommended schedule (dosage, frequency, and times in HH:mm format) and instructions for the medicine: ${name}. Return as JSON with properties: dosage, frequency, times (array of strings), and instructions.`,
    },
  ];
  
  const response = await callTogetherAI(messages);
  try {
    return JSON.parse(response || "{}");
  } catch (error) {
    console.error("Failed to parse Together AI response:", error);
    throw new Error("Failed to get AI recommendations");
  }
};

export const getChatResponse = async (history: { role: 'user' | 'assistant', content: string }[], currentMessage: string, context: { medicines: any[], reminders: any[], currentMedicine?: string }): Promise<string> => {
  const systemInstruction = `You are Medicare AI, a helpful and knowledgeable health assistant. 
  Your goal is to help users stay on track with their medications, answer general health questions, and provide adherence tips.
  
  Current User Context:
  - Medicines: ${JSON.stringify(context.medicines)}
  - Today's Reminders: ${JSON.stringify(context.reminders)}
  ${context.currentMedicine ? `- Currently Viewing Medicine: ${context.currentMedicine}` : ''}
  
  Guidelines:
  1. Be empathetic, professional, and clear.
  2. If a user asks about missed doses, give general advice but emphasize consulting a doctor.
  3. Use the current context to provide personalized answers (e.g., "I see you have Paracetamol scheduled for 8:00 PM").
  4. Always include a disclaimer that you are an AI, not a doctor.
  5. Keep responses concise and formatted with bullet points if needed.`;

  const messages = [
    { role: "system", content: systemInstruction },
    ...history.map(h => ({ role: h.role, content: h.content })),
    { role: "user", content: currentMessage }
  ];

  return await callTogetherAI(messages);
};

export const generateLogo = async (prompt: string): Promise<string> => {
  throw new Error("Image generation not supported by this model.");
};

export interface SmartScheduleResponse {
  suggestedTimes: string[];
  reasoning: string;
  lifestyleAdjustments: string;
}

export const getSmartSchedule = async (
  medicine: Partial<Medicine>,
  lifestyle: Lifestyle
): Promise<SmartScheduleResponse> => {
  const prompt = `Suggest an optimal medication schedule for:
  Medicine: ${medicine.name} (${medicine.dosage}, ${medicine.type})
  Instructions: ${medicine.instructions}
  
  User Lifestyle:
  - Wake Time: ${lifestyle.wakeTime}
  - Sleep Time: ${lifestyle.sleepTime}
  - Breakfast: ${lifestyle.mealTimes.breakfast}
  - Lunch: ${lifestyle.mealTimes.lunch}
  - Dinner: ${lifestyle.mealTimes.dinner}
  - Activity Level: ${lifestyle.activityLevel}
  
  Provide suggested times (HH:mm format), reasoning based on absorption/efficacy, and any lifestyle adjustments. Return as JSON.`;

  const messages = [{ role: "user", content: prompt }];
  const response = await callTogetherAI(messages);
  
  try {
    return JSON.parse(response || "{}");
  } catch (error) {
    console.error("Failed to parse Together AI response:", error);
    throw new Error("Failed to generate smart schedule");
  }
};
