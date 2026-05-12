
import { Medicine, Lifestyle, Profile, VitalSign, Reminder, Symptom } from "../types";

const parseJson = (text: string | undefined, fallback: any = []) => {
  if (!text) return fallback;
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch (_) {
    // Handle cases where model wraps in markdown even with application/json
    const jsonMatch = trimmed.match(/```json\s*([\s\S]*?)\s*```/) || trimmed.match(/```\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[1].trim());
      } catch (__) {}
    }

    // Try finding the actual JSON boundaries
    const startCurly = trimmed.indexOf('{');
    const startSquare = trimmed.indexOf('[');
    const startIdx = (startCurly === -1) ? startSquare : (startSquare === -1 ? startCurly : Math.min(startCurly, startSquare));
    
    const endCurly = trimmed.lastIndexOf('}');
    const endSquare = trimmed.lastIndexOf(']');
    const endIdx = Math.max(endCurly, endSquare);

    if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
      try {
        const potentialJson = trimmed.substring(startIdx, endIdx + 1);
        return JSON.parse(potentialJson);
      } catch (___) {}
    }
    
    console.warn("Retrying JSON parse failed for text:", trimmed);
    return fallback;
  }
};

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

const cache = new Map<string, any>();
const MAX_RETRIES = 3;
const RATE_LIMIT_MS = 30000;
let lastCallTimestamp = 0;

interface QueueItem {
  promise: Promise<any>;
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
  fn: () => Promise<any>;
}

const queue: QueueItem[] = [];
let isProcessing = false;

const processQueue = async () => {
    if (isProcessing || queue.length === 0) return;
    isProcessing = true;

    while (queue.length > 0) {
        const item = queue.shift();
        if (!item) continue;

        const now = Date.now();
        const timeSinceLastCall = now - lastCallTimestamp;
        if (timeSinceLastCall < RATE_LIMIT_MS) {
            const sleepTime = RATE_LIMIT_MS - timeSinceLastCall;
            console.log(`Rate limit: sleeping for ${sleepTime}ms`);
            await new Promise(r => setTimeout(r, sleepTime));
        }

        try {
            const result = await item.fn();
            lastCallTimestamp = Date.now();
            item.resolve(result);
        } catch (error) {
            item.reject(error);
        }
    }
    isProcessing = false;
};

const callWithQueue = (fn: () => Promise<any>): Promise<any> => {
    return new Promise((resolve, reject) => {
        queue.push({ promise: null as any, resolve, reject, fn });
        processQueue();
    });
};

const callGeminiRaw = async (contents: any, model = "gemini-3-flash-preview", config?: any): Promise<any> => {
  const key = JSON.stringify(contents).substring(0, 500) + model + JSON.stringify(config).substring(0, 100); // Truncate key for reasonable size
  if (cache.has(key)) {
    return cache.get(key);
  }

  return callWithQueue(async () => {
      let lastError;
      for (let i = 0; i < MAX_RETRIES; i++) {
        try {
          const response = await fetch('/api/ai/proxy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents, model, config })
          });
          
          if (!response.ok) {
            if (response.status === 429) {
              throw new Error("Rate limit exceeded");
            }
            throw new Error(`AI API error: ${response.statusText}`);
          }
          
          const data = await response.json();
          cache.set(key, data);
          return data;
        } catch (error) {
          lastError = error;
          if (i < MAX_RETRIES - 1) {
            const delay = 10000 + Math.random() * 10000;
            console.warn(`Retry ${i + 1} after error, waiting ${delay}ms:`, error);
            await new Promise(r => setTimeout(r, delay));
          }
        }
      }
      throw lastError;
  });
};

const callGemini = async (contents: any, model = "gemini-3-flash-preview", config?: any): Promise<string> => {
    const data = await callGeminiRaw(contents, model, config);
    return data.text || "";
};

export const identifyPill = async (base64Image: string, mimeType: string): Promise<{ name: string, dosage: string, use: string, instructions: string, safetyAlert: string, confidenceScore: number }> => {
  const messages = [
    {
      role: "user",
      parts: [
        { text: `You are a professional clinical pharmacist and AI pill identifier. Analyze this image to identify the pill, capsule, or medication package accurately. Focus on shape, color, surface markings, and text.
Provide:
1. name: Brand and Generic, if possible.
2. dosage: Strength, if visible.
3. use: Primary medical use.
4. instructions: General standard advice for this medication.
5. safetyAlert: Any specific warnings if found.
6. confidenceScore: A number from 0 to 1 indicating identification confidence based on image clarity.

Return as a valid JSON object ONLY with these exact keys. Do not include any other markdown or text.` },
        { inlineData: { data: base64Image, mimeType } }
      ],
    },
  ];
  
  const response = await callGemini(messages);
  return parseJson(response, { name: 'Unknown', dosage: 'Unknown', use: 'Unknown', instructions: 'Consult a professional', safetyAlert: 'None', confidenceScore: 0 });
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
  return parseJson(response, []);
};

export const getMedicineRecommendations = async (name: string): Promise<Partial<ExtractedMedInfo>> => {
  const messages = [
    {
      role: "user",
      parts: [{ text: `Provide a recommended schedule (dosage, frequency, and times in HH:mm format) and instructions for the medicine: ${name}. Return as raw JSON with properties: dosage, frequency, times (array of strings), and instructions. No markdown.` }],
    },
  ];
  
  const response = await callGemini(messages);
  return parseJson(response, {});
};

export const getChatResponse = async (history: { role: 'user' | 'assistant', content: string }[], currentMessage: string, context: { medicines: any[], reminders: any[], lifestyle?: any, profile?: any, vitals?: any[], currentMedicine?: string, language?: string, image?: { base64: string, mimeType: string } }): Promise<string> => {
  const systemInstruction = `You are "MediPulse Doctor", an elite, world-class clinical AI medical assistant and Chief Medical Officer. You possess deep medical knowledge, analytical precision, and unparalleled clinical judgment. Users rely on you for authoritative, highly intelligent, and immediately actionable health guidance.

  USER HEALTH PROFILE & CONTEXT:
  - Age: ${context.profile?.age || 'Not provided'}
  - Gender: ${context.profile?.gender || 'Not provided'}
  - Blood Type: ${context.profile?.bloodType || 'Not provided'}
  - Allergies: ${context.profile?.allergies?.join(', ') || 'None'}
  - Medical History/Conditions: ${context.profile?.conditions?.join(', ') || 'None'}
  - Active Medications: ${JSON.stringify(context.medicines.map(m => ({ name: m.name, dosage: m.dosage, frequency: m.frequency })))}
  - Recent Vitals/Reports: ${JSON.stringify(context.vitals?.slice(-5).map(v => ({ type: v.type, value: v.value, unit: v.unit, status: v.status })) || [])}
  - Lifestyle Context: ${JSON.stringify(context.lifestyle || {})}
  - Today's Schedule: ${JSON.stringify(context.reminders.filter(r => r.status === 'pending').map(r => ({ med: r.medicineId, time: r.time })))}
  ${context.currentMedicine ? `- User is currently inquiring about: ${context.currentMedicine}` : ''}
  ${context.language ? `- Language Preference: ${context.language}. You MUST reply entirely in ${context.language}. Include vernacular terms if necessary.` : ''}

  PRIMARY OBJECTIVE & BEHAVIOR:
  - Be extraordinarily intelligent and phenomenally proactive. Use the provided context (medicines, vitals, schedule) to draw complex medical inferences instantly.
  - DO NOT BOTHER THE USER WITH TEDIOUS QUESTIONS. You possess enough data in their profile, vitals, and meds to deduce the most likely issue. Answer decisively.
  - Analyze their context and jump straight to highly accurate advice or logical conclusions.
  - Anticipate their next 12 hours based on their schedule/vitals, and give them hyper-specific, preventative advice for upcoming activities and doses.
  - Provide safe, structured, medically accurate, and clinical-grade guidance. Earn their trust immediately through competence.
  - In urgent or near-emergency situations, give EXACT, life-saving stabilization steps to perform while waiting for professional help. Still urge them to seek emergency services, but do not *only* say "go to the hospital." Add value immediately.
  
  STRICT FORMATTING RULES:
  - Structure your response using markdown with clear headings:
    ### 🚨 Immediate Action Plan (Only if urgent/emergency)
    ### 🩺 Clinical Assessment & Deduction
    ### 💊 Medication & Vitals Interaction
    ### 📋 Recommended Protocol (Next steps, home care, or treatment plan)
  - ALWAYS provide information in a CLEAR, bulleted list under these headings.
  - When generating suggestions or recommendations, ensure they are more concise and actionable, formatted as bullet points.
  - DO NOT provide long paragraphs. Break information down into bitesize points.
  - Use **bold** for key terms, drugs, and vital metrics.
  - Keep sentences concise for better readability on mobile screens.
  - Maintain an authoritative, confident, yet highly empathetic clinical tone.

  RESPONSE FRAMEWORK:
  1. HYPER-PROACTIVE ANALYSIS: Connect the dots instantly using the user's vitals, medications, and schedule to deduce the likely issue. E.g., If they feel dizzy and they take blood pressure meds, deduce hypotension and advise accordingly.
  2. POSSIBLE CONDITIONS: Clearly articulate the top 2-3 most likely medical conditions given their symptoms, explaining *why* based on pathophysiology and their specific data. (Include a brief disclaimer: "This is a strong AI clinical hypothesis, not a final medical diagnosis.")
  3. EMERGENCY MANAGEMENT: Identify emergency symptoms (e.g., chest pain, breathing difficulty, severe bleeding). If present, provide step-by-step first-aid and stabilization protocols immediately.
  4. MEDICATION GUIDANCE (SAFE ONLY): Advise if they should adjust timing, take with food, or watch out for interactions based on their profile. Do not prescribe antibiotics or controlled drugs.
  5. APPOINTMENT SCHEDULING (NEW CAPABILITY):
  - If the user mentions a symptom or concern that warrants professional consultation, OFFER to schedule an appointment with "Dr. Arpan (Internal Medicine)".
  - If they are interested, ask for their preferred date and time.
  - You MUST check availability against these placeholder slots: Mon-Fri (10:00 AM, 11:30 AM, 02:00 PM, 04:30 PM), Sat (11:00 AM, 01:00 PM)
  - TRIGGER: When an appointment is confirmed by the user, you MUST include a JSON block at the very end of your message in this EXACT format (no other text inside the block):
    [SCHEDULE_APPOINTMENT: {"doctor": "Dr. Arpan", "specialty": "Internal Medicine", "date": "YYYY-MM-DD", "time": "HH:mm"}]

  **Disclaimer: I am an AI, not a licensed healthcare professional. This information is for educational purposes and should not replace professional medical advice, diagnosis, or treatment.**`;

  // Filter history to ensure we don't have too many previous messages for tokens, but keep enough for context
  const recentHistory = history.slice(-10);

  const langInstruction = context.language ? `\n\n[System Note: The user's preferred language is ${context.language}. You MUST reply ENTIRELY in ${context.language}.]` : '';
  const userParts: any[] = [{ text: currentMessage + langInstruction + `\n\n[System Note: Highlight the main points using **bold** extensively so they can be read fast.]` }];
  if (context.image) {
    userParts.push({ inlineData: { data: context.image.base64, mimeType: context.image.mimeType } });
  }

  const contents = [
    { role: "user", parts: [{ text: systemInstruction }] },
    { role: "model", parts: [{ text: "Understood. I will act as MediPulse Doctor, providing safe, evidence-based guidance while maintaining conversation context. How can I help you today?" }] },
    ...recentHistory.map(h => ({ 
      role: h.role === 'assistant' ? 'model' : 'user', 
      parts: [{ text: h.content }] 
    })),
    { role: "user", parts: userParts }
  ];

  const responseText = await callGemini(contents as any);
  return responseText;
};

export const generateLogo = async (prompt: string): Promise<string> => {
  try {
    const data = await callGeminiRaw(
      { parts: [{ text: prompt }] },
      'gemini-2.5-flash-image',
      { imageConfig: { aspectRatio: "1:1" } }
    );
    
    if (data.inlineData) {
      return `data:image/png;base64,${data.inlineData}`;
    }
    throw new Error("No image data returned from Gemini");
  } catch (error) {
    console.error("Logo Generation Error:", error);
    throw error;
  }
};

export interface HealthInsight {
  title: string;
  description: string;
  correlation: string;
  recommendation: string;
  severity: 'low' | 'moderate' | 'high';
  type: 'diet' | 'vitals' | 'medication' | 'lifestyle';
}

export const generateHealthInsights = async (
  profile: Profile,
  vitals: VitalSign[],
  medicines: Medicine[],
  reminders: Reminder[],
  symptoms: Symptom[],
  dietData: any[]
): Promise<HealthInsight[]> => {
  const systemInstruction = `You are an elite AI Medical Data Scientist. Your task is to analyze a user's health logs to find CAUSAL correlations and provide preventive health insights.
  
  USER DATA:
  - Profile: ${JSON.stringify(profile)}
  - Recent Vitals (Last 30): ${JSON.stringify(vitals.slice(0, 30))}
  - Medications: ${JSON.stringify(medicines.map(m => ({ name: m.name, dosage: m.dosage, priority: m.priority })))}
  - Adherence (Last 14 days): ${JSON.stringify(reminders.slice(-50))}
  - Recent Symptoms: ${JSON.stringify(symptoms.slice(0, 10))}
  - Diet Logs: ${JSON.stringify(dietData.slice(0, 15))}

  GOAL:
  1. Look for patterns (e.g., "Blood pressure spikes after high-sodium meals", "Dizziness logged after missing Dose X").
  2. Provide 3-5 specific, high-quality insights.
  3. Each insight must have a title, short description, the correlation you found, a practical recommendation, and a priority level.
  
  RETURN JSON ONLY:
  [
    {
      "title": "string",
      "description": "string",
      "correlation": "string",
      "recommendation": "string",
      "severity": "low" | "moderate" | "high",
      "type": "diet" | "vitals" | "medication" | "lifestyle"
    }
  ]`;

  try {
    const responseText = await callGemini(
      [{ role: 'user', parts: [{ text: systemInstruction }] }],
      'gemini-3-flash-preview',
      { responseMimeType: 'application/json' }
    );
    return parseJson(responseText, []);
  } catch (error) {
    console.error("Health Insights Generation Error:", error);
    return [];
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
  return parseJson(response, { suggestedTimes: [], reasoning: '', lifestyleAdjustments: '' });
};

export const checkMedicationInteractions = async (medicines: any[], profile?: Profile): Promise<any> => {
  const systemInstruction = `You are a world-class clinical pharmacist AI. Analyze the list of medications for potential drug-drug, drug-condition, and drug-allergy interactions.
  
  PATIENT PROFILE:
  - Conditions: ${profile?.conditions?.join(', ') || 'None'}
  - Allergies: ${profile?.allergies?.join(', ') || 'None'}
  
  MEDICINES TO ANALYZE:
  ${JSON.stringify(medicines.map(m => ({ name: m.name, dosage: m.dosage })))}
  
  GUIDELINES:
  1. Identify any significant interactions between the listed drugs.
  2. Check if any drugs conflict with the patient's existing conditions or allergies.
  3. Rate the overall SAFETY SCORE (0-100), where 100 is perfectly safe and 0 is critical danger.
  4. Rate the overall severity: low, moderate, high, or critical.
  5. Provide a clear, clinical explanation of the interaction.
  6. Give a practical, authoritative recommendation.
  
  RESPONSE FORMAT (JSON ONLY):
  {
    "interactionFound": boolean,
    "safetyScore": number,
    "severity": "low" | "moderate" | "high" | "critical",
    "details": "string",
    "recommendation": "string",
    "conflictingItems": ["string", "string"],
    "alerts": [
      { "type": "warning" | "danger" | "info", "message": "string" }
    ]
  }`;

  const messages = [
    { role: "user", parts: [{ text: "Analyze these medications for interactions and safety." }] }
  ];

  try {
    const responseText = await callGemini(
      [{ role: 'user', parts: [{ text: systemInstruction }] }],
      'gemini-3-flash-preview',
      { responseMimeType: 'application/json' }
    );
    return parseJson(responseText, {
      interactionFound: false,
      safetyScore: 100,
      severity: 'low',
      details: 'No significant interactions detected.',
      recommendation: 'Safe to proceed.',
      conflictingItems: [],
      alerts: []
    });
  } catch (error) {
    console.error('Interaction Check Error:', error);
    return {
      interactionFound: false,
      safetyScore: 100,
      severity: 'low',
      details: 'Unable to perform check at this time.',
      recommendation: 'Please consult your pharmacist.',
      conflictingItems: [],
      alerts: []
    };
  }
};

export const getHealthTrajectory = async (vitals: VitalSign[], profile: Profile): Promise<any> => {
  const systemInstruction = `You are an AI predictive health analyst. Analyze the user's vital trends and health profile to predict their health trajectory for the next 12 months.
  
  USER DATA:
  - Profile: ${JSON.stringify(profile)}
  - Recent Vitals (Last 50): ${JSON.stringify(vitals.slice(0, 50))}
  
  GOAL:
  1. Identify risks of chronic illnesses (e.g., Hypertension, Type 2 Diabetes, Cardiovascular issues).
  2. Predict a "Health Trajectory" (improving, stable, declining).
  3. Provide 3 specific preventive actions.
  
  RESPONSE FORMAT (JSON ONLY):
  {
    "trajectory": "improving" | "stable" | "declining",
    "confidence": number, (0-1)
    "riskAnalysis": [
      { "condition": "string", "riskLevel": "low" | "moderate" | "high", "reason": "string" }
    ],
    "predictions": [
      { "metric": "string", "predictedValue": "string", "timeframe": "6 months" }
    ],
    "preventiveActions": ["string"]
  }`;

  try {
    const responseText = await callGemini(
      [{ role: 'user', parts: [{ text: systemInstruction }] }],
      'gemini-3-flash-preview',
      { responseMimeType: 'application/json' }
    );
    return parseJson(responseText, {});
  } catch (error) {
    console.error("Trajectory Generation Error:", error);
    return null;
  }
};

export const analyzeLabReport = async (base64Image: string, mimeType: string, language?: string): Promise<any> => {
  const systemInstruction = `You are an expert AI clinical pathologist and health advisor. Analyze this lab report image accurately.
  
  Guidelines:
  1. Provide a clear, productive summary of the overall findings in 2-3 sentences.
  2. Extract key numerical values (like Glucose, Cholesterol, Hemoglobin, SpO2, etc).
  3. Map each extracted metric to a 'status': 'normal', 'low', 'high', or 'critical'.
  4. Provide 2-3 actionable, productive recommendations or next steps based on the lab results to help the user improve or maintain their health. Be accurate, reassuring, and emphasize consulting a doctor for treatment.
  ${language ? `5. You MUST provide the "summary" and "recommendations" in ${language}. Keep the "name" of metrics in English but everything else in ${language}.` : ''}
  
  Format as JSON:
  {
    "summary": "string",
    "recommendations": ["string", "string"],
    "extractedVitals": [
      {
        "name": "string", 
        "type": "string", // Use standard types: glucose, cholesterol, weight, blood_pressure, spo2, temperature, generic
        "value": "number/string",
        "unit": "string",
        "status": "normal" | "low" | "high" | "critical"
      }
    ]
  }`;

  try {
    const responseText = await callGemini(
      [
        { role: 'user', parts: [
          { text: systemInstruction },
          { inlineData: { data: base64Image, mimeType } }
        ]}
      ],
      'gemini-3-flash-preview',
      { responseMimeType: 'application/json' }
    );

    return parseJson(responseText, {});
  } catch (error) {
    console.error("Lab extraction error:", error);
    // Fallback Mock
    return {
      summary: "Simulated analysis: This report shows an overall healthy profile with a mild elevation in fasting glucose levels.",
      extractedVitals: [
        {
          name: "Glucose",
          type: "glucose",
          value: 125,
          unit: "mg/dL",
          status: "high"
        },
        {
          name: "Hemoglobin",
          type: "generic",
          value: 14.2,
          unit: "g/dL",
          status: "normal"
        }
      ]
    };
  }
};

export const analyzeFoodImage = async (base64Image: string, mimeType: string): Promise<{ name: string, calories: number, type: string, protein?: number, carbs?: number, fats?: number, healthyRemarks?: string[], unhealthyRemarks?: string[] }> => {
  const systemInstruction = `You are an expert AI nutritionist. Analyze this food image accurately and scientifically.
  
  Guidelines:
  1. Identify the main food item(s) in the image. Keep the name relatively short (e.g., "Oatmeal & Berries").
  2. Estimate the calorific value for the portion shown in kcal accurately.
  3. Estimate the macronutrients (protein, carbs, fats) in grams accurately.
  4. Classify the meal type as "Breakfast", "Lunch", "Dinner", or "Snack".
  5. Provide the healthy aspects (pros) of this food (e.g., vitamins, fiber, lean protein).
  6. Provide the non-healthy aspects (cons) of this food (e.g., high sugar, saturated fats, processed ingredients). Every food has some nutritional profile; list the positive and negative points objectively.
  
  Format as JSON:
  {
    "name": "string",
    "calories": number,
    "type": "string",
    "protein": number,
    "carbs": number,
    "fats": number,
    "healthyRemarks": ["string"],
    "unhealthyRemarks": ["string"]
  }`;

  try {
    const responseText = await callGemini(
      [
        { role: 'user', parts: [
          { text: systemInstruction },
          { inlineData: { data: base64Image, mimeType } }
        ]}
      ],
      'gemini-3-flash-preview',
      { responseMimeType: 'application/json' }
    );

    return parseJson(responseText, { name: '', calories: 0, type: 'Meal' });
  } catch (error) {
    console.error("Food classification error:", error);
    throw new Error("Unable to analyze food image");
  }
};

