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

      if (!res.ok) {
        const error = await res.json();
        throw new Error(`Failed to send to ${toEmail}: ${JSON.stringify(error)}`);
      }
    };

    // Send email to customer
    await sendEmail(customerEmail, customerContent, "Your Order Confirmation - Pookie Trend");

    // Send email to admin
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
