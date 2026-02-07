import OTP from "../models/otpModel.js";

export async function sendOtpService(email) {
  const otp = Math.floor(1000 + Math.random() * 9000).toString();

  // Save OTP to database (upsert - replace if it already exists)
  await OTP.findOneAndUpdate(
    { email },
    { otp, createdAt: new Date() },
    { upsert: true, new: true }
  );

  // For testing purposes, return the OTP in response
  // In production, you would send this via email/SMS
  return {
    success: true,
    message: `OTP generated for ${email}`,
    otp, // Remove this in production; only send via email/SMS
  };
}
