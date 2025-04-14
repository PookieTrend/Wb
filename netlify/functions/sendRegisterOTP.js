import fetch from "node-fetch";

export async function handler(event) {
  try {
    const { email, otp } = JSON.parse(event.body);

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f0f0f0; border-radius: 10px; border: 1px solid #ddd;">
        <div style="text-align: center;">
            <img src="https://qonnughbkdvopqwqmxow.supabase.co/storage/v1/object/sign/product-images/LOGO4.png?token=..." alt="Pookie Trend Logo" width="100" style="margin-bottom: 20px;">
            <h2 style="color: #C71585;">OTP Verification</h2>
        </div>
        <p style="color: #333; line-height: 1.6;">
            Hello,<br><br>
            Your One-Time Password (OTP) for registration is:
        </p>
        <div style="text-align: center; margin: 20px 0;">
            <span style="font-size: 24px; font-weight: bold; padding: 10px 20px; background-color: #C71585; color: white; border-radius: 5px;">${otp}</span>
        </div>
        <p style="color: #333; line-height: 1.6;">
            Please enter this OTP to proceed. This OTP is valid for the next <strong>5 minutes</strong>.<br><br>
            If you did not request this, you can safely ignore this email.<br><br>
            Best regards,<br>
            <strong>Pookie Trend</strong>
        </p>
        <div style="text-align: center; margin-top: 30px;">
            <img src="https://qonnughbkdvopqwqmxow.supabase.co/storage/v1/object/sign/product-images/LOGO4.png?token=..." alt="Pookie Trend Logo" width="80">
        </div>
      </div>
    `;

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.BREVO_API_KEY
      },
      body: JSON.stringify({
        sender: { name: "Pookie Trend", email: "trendpookie@gmail.com" },
        to: [{ email }],
        subject: "OTP Verification - Pookie Trend",
        htmlContent
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(JSON.stringify(error));
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "OTP sent successfully" })
    };

  } catch (err) {
    console.error("OTP Email Error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to send OTP", error: err.message })
    };
  }
}
