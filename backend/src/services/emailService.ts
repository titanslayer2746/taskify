import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false, // For self-signed certificates
  },
  // Connection timeout settings
  connectionTimeout: 10000, // 10 seconds
  greetingTimeout: 5000, // 5 seconds
  socketTimeout: 10000, // 10 seconds
});

export async function sendEmail(
  to: string,
  subject: string,
  text: string,
  html?: string
) {
  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to,
    subject,
    text,
    html,
  });
}

// OTP verification email
export async function sendOtpVerification(
  email: string,
  name: string,
  otp: string
): Promise<boolean> {
  try {
    const subject = "Verify Your Email - Taskify";
    const text = `
Welcome to Taskify!

Hi ${name},

Thank you for signing up with Taskify. To complete your registration, please verify your email address using this OTP:

${otp}

This OTP will expire in 10 minutes.

If you didn't create an account with Taskify, please ignore this email.

Best regards,
The Taskify Team
    `;

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email - Taskify</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #1f2937 0%, #111827 100%);">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background: linear-gradient(135deg, #1f2937 0%, #111827 100%);">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; background: rgba(31, 41, 55, 0.8); border-radius: 16px; border: 1px solid rgba(55, 65, 81, 0.3); backdrop-filter: blur(10px); box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);">
          <!-- Header -->
          <tr>
            <td align="center" style="padding: 40px 20px 20px;">
              <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #a855f7 0%, #3b82f6 50%, #10b981 100%); border-radius: 12px; display: inline-block; margin-bottom: 20px;">
                <div style="width: 24px; height: 24px; background: linear-gradient(135deg, #c084fc 0%, #60a5fa 100%); border-radius: 8px; margin: 12px auto;">
                </div>
              </div>
              <h1 style="margin: 0; font-size: 24px; font-weight: bold; background: linear-gradient(135deg, #a855f7 0%, #3b82f6 50%, #10b981 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
                Welcome to Taskify!
              </h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 0 40px 40px;">
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #9ca3af;">
                Hi ${name},
              </p>
              <p style="margin: 0 0 30px; font-size: 16px; line-height: 1.6; color: #9ca3af;">
                Thank you for signing up with Taskify. To complete your registration, please verify your email address using this OTP:
              </p>
              
              <!-- OTP Display -->
              <div style="text-align: center; margin: 40px 0;">
                <div style="display: inline-block; background: rgba(17, 24, 39, 0.8); border-radius: 12px; border: 2px solid #4b5563; padding: 30px; min-width: 300px;">
                  <p style="margin: 0 0 10px; font-size: 14px; font-weight: 500; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px;">
                    Your Verification Code
                  </p>
                  <div style="display: flex; gap: 12px; justify-content: center; margin-top: 20px;">
                    ${otp
                      .split("")
                      .map(
                        (digit) => `
                      <div style="width: 50px; height: 50px; background: rgba(17, 24, 39, 0.8); border: 1px solid #4b5563; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                        <span style="font-size: 28px; font-weight: bold; color: #f3f4f6; font-family: 'Courier New', monospace;">${digit}</span>
                      </div>
                    `
                      )
                      .join("")}
                  </div>
                </div>
              </div>
              
              <div style="background: rgba(168, 85, 247, 0.1); border-left: 4px solid #a855f7; padding: 15px; border-radius: 8px; margin: 30px 0;">
                <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #c084fc;">
                  ⏱️ This OTP will expire in <strong>10 minutes</strong>.
                </p>
              </div>
              
              <p style="margin: 20px 0 0; font-size: 14px; line-height: 1.6; color: #6b7280;">
                If you didn't create an account with Taskify, please ignore this email.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; border-top: 1px solid #374151;">
              <p style="margin: 0; font-size: 14px; color: #6b7280; text-align: center;">
                Best regards,<br>
                <strong style="background: linear-gradient(135deg, #a855f7 0%, #3b82f6 50%, #10b981 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">The Taskify Team</strong>
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

    await sendEmail(email, subject, text, html);
    console.log("OTP verification email sent to:", email);
    return true;
  } catch (error) {
    console.error("Error sending OTP verification email:", error);
    return false;
  }
}

// Password reset email
export async function sendPasswordReset(
  email: string,
  name: string,
  resetLink: string
): Promise<boolean> {
  try {
    const subject = "Reset Your Password - Taskify";
    const text = `
Password Reset Request - Taskify

Hi ${name},

We received a request to reset your password. Click the link below to reset your password:

${resetLink}

This link will expire in 1 hour.

If you didn't request a password reset, please ignore this email.

Best regards,
The Taskify Team
    `;

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password - Taskify</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #1f2937 0%, #111827 100%);">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background: linear-gradient(135deg, #1f2937 0%, #111827 100%);">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; background: rgba(31, 41, 55, 0.8); border-radius: 16px; border: 1px solid rgba(55, 65, 81, 0.3); backdrop-filter: blur(10px); box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);">
          <!-- Header -->
          <tr>
            <td align="center" style="padding: 40px 20px 20px;">
              <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #a855f7 0%, #3b82f6 50%, #10b981 100%); border-radius: 12px; display: inline-block; margin-bottom: 20px;">
                <div style="width: 24px; height: 24px; background: linear-gradient(135deg, #c084fc 0%, #60a5fa 100%); border-radius: 8px; margin: 12px auto;">
                </div>
              </div>
              <h1 style="margin: 0; font-size: 24px; font-weight: bold; background: linear-gradient(135deg, #a855f7 0%, #3b82f6 50%, #10b981 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
                Reset Your Password
              </h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 0 40px 40px;">
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #9ca3af;">
                Hi ${name},
              </p>
              <p style="margin: 0 0 30px; font-size: 16px; line-height: 1.6; color: #9ca3af;">
                We received a request to reset your password. Click the button below to reset your password:
              </p>
              
              <!-- Reset Button -->
              <div style="text-align: center; margin: 40px 0;">
                <a href="${resetLink}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #9333ea 0%, #2563eb 50%, #059669 100%); color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 12px; box-shadow: 0 10px 20px rgba(147, 51, 234, 0.3); transition: all 0.3s ease;">
                  Reset Password
                </a>
              </div>
              
              <div style="background: rgba(234, 88, 12, 0.1); border-left: 4px solid #ea580c; padding: 15px; border-radius: 8px; margin: 30px 0;">
                <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #fb923c;">
                  ⏱️ This link will expire in <strong>1 hour</strong>.
                </p>
              </div>
              
              <p style="margin: 20px 0 0; font-size: 14px; line-height: 1.6; color: #6b7280;">
                If you didn't request a password reset, please ignore this email.
              </p>
              
              <p style="margin: 20px 0 0; font-size: 14px; line-height: 1.6; color: #6b7280; word-break: break-all;">
                Or copy and paste this link in your browser:<br>
                <a href="${resetLink}" style="color: #a855f7; text-decoration: none;">${resetLink}</a>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; border-top: 1px solid #374151;">
              <p style="margin: 0; font-size: 14px; color: #6b7280; text-align: center;">
                Best regards,<br>
                <strong style="background: linear-gradient(135deg, #a855f7 0%, #3b82f6 50%, #10b981 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">The Taskify Team</strong>
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

    await sendEmail(email, subject, text, html);
    console.log("Password reset email sent to:", email);
    return true;
  } catch (error) {
    console.error("Error sending password reset email:", error);
    return false;
  }
}
