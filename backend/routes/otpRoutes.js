const express = require("express");
const nodemailer = require("nodemailer");
const router = express.Router();

const otpStore = new Map(); // email -> { otp, expiresAt, lastSentAt }

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

// 📤 Send or Resend OTP
router.post("/send-otp", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });

  const cooldownPeriod = 60 * 1000; // 60 seconds
  const existing = otpStore.get(email);

  if (existing && Date.now() - existing.lastSentAt < cooldownPeriod) {
    const secondsLeft = Math.ceil((cooldownPeriod - (Date.now() - existing.lastSentAt)) / 1000);
    return res.status(429).json({ error: `Please wait ${secondsLeft}s before requesting a new OTP` });
  }

  const otp = generateOtp();
  const now = Date.now();
  const expiresAt = now + 5 * 60 * 1000; // 5 min validity

  otpStore.set(email, { otp, expiresAt, lastSentAt: now });

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP code is: ${otp}. It will expire in 5 minutes.`
    });

    res.json({ message: "OTP sent successfully" });
  } catch (err) {
    console.error("Error sending OTP:", err);
    res.status(500).json({ error: "Failed to send OTP" });
  }
});

// ✅ Verify OTP (unchanged)
router.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ error: "Email and OTP are required" });

  const record = otpStore.get(email);
  if (!record) return res.status(400).json({ error: "OTP not found or expired" });

  if (Date.now() > record.expiresAt) {
    otpStore.delete(email);
    return res.status(400).json({ error: "OTP expired" });
  }

  if (record.otp !== otp) {
    return res.status(400).json({ error: "Invalid OTP" });
  }

  otpStore.delete(email);
  res.json({ message: "OTP verified successfully" });
});

module.exports = router;
