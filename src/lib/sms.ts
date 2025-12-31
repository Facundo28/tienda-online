const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

export async function sendSMS({
  to,
  body,
}: {
  to: string;
  body: string;
}) {
  // 1. Fallback for Dev (No Credentials)
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
    console.warn("⚠️ Twilio Credentials missing in .env. SMS not sent.");
    console.log(`[SMS PREVIEW] To: ${to} | Body: "${body}"`);
    return;
  }

  // 2. Real Sending Implementation
  try {
    const basicAuth = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64');
    
    // Using Fetch to avoid adding 'twilio' node dependency heavily
    const params = new URLSearchParams();
    params.append('To', to);
    params.append('From', TWILIO_PHONE_NUMBER);
    params.append('Body', body);

    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`, {
        method: "POST",
        headers: {
            "Authorization": `Basic ${basicAuth}`,
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: params
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || res.statusText);
    }

  } catch (error) {
    console.error("SMS Failed:", error);
    // Don't throw in production to avoid crashing if credit runs out? 
    // Usually better to throw so user knows.
    throw new Error("No se pudo enviar el SMS.");
  }
}
