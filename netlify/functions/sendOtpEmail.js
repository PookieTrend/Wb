import fetch from "node-fetch";

export async function handler(event) {
  try {
    const { userEmail, otp } = JSON.parse(event.body);

    if (!userEmail || !otp) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Missing userEmail or otp" })
      };
    }

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.BREVO_API_KEY // ✅ hidden in Netlify env
      },
      body: JSON.stringify({
        sender: { name: "Pookie Trend", email: "trendpookie@gmail.com" },
        to: [{ email: userEmail }],
        subject: "Password Reset OTP - Pookie Trend",
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f0f0f0; border-radius: 10px; border: 1px solid #ddd;">
              <div style="text-align: center;">
                  <img src="https://qonnughbkdvopqwqmxow.supabase.co/storage/v1/object/sign/product-images/LOGO4.png" width="100" style="margin-bottom: 20px;" />
                  <h2 style="color: #C71585;">OTP Verification</h2>
              </div>
              <p>Hello,<br>Your OTP is:</p>
              <div style="text-align: center; margin: 20px 0;">
                  <span style="font-size: 24px; font-weight: bold; padding: 10px 20px; background-color: #C71585; color: white; border-radius: 5px;">
                      ${otp}
                  </span>
              </div>
              <p>This OTP is valid for 5 minutes. Please don't share it with anyone.<br><br>Best regards,<br><strong>Pookie Trend</strong></p>
          </div>
        `
      })
    });

    if (response.ok) {
      return {
        statusCode: 200,
        body: JSON.stringify({ message: "OTP email sent successfully." })
      };
    } else {
      const error = await response.text();
      return {
        statusCode: response.status,
        body: JSON.stringify({ message: "Email sending failed", error })
      };
    }
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Server error", error: err.message })
    };
  }
}
