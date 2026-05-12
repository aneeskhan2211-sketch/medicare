import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Razorpay from 'razorpay';
import { GoogleGenAI } from "@google/genai";

let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI {
  if (!aiClient) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiClient;
}


let razorpayClient: Razorpay | null = null;
function getRazorpay(): Razorpay {
  if (!razorpayClient) {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      throw new Error('RAZORPAY credentials missing');
    }
    razorpayClient = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return razorpayClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Wallet API Routes
  app.post("/api/wallet/add", async (req, res) => {
    const { amount, userId } = req.body;
    
    try {
      const razorpay = getRazorpay();
      const order = await razorpay.orders.create({
        amount: amount * 100, // Amount in paise
        currency: "INR",
        receipt: `receipt_${userId}_${Date.now()}`,
      });
      res.json({ success: true, orderId: order.id, key_id: process.env.RAZORPAY_KEY_ID });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to create order" });
    }
  });

  app.post("/api/wallet/withdraw", async (req, res) => {
    const { amount, userId, upiId } = req.body;
    
    // In production, trigger IMPS/NEFT/UPI transfer to the user
    console.log(`[Wallet] Initiate Withdraw: ${amount} for ${userId} to ${upiId}`);

    if (!process.env.PAYMENT_GATEWAY_KEY) {
      return res.status(500).json({ error: "Configuration Error: Missing Gateway Keys" });
    }

    res.json({ success: true, withdrawalId: "wd_" + Date.now() });
  });

  // Weather API Route
  app.get("/api/weather", async (req, res) => {
    const { lat, lon } = req.query;
    if (!lat || !lon) {
      return res.status(400).json({ error: "Missing latitude or longitude" });
    }
    
    if (!process.env.WEATHER_API_KEY) {
      return res.status(500).json({ error: "Weather API key not configured" });
    }

    try {
      const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.WEATHER_API_KEY}&units=metric`);
      const data = await response.json();
      res.json({
        temp: Math.round(data.main.temp),
        condition: data.weather[0].main,
        location: data.name
      });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to fetch weather" });
    }
  });

  // Health route
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // AI Call Route
  app.post("/api/ai/call", async (req, res) => {
    const { messages, model } = req.body;
    try {
      const { callTogetherAI } = await import("./src/services/togetherService.ts");
      const response = await callTogetherAI(messages, model);
      res.json({ response });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to get AI response" });
    }
  });

  // AI Proxy Route
  app.post("/api/ai/proxy", async (req, res) => {
    const { contents, model, config } = req.body;
    try {
      const ai = getAIClient();
      const response = await ai.models.generateContent({
        model: model || "gemini-3-flash-preview",
        contents: contents,
        config: config
      });
      
      const candidate = response.candidates?.[0];
      const part = candidate?.content?.parts?.[0];
      
      if (part?.inlineData) {
        res.json({ inlineData: part.inlineData.data });
      } else {
        res.json({ text: response.text });
      }
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to get AI response" });
    }
  });

  // Caregiver Alert Route
  app.post("/api/caregiver/alert", async (req, res) => {
    const { targetEmail, targetPhone, medName, time, userName } = req.body;
    
    console.log(`[Caregiver Alert] Notifying guardian for ${userName}: Missed ${medName} at ${time}`);
    
    // In a real app, this would trigger email/SMS/Push via a provider
    if (targetEmail) {
      console.log(`[Caregiver Alert] Emailing ${targetEmail}...`);
    }
    if (targetPhone) {
      console.log(`[Caregiver Alert] Sending SMS to ${targetPhone}...`);
    }

    res.json({ success: true, message: "Guardian notified" });
  });

  // SOS Alert Route
  app.post("/api/sos/alert", async (req, res) => {
    const { contactPhone, message, snapshot } = req.body;
    
    // In production, use process.env.TWILIO_ACCOUNT_SID etc. and twilio client
    console.log(`[SOS] Sending SMS to ${contactPhone}: ${message}`);
    if (snapshot) {
      console.log(`[SOS] Snapshot link: [Secure Link Placeholder]`);
    }

    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
      return res.status(500).json({ error: "Twilio credentials missing" });
    }

    // Mock response for now
    res.json({ success: true, message: "Alert sent successfully" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
