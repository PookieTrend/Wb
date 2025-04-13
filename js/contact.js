document.addEventListener("DOMContentLoaded", function () {
    const supabaseUrl = "https://qonnughbkdvopqwqmxow.supabase.co";
    const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvbm51Z2hia2R2b3Bxd3FteG93Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIwNTg1NDQsImV4cCI6MjA1NzYzNDU0NH0.MHA50QOAOe9c5DzDl_I4RdBakcbVJEeG0mv3Zkh-0So";
    const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

    const contactForm = document.querySelector(".contact-form");

    if (contactForm) {
        contactForm.addEventListener("submit", async function (event) {
            event.preventDefault();

            const name = contactForm.querySelector('input[placeholder="Name"]').value.trim();
            const email = contactForm.querySelector('input[placeholder="E-Mail"]').value.trim();
            const subject = contactForm.querySelector('input[placeholder="Subject"]').value.trim();
            const message = contactForm.querySelector('textarea[placeholder="Message"]').value.trim();

            if (!name || !email || !message) {
                showPopup("Please fill in all the required fields: Name, E-Mail, and Message.", "error");
                return;
            }

            try {
                const { data, error } = await supabase
                    .from('contact_us')
                    .insert([{ name, email, subject, message }]);

                if (error) {
                    console.error('Error storing contact message:', error.message);
                    showPopup("Failed to send your message. Please try again.", "error");
                } else {
                    showPopup("Your message has been sent successfully. We'll get back to you soon.", "success");
                    contactForm.reset();
                }
            } catch (error) {
                console.error('Error inserting data:', error.message);
                showPopup("An error occurred. Please try again.", "error");
            }
        });
    }

    // Function to show popup message
    function showPopup(message, type) {
        const popup = document.createElement("div");
        popup.className = `custom-popup ${type}`;
        popup.innerHTML = `
            <span>${message}</span>
            <button class="close-popup">✖</button>
        `;

        document.body.appendChild(popup);

        // Close button event listener
        popup.querySelector(".close-popup").addEventListener("click", () => popup.remove());

        // Automatically remove popup after 3 seconds
        setTimeout(() => popup.remove(), 3000);
    }
});
