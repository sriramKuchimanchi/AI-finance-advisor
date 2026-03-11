import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
dotenv.config()

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

export async function sendPasswordResetEmail(toEmail: string, userName: string, resetToken: string) {
  const resetLink = `http://localhost:5173/reset-password?token=${resetToken}`

  await transporter.sendMail({
    from: `"FinanceAI" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'Reset your FinanceAI password',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; background: #0f1117; color: #e2e8f0; padding: 32px; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #10b981; font-size: 24px; margin: 0;">FinanceAI</h1>
          <p style="color: #94a3b8; font-size: 13px; margin-top: 4px;">Smart Financial Adviser</p>
        </div>
        <h2 style="font-size: 18px; margin-bottom: 8px;">Hi ${userName},</h2>
        <p style="color: #94a3b8; font-size: 14px; line-height: 1.6;">
          We received a request to reset your password. Click the button below to set a new password.
          This link expires in <strong style="color: #e2e8f0;">15 minutes</strong>.
        </p>
        <div style="text-align: center; margin: 28px 0;">
          <a href="${resetLink}"
             style="background: #10b981; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p style="color: #64748b; font-size: 12px; text-align: center;">
          If you didn't request this, you can safely ignore this email.
        </p>
        <hr style="border: none; border-top: 1px solid #1e293b; margin: 24px 0;" />
        <p style="color: #475569; font-size: 11px; text-align: center;">
          Or copy this link: <span style="color: #10b981;">${resetLink}</span>
        </p>
      </div>
    `,
  })
}