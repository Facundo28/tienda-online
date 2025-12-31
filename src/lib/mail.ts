import nodemailer from "nodemailer";

const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
const SMTP_PORT = parseInt(process.env.SMTP_PORT || "587");
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  if (!SMTP_USER || !SMTP_PASS) {
      console.warn("⚠️ SMTP Credentials missing. Check .env");
      console.log(`[EMAIL DEV] To: ${to} | Subject: ${subject}`);
      console.log(html);
      return;
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  try {
      await transporter.sendMail({
        from: `"Market E.C Security" <${SMTP_USER}>`,
        to,
        subject,
        html,
      });
  } catch (error) {
      console.error("Email send failed:", error);
      throw new Error("No se pudo enviar el correo.");
  }
}
