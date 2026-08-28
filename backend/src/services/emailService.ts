import nodemailer from 'nodemailer';
import { config } from '../config/env';
import { Database } from '../config/database';

export class EmailService {
  private static transporter: nodemailer.Transporter | null = null;

  private static getTransporter(): nodemailer.Transporter {
    if (!this.transporter) {
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: config.email.user || 'aw419770@gmail.com',
          pass: config.email.pass || 'eqqoknioltpwsyxr',
        },
      });
    }
    return this.transporter;
  }

  // 1. Send 6-Digit Registration OTP Email
  public static async sendRegistrationOtpEmail(toEmail: string, userName: string, otpCode: string): Promise<boolean> {
    try {
      const transporter = this.getTransporter();
      const siteName = Database.getStore()?.settings?.site_name || 'BitBlog';

      const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your ${siteName} Verification Code</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0B0F19; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #F8FAFC;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0B0F19; padding: 40px 15px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="560px" cellpadding="0" cellspacing="0" style="max-width: 560px; background-color: #111827; border-radius: 16px; border: 1px solid #1F2937; overflow: hidden; box-shadow: 0 12px 30px rgba(0,0,0,0.6);">
          
          <!-- Header Branding -->
          <tr>
            <td style="padding: 36px 36px 20px; text-align: center; background: linear-gradient(180deg, rgba(99,102,241,0.18) 0%, rgba(17,24,39,0) 100%);">
              <h1 style="margin: 0; font-size: 26px; font-weight: 800; color: #FFFFFF; letter-spacing: -0.5px;">
                ${siteName}
              </h1>
              <p style="margin: 6px 0 0 0; font-size: 13px; color: #9CA3AF; text-transform: uppercase; letter-spacing: 1.2px; font-weight: 600;">
                Digital Security Verification
              </p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 20px 36px 36px;">
              <h2 style="margin: 0 0 14px; font-size: 20px; font-weight: 700; color: #FFFFFF;">
                Hello, ${userName}! 👋
              </h2>
              <p style="margin: 0 0 24px; font-size: 15px; line-height: 1.6; color: #D1D5DB;">
                Please use the following 6-digit security code to verify your Gmail address and complete your reader account registration on <strong>${siteName}</strong>:
              </p>

              <!-- 6-Digit OTP Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 10px 0 28px;">
                <tr>
                  <td align="center">
                    <div style="background: linear-gradient(135deg, #1E1B4B 0%, #312E81 100%); border: 2px dashed #6366F1; padding: 18px 24px; border-radius: 12px; display: inline-block; box-shadow: 0 4px 18px rgba(99,102,241,0.35);">
                      <span style="font-size: 36px; font-weight: 900; letter-spacing: 12px; color: #FFFFFF; font-family: 'Courier New', Courier, monospace; display: inline-block; padding-left: 12px;">
                        ${otpCode}
                      </span>
                    </div>
                  </td>
                </tr>
              </table>

              <div style="padding: 14px 18px; background-color: rgba(245,158,11,0.12); border-left: 3px solid #F59E0B; border-radius: 6px; margin-bottom: 24px;">
                <p style="margin: 0; font-size: 13px; color: #FCD34D; line-height: 1.5;">
                  ⏰ <strong>Notice:</strong> This verification code expires in <strong>10 minutes</strong>. Do not share this code with anyone.
                </p>
              </div>

              <p style="margin: 0; font-size: 13px; color: #6B7280; line-height: 1.5;">
                If you did not request to create an account on ${siteName}, please ignore this email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 36px; background-color: #0B0F19; border-top: 1px solid #1F2937; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #4B5563;">
                © ${new Date().getFullYear()} ${siteName}. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `;

      const info = await transporter.sendMail({
        from: `"${siteName} Security" <${config.email.user || 'aw419770@gmail.com'}>`,
        to: toEmail,
        subject: `[${siteName}] ${otpCode} is your Gmail verification code`,
        text: `Your ${siteName} verification code is: ${otpCode}. It will expire in 10 minutes.`,
        html,
      });

      console.log(`[EmailService] Registration OTP dispatched to ${toEmail} (Message ID: ${info.messageId})`);
      return true;
    } catch (error) {
      console.error('[EmailService] Failed to send registration OTP email:', error);
      throw error;
    }
  }

  // 2. Send Account Email Verification Link
  public static async sendVerificationEmail(toEmail: string, userName: string, token: string): Promise<boolean> {
    try {
      const verifyUrl = `${config.frontendUrl}/verify-email?token=${encodeURIComponent(token)}`;
      const transporter = this.getTransporter();

      const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your BitBlog Reader Account</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0F172A; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #F8FAFC;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0F172A; padding: 40px 15px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="580px" cellpadding="0" cellspacing="0" style="max-width: 580px; background-color: #1E293B; border-radius: 16px; border: 1px solid #334155; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
          
          <!-- Header Branding -->
          <tr>
            <td style="padding: 35px 35px 20px; text-align: center; background: linear-gradient(180deg, rgba(99,102,241,0.15) 0%, rgba(30,41,59,0) 100%);">
              <h1 style="margin: 0; font-size: 26px; font-weight: 800; color: #FFFFFF; letter-spacing: -0.5px;">
                Bit<span style="color: #6366F1;">Blog</span>
              </h1>
              <p style="margin: 6px 0 0 0; font-size: 13px; color: #94A3B8; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">
                Digital Publication & Editorial Platform
              </p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 20px 35px 35px;">
              <h2 style="margin: 0 0 16px; font-size: 20px; font-weight: 700; color: #FFFFFF;">
                Welcome, ${userName}! 👋
              </h2>
              <p style="margin: 0 0 20px; font-size: 15px; line-height: 1.6; color: #CBD5E1;">
                Thank you for registering your reader account on <strong>BitBlog</strong>. To ensure account security and activate your access to exclusive articles, bookmarks, and discussions, please verify your email address.
              </p>

              <!-- Verification Call to Action -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 28px 0;">
                <tr>
                  <td align="center">
                    <a href="${verifyUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #6366F1 0%, #4F46E5 100%); color: #FFFFFF; font-size: 15px; font-weight: 700; text-decoration: none; padding: 14px 34px; border-radius: 10px; box-shadow: 0 4px 14px rgba(99,102,241,0.4); border: 1px solid rgba(255,255,255,0.2);">
                      Verify My Account →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 10px; font-size: 13px; color: #94A3B8; line-height: 1.5;">
                Or copy and paste this verification URL into your web browser:
              </p>
              <div style="background-color: #0F172A; border: 1px solid #334155; padding: 10px 14px; border-radius: 8px; font-size: 12px; color: #818CF8; word-break: break-all; margin-bottom: 24px; font-family: monospace;">
                ${verifyUrl}
              </div>

              <div style="padding: 12px 16px; background-color: rgba(245,158,11,0.1); border-left: 3px solid #F59E0B; border-radius: 4px;">
                <p style="margin: 0; font-size: 12px; color: #FCD34D;">
                  ⏰ <strong>Security Notice:</strong> This verification link will expire in <strong>24 hours</strong>. If you did not create a BitBlog account, please ignore this email.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 35px; background-color: #0F172A; border-top: 1px solid #334155; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #64748B;">
                © ${new Date().getFullYear()} BitBlog Digital Publication. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `;

      const info = await transporter.sendMail({
        from: config.email.from,
        to: toEmail,
        subject: `Verify your BitBlog Reader Account, ${userName}`,
        text: `Welcome to BitBlog, ${userName}! Please verify your email by clicking the following link: ${verifyUrl} (Valid for 24 hours).`,
        html,
      });

      console.log(`[EmailService] Verification email sent to ${toEmail}. MessageId: ${info.messageId}`);
      return true;
    } catch (error) {
      console.error(`[EmailService] Failed to send verification email to ${toEmail}:`, error);
      return false;
    }
  }

  // 2. Send Welcome Confirmation Email
  public static async sendWelcomeEmail(toEmail: string, userName: string): Promise<boolean> {
    try {
      const exploreUrl = `${config.frontendUrl}/blog`;
      const transporter = this.getTransporter();

      const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Account Verified! Welcome to BitBlog</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0F172A; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #F8FAFC;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0F172A; padding: 40px 15px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="580px" cellpadding="0" cellspacing="0" style="max-width: 580px; background-color: #1E293B; border-radius: 16px; border: 1px solid #334155; padding: 35px; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
          <tr>
            <td align="center" style="padding-bottom: 20px;">
              <h1 style="margin: 0; font-size: 26px; font-weight: 800; color: #FFFFFF;">
                Bit<span style="color: #6366F1;">Blog</span>
              </h1>
            </td>
          </tr>
          <tr>
            <td>
              <h2 style="margin: 0 0 14px; font-size: 20px; font-weight: 700; color: #10B981;">
                🎉 Account Successfully Verified!
              </h2>
              <p style="margin: 0 0 18px; font-size: 15px; line-height: 1.6; color: #CBD5E1;">
                Hello <strong>${userName}</strong>, your email has been confirmed and your reader account is now active. You can bookmark stories, join community discussions, and apply to become an Author or Editor.
              </p>
              <div style="text-align: center; margin: 25px 0;">
                <a href="${exploreUrl}" target="_blank" style="display: inline-block; background: #6366F1; color: #FFFFFF; font-size: 14px; font-weight: 700; text-decoration: none; padding: 12px 28px; border-radius: 8px;">
                  Explore Latest Stories →
                </a>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `;

      await transporter.sendMail({
        from: config.email.from,
        to: toEmail,
        subject: `Welcome to BitBlog, ${userName}! Your account is verified`,
        html,
      });

      return true;
    } catch (error) {
      console.error(`[EmailService] Failed to send welcome email to ${toEmail}:`, error);
      return false;
    }
  }

  // 3. Send Password Reset Email
  public static async sendPasswordResetEmail(toEmail: string, userName: string, resetToken: string): Promise<boolean> {
    try {
      const resetUrl = `${config.frontendUrl}/reset-password?token=${encodeURIComponent(resetToken)}`;
      const transporter = this.getTransporter();

      const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Reset Your BitBlog Password</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0F172A; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #F8FAFC;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0F172A; padding: 40px 15px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="580px" cellpadding="0" cellspacing="0" style="max-width: 580px; background-color: #1E293B; border-radius: 16px; border: 1px solid #334155; padding: 35px;">
          <tr>
            <td>
              <h2 style="margin: 0 0 14px; font-size: 20px; font-weight: 700; color: #FFFFFF;">
                Password Reset Request
              </h2>
              <p style="margin: 0 0 18px; font-size: 15px; line-height: 1.6; color: #CBD5E1;">
                Hello ${userName}, we received a request to reset your BitBlog password. Click the link below to set a new password:
              </p>
              <div style="text-align: center; margin: 25px 0;">
                <a href="${resetUrl}" target="_blank" style="display: inline-block; background: #EF4444; color: #FFFFFF; font-size: 14px; font-weight: 700; text-decoration: none; padding: 12px 28px; border-radius: 8px;">
                  Reset Password →
                </a>
              </div>
              <p style="margin: 0; font-size: 12px; color: #94A3B8;">
                This link will expire in 1 hour. If you did not request this, you can safely ignore this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `;

      await transporter.sendMail({
        from: config.email.from,
        to: toEmail,
        subject: `Reset your BitBlog Password`,
        html,
      });

      return true;
    } catch (error) {
      console.error(`[EmailService] Failed to send password reset email to ${toEmail}:`, error);
      return false;
    }
  }
}
