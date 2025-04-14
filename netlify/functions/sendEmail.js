import fetch from "node-fetch";

export async function handler(event) {
  try {
    const { customerEmail, adminEmail, customerContent, adminContent } = JSON.parse(event.body);

    // Function to send email
    const sendEmail = async (toEmail, htmlContent, subject) => {
      const res = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": process.env.BREVO_API_KEY,
        },
        body: JSON.stringify({
          sender: { name: "Pookie Trend", email: "trendpookie@gmail.com" },
          to: [{ email: toEmail }],
          subject,
          htmlContent,
        }),
      });

      // Log response status
      console.log(`Response status for ${toEmail}:`, res.status);

      // If not successful, log detailed response and throw
      if (!res.ok) {
        const errorText = await res.text(); // raw text in case it's not JSON
        console.error(`Error response from Brevo for ${toEmail}:`, errorText);
        throw new Error(`Failed to send email to ${toEmail}. Status: ${res.status}`);
      }
    };

    // Send emails
    await sendEmail(customerEmail, customerContent, "Your Order Confirmation - Pookie Trend");
    await sendEmail(adminEmail, adminContent, "New Order Received - Pookie Trend");

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Emails sent successfully" }),
    };
  } catch (err) {
    console.error("Email Function Error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to send email", error: err.message }),
    };
  }
}
