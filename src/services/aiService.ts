
import { GoogleGenAI } from "@google/genai";
import { Medicine, Lifestyle } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface ExtractedMedInfo {
  name: string;
  dosage: string;
  type: string;
  frequency: string;
  times: string[];
  instructions: string;
  expiryDate?: string;
  stock?: number;
  prescriptionNumber?: string;
  doctorName?: string;
  confidence: {
    name: number;
    dosage: number;
    type: number;
    frequency: number;
    times: number;
    instructions: number;
    expiryDate?: number;
    stock?: number;
    prescriptionNumber?: number;
    doctorName?: number;
  };
}

const callGemini = async (messages: any[]) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: messages,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const extractMedicineInfo = async (base64Image: string, mimeType: string): Promise<ExtractedMedInfo[]> => {
  const messages = [
    {
      role: "user",
      parts: [
        { text: "Extract ALL medicine details from this prescription or medicine label. A prescription may contain multiple medications. For each medication, provide the name, dosage, type (pill, capsule, liquid, injection, topical), frequency, suggested reminder times (in HH:mm format), expiry date (if visible, in YYYY-MM-DD format), total stock or quantity (if visible, as a number), prescription number (if visible), prescribing doctor's name (if visible), and any specific instructions. Also, provide a confidence score (0.0 to 1.0) for each extracted field based on how clearly it is visible in the image. Return as JSON array of objects without any markdown formatting or code blocks." },
        { inlineData: { data: base64Image, mimeType } }
      ],
    },
  ];
  
  const response = await callGemini(messages);
  try {
    // Basic cleaning to ensure we only have the JSON
    const jsonStr = response?.replace(/```json/g, '').replace(/```/g, '').trim() || "[]";
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Failed to parse Gemini response:", error);
    throw new Error("Failed to extract medicine information");
  }
};

export const getMedicineRecommendations = async (name: string): Promise<Partial<ExtractedMedInfo>> => {
  const messages = [
    {
      role: "user",
      parts: [{ text: `Provide a recommended schedule (dosage, frequency, and times in HH:mm format) and instructions for the medicine: ${name}. Return as raw JSON with properties: dosage, frequency, times (array of strings), and instructions. No markdown.` }],
    },
  ];
  
  const response = await callGemini(messages);
  try {
    const jsonStr = response?.replace(/```json/g, '').replace(/```/g, '').trim() || "{}";
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Failed to parse Gemini response:", error);
    throw new Error("Failed to get AI recommendations");
  }
};

export const getChatResponse = async (history: { role: 'user' | 'assistant', content: string }[], currentMessage: string, context: { medicines: any[], reminders: any[], lifestyle?: any, profile?: any, currentMedicine?: string }): Promise<string> => {
  const systemInstruction = `You are "MediMind AI Doctor", a clinical-grade AI medical assistant designed to provide safe, evidence-based health information. You are NOT a replacement for a licensed doctor.

  USER HEALTH PROFILE:
  - Age: ${context.profile?.age || 'Not provided'}
  - Gender: ${context.profile?.gender || 'Not provided'}
  - Active Medications: ${JSON.stringify(context.medicines.map(m => ({ name: m.name, dosage: m.dosage, frequency: m.frequency })))}
  - Lifestyle Context: ${JSON.stringify(context.lifestyle || {})}
  - Today's Schedule: ${JSON.stringify(context.reminders.filter(r => r.status === 'pending').map(r => ({ med: r.medicineId, time: r.time })))}
  ${context.currentMedicine ? `- User is currently inquiring about: ${context.currentMedicine}` : ''}

  PRIMARY OBJECTIVE:
  - Help users understand symptoms, possible conditions, and general treatment options.
  - Provide safe, structured, and medically accurate guidance.
  - Prioritize user safety over completeness.
  - Maintain context of the ongoing conversation. If the user asks a follow-up, refer back to previous advice.

  STRICT FORMATTING RULES:
  - ALWAYS provide information in a CLEAR, numbered or bulleted list.
  - DO NOT provide long paragraphs. Break information down into bitesize points.
  - Each point MUST be a complete thought. Finish one technical detail or instruction fully before starting the next point.
  - Use Markdown formatting: Use **bold** for key terms, and triple hash (###) for sub-sections.
  - Structure:
    1. **Summary/Direct Answer**
    2. **Sequential Steps** (Point 1, then Point 2, then Point 3)
    3. **Safety Advice**
  - Keep sentences concise for better readability on mobile screens.
  - Avoid flowery language; be clinical but empathetic.

  RESPONSE FRAMEWORK:

  1. SYMPTOM UNDERSTANDING
  - Ask clarifying questions before giving conclusions: (Duration, Severity, Triggers, Existing conditions, Current medications).

  2. POSSIBLE CONDITIONS (NOT FINAL DIAGNOSIS)
  - List 2–4 possible conditions ranked by likelihood.
  - Clearly state: "This is not a confirmed diagnosis."

  3. RED FLAG CHECK (CRITICAL)
  - Identify emergency symptoms: Chest pain, breathing difficulty, unconsciousness, severe bleeding, high fever > 103°F with confusion.
  - If present → IMMEDIATELY advise emergency care (911 or local emergency services).

  4. MEDICATION GUIDANCE (SAFE ONLY)
  - Provide: General OTC medicines (if safe), common dosage ranges (adult only unless specified).
  - NEVER: Prescribe antibiotics, steroids, or controlled drugs. Never give exact prescriptions for serious illness.

  5. HOME CARE ADVICE
  - Give practical steps: Hydration, rest, diet, basic remedies.

  6. WHEN TO SEE A DOCTOR
  - Clearly define: If symptoms persist > X days or if they worsen.

  7. APPOINTMENT SCHEDULING (NEW CAPABILITY)
  - If the user mentions a symptom or concern that warrants professional consultation, OFFER to schedule an appointment with "Dr. Arpan (Internal Medicine)".
  - If they are interested, ask for their preferred date and time.
  - You MUST check availability against these placeholder slots:
    * Mon-Fri: 10:00 AM, 11:30 AM, 02:00 PM, 04:30 PM
    * Sat: 11:00 AM, 01:00 PM
  - If they pick a slot, CONFIRM the details.
  - TRIGGER: When an appointment is confirmed by the user, you MUST include a JSON block at the very end of your message in this EXACT format (no other text inside the block):
    [SCHEDULE_APPOINTMENT: {"doctor": "Dr. Arpan", "specialty": "Internal Medicine", "date": "YYYY-MM-DD", "time": "HH:mm"}]

  7. TONE
  - Calm, professional, non-alarmist, evidence-based. No overconfidence or guessing.

  SAFETY RULES:
  - If uncertain → say "I'm not fully certain".
  - Do NOT hallucinate diseases or drugs.
  - Do NOT provide surgical or high-risk instructions.
  - Always recommend consulting a licensed doctor for confirmation.

  OUTPUT FORMAT:
  1. Summary of symptoms
  2. Possible causes
  3. What you can do now
  4. Medicines (if safe)
  5. When to seek help

  **Disclaimer: I am an AI, not a licensed healthcare professional. This information is for educational purposes and should not replace professional medical advice, diagnosis, or treatment.**`;

  // Filter history to ensure we don't have too many previous messages for tokens, but keep enough for context
  const recentHistory = history.slice(-10);

  const contents = [
    { role: "user", parts: [{ text: systemInstruction }] },
    { role: "model", parts: [{ text: "Understood. I will act as MediMind AI Doctor, providing safe, evidence-based guidance while maintaining conversation context. How can I help you today?" }] },
    ...recentHistory.map(h => ({ 
      role: h.role === 'assistant' ? 'model' : 'user', 
      parts: [{ text: h.content }] 
    })),
    { role: "user", parts: [{ text: currentMessage }] }
  ];

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: contents as any,
  });
  return response.text;
};

export const generateLogo = async (prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: prompt,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
        },
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        const base64EncodeString: string = part.inlineData.data;
        return `data:image/png;base64,${base64EncodeString}`;
      }
    }
    throw new Error("No image data returned from Gemini");
  } catch (error) {
    console.error("Logo Generation Error:", error);
    throw error;
  }
};

export interface SmartScheduleResponse {
  suggestedTimes: string[];
  reasoning: string;
  lifestyleAdjustments: string;
}

export const getSmartSchedule = async (
  medicine: Partial<Medicine>,
  lifestyle: Lifestyle,
  existingMedicines: Medicine[] = [],
  adherenceData: any[] = []
): Promise<SmartScheduleResponse> => {
  const prompt = `Suggest an optimal medication schedule for a NEW medicine, considering the user's existing medications to avoid interactions and their daily routine.

  NEW Medicine:
  - Name: ${medicine.name}
  - Dosage: ${medicine.dosage}
  - Type: ${medicine.type}
  - Instructions: ${medicine.instructions || 'None'}
  
  EXISTING Medications:
  ${existingMedicines.map(m => `- ${m.name} (${m.dosage}) at ${m.times.join(', ')}`).join('\n')}

  User Lifestyle:
  - Wake Time: ${lifestyle.wakeTime}
  - Sleep Time: ${lifestyle.sleepTime}
  - Breakfast: ${lifestyle.mealTimes.breakfast}
  - Lunch: ${lifestyle.mealTimes.lunch}
  - Dinner: ${lifestyle.mealTimes.dinner}
  - Activity Level: ${lifestyle.activityLevel}
  
  Adherence Pattern:
  - Recent performance: ${adherenceData.length > 0 ? 'Analyzing past 7 days logs' : 'New user, no history'}
  ${adherenceData.map(a => `- ${a.date}: ${(a.taken/a.total*100).toFixed(0)}% adherence`).slice(-7).join('\n')}

  Goal:
  1. Suggest times (HH:mm) that maximize efficacy and minimize conflicts.
  2. If the user has poor morning adherence, suggest afternoon/evening if safe.
  3. Avoid overlapping too many medications at once unless specified.
  
  Return ONLY a valid JSON object with:
  {
    "suggestedTimes": ["HH:mm", ...],
    "reasoning": "Clear explanation of why these times and how it fits with existing meds/lifestyle",
    "lifestyleAdjustments": "Tips like 'Take with water' or 'Avoid heavy activity 1h after'"
  }`;

  const messages = [{ role: "user", content: prompt }];
  const response = await callGemini(messages as any);
  
  try {
    return JSON.parse(response || "{}");
  } catch (error) {
    console.error("Failed to parse Gemini response:", error);
    throw new Error("Failed to generate smart schedule");
  }
};

export const checkMedicationInteractions = async (medicines: any[]): Promise<any> => {
  const systemInstruction = `You are a clinical pharmacist AI. Analyze the list of medications for potential drug-drug interactions.
  
  Medicines to analyze: ${JSON.stringify(medicines.map(m => ({ name: m.name, dosage: m.dosage })))}
  
  Guidelines:
  1. Identify any significant interactions between the listed drugs.
  2. Rate the overall severity: low, moderate, high, or critical.
  3. Provide a clear explanation of exactly what happens in the interaction.
  4. Give a practical recommendation (e.g., "Take at different times", "Consult doctor immediately").
  5. If no interactions are found, return interactionFound: false.
  
  Response Format (JSON ONLY):
  {
    "interactionFound": boolean,
    "severity": "low" | "moderate" | "high" | "critical",
    "details": "string",
    "recommendation": "string",
    "medicines": ["string", "string"]
  }`;

  const messages = [
    { role: "system", content: systemInstruction },
    { role: "user", content: "Analyze my current medications for interactions." }
  ];

  try {
    const response = await callGemini(messages as any);
    const jsonStr = response?.replace(/```json/g, '').replace(/```/g, '').trim() || "{}";
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('Interaction Check Error:', error);
    return {
      interactionFound: false,
      severity: 'low',
      details: 'Unable to perform check at this time.',
      recommendation: 'Please consult your pharmacist.',
      medicines: []
    };
  }
};
