import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const FROM_ADDRESS = process.env.SMTP_FROM || "no-reply@amakenrealestate.com";
const SITE_NAME = process.env.SITE_NAME || "Amaken Real Estate";

export async function sendOtpEmail(
  to: string,
  otp: string
): Promise<boolean> {
  try {
    const html = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="UTF-8"><title>Verification Code</title></head>
      <body style="margin:0;padding:20px;background-color:#f6f9fc;font-family:Segoe UI,Roboto,sans-serif;">
        <div style="max-width:600px;margin:40px auto;background-color:#ffffff;padding:40px;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.05);border:1px solid #e0e0e0;">
          <div style="text-align:center;margin-bottom:30px;">
            <img src="https://www.telal-contracting.com/images/amaken%20logo%20(1).png" style="width:150px;">
          </div>
          <h2 style="color:#202124;font-weight:500;font-size:22px;margin-bottom:15px;">Your Verification Code</h2>
          <p style="color:#5f6368;font-size:16px;line-height:1.6;">
            To continue securely, please use the following code to verify your identity.
          </p>
          <div style="text-align:center;margin:30px 0;">
            <span style="display:inline-block;font-size:24px;color:#1a73e8;background-color:#f1f3f4;padding:15px 30px;border-radius:8px;font-weight:600;letter-spacing:3px;">
              ${otp}
            </span>
          </div>
          <p style="color:#5f6368;font-size:14px;line-height:1.5;">
            This code is valid for a limited time. Please do not share it with anyone.
          </p>
          <hr style="border:none;border-top:1px solid #e0e0e0;margin:40px 0;">
          <p style="color:#999;font-size:12px;text-align:center;">
            Sent by ${SITE_NAME}<br>
            <a style="color:#999;" href="mailto:${FROM_ADDRESS}">${FROM_ADDRESS}</a>
          </p>
        </div>
      </body>
      </html>`;

    await transporter.sendMail({
      from: `"${SITE_NAME}" <${FROM_ADDRESS}>`,
      to,
      subject: `Your Verification Code - ${SITE_NAME}`,
      html,
    });
    return true;
  } catch (err) {
    console.error("Failed to send OTP email:", err);
    return false;
  }
}

export async function sendPasswordResetEmail(
  to: string,
  otp: string
): Promise<boolean> {
  try {
    const html = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="UTF-8"><title>Password Reset</title></head>
      <body style="margin:0;padding:20px;background-color:#f6f9fc;font-family:Segoe UI,Roboto,sans-serif;">
        <div style="max-width:600px;margin:40px auto;background-color:#ffffff;padding:40px;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.05);border:1px solid #e0e0e0;">
          <div style="text-align:center;margin-bottom:30px;">
            <img src="https://www.telal-contracting.com/images/amaken%20logo%20(1).png" style="width:150px;">
          </div>
          <h2 style="color:#202124;font-weight:500;font-size:22px;margin-bottom:15px;">Password Reset Code</h2>
          <p style="color:#5f6368;font-size:16px;line-height:1.6;">
            We received a request to reset your password. Use the code below:
          </p>
          <div style="text-align:center;margin:30px 0;">
            <span style="display:inline-block;font-size:24px;color:#1a73e8;background-color:#f1f3f4;padding:15px 30px;border-radius:8px;font-weight:600;letter-spacing:3px;">
              ${otp}
            </span>
          </div>
          <p style="color:#5f6368;font-size:14px;line-height:1.5;">
            If you did not request this, you can safely ignore this email.
          </p>
          <hr style="border:none;border-top:1px solid #e0e0e0;margin:40px 0;">
          <p style="color:#999;font-size:12px;text-align:center;">
            Sent by ${SITE_NAME}<br>
            <a style="color:#999;" href="mailto:${FROM_ADDRESS}">${FROM_ADDRESS}</a>
          </p>
        </div>
      </body>
      </html>`;

    await transporter.sendMail({
      from: `"${SITE_NAME}" <${FROM_ADDRESS}>`,
      to,
      subject: `Password Reset - ${SITE_NAME}`,
      html,
    });
    return true;
  } catch (err) {
    console.error("Failed to send password reset email:", err);
    return false;
  }
}

export async function sendAdminNotificationEmail(
  adminEmail: string,
  customerEmail: string
): Promise<boolean> {
  try {
    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background-color:#f9f9f9;border:1px solid #ddd;border-radius:8px;text-align:center;">
        <div style="margin-bottom:20px;">
          <img src="https://www.telal-contracting.com/images/amaken%20logo%20(1).png" style="width:150px;">
        </div>
        <h2 style="font-size:24px;color:#333;margin-bottom:10px;">New Customer Verification</h2>
        <p style="font-size:16px;color:#555;margin-bottom:20px;">A customer has registered via the website.</p>
        <p style="font-size:16px;color:#777;margin-bottom:10px;"><strong>Email:</strong> ${customerEmail}</p>
        <p style="font-size:12px;color:#aaa;margin-top:30px;">${new Date().toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" })}</p>
      </div>`;

    await transporter.sendMail({
      from: `"${SITE_NAME}" <${FROM_ADDRESS}>`,
      to: adminEmail,
      subject: "New Customer Account Verification",
      html,
    });
    return true;
  } catch (err) {
    console.error("Failed to send admin notification:", err);
    return false;
  }
}
