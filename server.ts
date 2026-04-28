import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Razorpay from 'razorpay';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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

  // Health route
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // AI Call Route
  app.post("/api/ai/call", async (req, res) => {
    const { messages, model } = req.body;
    try {
      const { callTogetherAI } = await import("./src/services/togetherService.js");
      const response = await callTogetherAI(messages, model);
      res.json({ response });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to get AI response" });
    }
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
