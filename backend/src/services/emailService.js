import { setDefaultResultOrder } from 'dns';
setDefaultResultOrder('ipv4first'); // Force IPv4 — Railway does not support IPv6 outbound SMTP

import nodemailer from 'nodemailer';
import env from '../config/env.js';

const createTransporter = () => {
  const user = env.EMAIL_USER || '';

  // Detect provider from EMAIL_USER and use explicit host/port
  const isOutlook = user.includes('@outlook') || user.includes('@hotmail') || user.includes('@live');

  if (isOutlook) {
    return nodemailer.createTransport({
      host: 'smtp-mail.outlook.com',
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: env.EMAIL_USER,
        pass: env.EMAIL_PASS,
      },
    });
  }

  // Default: Gmail
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: env.EMAIL_USER,
      pass: env.EMAIL_PASS,
    },
  });
};

export const sendOTPEmail = async (toEmail, otp, name) => {
  const transporter = createTransporter();

  await transporter.sendMail({
    from: `"IntervuAI" <${env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'Your IntervuAI Verification Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #2563eb; margin-bottom: 8px;">Welcome to IntervuAI!</h2>
        <p style="color: #374151;">Hi <strong>${name}</strong>, use the code below to verify your email address:</p>

        <div style="
          font-size: 40px;
          font-weight: bold;
          letter-spacing: 12px;
          color: #2563eb;
          background: #eff6ff;
          border: 2px solid #bfdbfe;
          border-radius: 12px;
          text-align: center;
          padding: 24px 16px;
          margin: 24px 0;
        ">
          ${otp}
        </div>

        <p style="color: #6b7280; font-size: 14px;">
          ⏳ This code expires in <strong>10 minutes</strong>.
        </p>
        <p style="color: #6b7280; font-size: 14px;">
          If you didn't request this, you can safely ignore this email.
        </p>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
        <p style="color: #9ca3af; font-size: 12px; text-align: center;">
          © ${new Date().getFullYear()} IntervuAI — AI-Powered Interview Practice
        </p>
      </div>
    `,
  });
};
