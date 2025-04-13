document.addEventListener("DOMContentLoaded", function () {
    const supabaseUrl = "https://qonnughbkdvopqwqmxow.supabase.co";
    const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvbm51Z2hia2R2b3Bxd3FteG93Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIwNTg1NDQsImV4cCI6MjA1NzYzNDU0NH0.MHA50QOAOe9c5DzDl_I4RdBakcbVJEeG0mv3Zkh-0So";
    const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

    let generatedOTP = null;
    let userEmail = null;
    let userData = null;

    const registerForm = document.getElementById("register-form");
    const otpPopup = document.getElementById("otp-popup");
    const verifyOtpBtn = document.getElementById("verify-otp");
    const errorAlert = document.getElementById("errorAlert");
    const errorMessage = document.getElementById("errorMessage");
    const closeButton = document.getElementById("error-close-btn");

    const privacyLink = document.querySelector(".privacy a");
    const privacyPopup = document.getElementById("privacy-popup");
    const closePrivacyButton = document.getElementById("close-privacy-popup");

    if (privacyLink && privacyPopup && closePrivacyButton) {
        privacyLink.addEventListener("click", function (event) {
            event.preventDefault();
            privacyPopup.style.display = "block";
            document.body.style.overflow = "hidden"; // Disable background scrolling
        });

        closePrivacyButton.addEventListener("click", function () {
            privacyPopup.style.display = "none";
            document.body.style.overflow = "auto"; // Enable background scrolling
        });
    }

    closeButton.addEventListener("click", function () {
        errorAlert.style.display = "none";
    });

    function showErrorAlert(message) {
        errorMessage.textContent = message;
        errorAlert.style.display = "flex";
    }

    // Real-Time Validation Function
    function validateInput(input, regex, warningMessage) {
        if (!regex.test(input.value)) {
            input.style.border = "1px solid red";
            showErrorAlert(warningMessage);
        } else {
            input.style.border = "";
            errorAlert.style.display = "none";
        }
    }

    // Username Validation & Existence Check
    const usernameInput = document.getElementById("username");
    if (usernameInput) {
        usernameInput.addEventListener("input", async () => {
            const username = usernameInput.value.trim();

            if (!/^[a-zA-Z0-9]+$/.test(username)) {
                usernameInput.style.border = "1px solid red";
                showErrorAlert("Invalid username! Only alphanumeric characters are allowed.");
                return;
            }

            if (username.length > 0) {
                // Check if the username already exists in the Supabase database
                const { data, error } = await supabase
                    .from('users')
                    .select('username')
                    .eq('username', username)
                    .single();

                if (data) {  // If data exists, username is already taken
                    usernameInput.style.border = "1px solid red";
                    showErrorAlert("Username is already taken, Try a different Username");
                } else {
                    usernameInput.style.border = "";
                    errorAlert.style.display = "none";
                }
            }
        });
    }

    // Password Validation
    const passwordInput = document.getElementById("password");
    if (passwordInput) {
        passwordInput.addEventListener("input", () => {
            validateInput(passwordInput, /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                "Password must be at least 8 characters long, with letters, numbers, and special characters.");
        });
    }

    // Email Validation
    const emailInput = document.getElementById("email");
    if (emailInput) {
        emailInput.addEventListener("input", async () => {
            const email = emailInput.value.trim();

            if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
                emailInput.style.border = "1px solid red";
                showErrorAlert("Invalid email format.");
                return;
            }

            if (email.length > 0) {
                // Check if the email already exists in the Supabase database
                const { data, error } = await supabase
                    .from('users')
                    .select('email')
                    .eq('email', email)
                    .single();

                if (data) {  // If data exists, email is already registered
                    emailInput.style.border = "1px solid red";
                    showErrorAlert("User Already Exists, You can login with your credentials.");
                } else {
                    emailInput.style.border = "";
                    errorAlert.style.display = "none";
                }
            }
        });
    }


    if (otpPopup) otpPopup.style.display = "none";
    otpPopup.style.visibility = "hidden";  // This ensures it stays hidden on refresh


    if (registerForm) {
        registerForm.addEventListener("submit", async function (e) {
            e.preventDefault();

            userEmail = emailInput.value.trim();
            const username = usernameInput.value.trim();
            const password = passwordInput.value.trim();

            if (!userEmail || !username || !password) {
                showErrorAlert("Please fill all the fields.");
                return;
            }

            userData = { email: userEmail, username: username, password: password };

            generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();

            await sendOTPEmail(userEmail, generatedOTP);

            otpPopup.style.display = "flex";
            otpPopup.style.visibility = "visible";  // Make the popup visible again

        });
    }

    if (verifyOtpBtn) {
        verifyOtpBtn.addEventListener("click", async function () {
            const enteredOtp = document.getElementById("otp-input").value.trim();

            if (enteredOtp === generatedOTP) {
                otpVerified = true;
                alert("You have been successfully registered.");

                const hashedPassword = await hashPassword(userData.password);

                const { data, error } = await supabase.from("users").insert([{
                    email: userData.email,
                    username: userData.username,
                    password: hashedPassword
                }]);

                if (error) {
                    showErrorAlert("Registration failed. Please try again.");
                } else {
                    window.location.href = "login.html";
                }
            } else {
                showErrorAlert("Invalid OTP. Please try again.");
            }
        });
    }

    async function hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
    }

    function sendOTPEmail(email, otp) {
        fetch("https://api.brevo.com/v3/smtp/email", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "api-key": "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"
            },
            body: JSON.stringify({
                sender: { name: "Pookie Trend", email: "trendpookie@gmail.com" },
                to: [{ email: email }],
                subject: "OTP Verification - Pookie Trend",
                htmlContent: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f0f0f0; border-radius: 10px; border: 1px solid #ddd;">
                    <div style="text-align: center;">
                        <img src="https://qonnughbkdvopqwqmxow.supabase.co/storage/v1/object/sign/product-images/LOGO4.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJwcm9kdWN0LWltYWdlcy9MT0dPNC5wbmciLCJpYXQiOjE3NDI2ODU5MTIsImV4cCI6MTkwMDM2NTkxMn0.Y2L94dHjbhAE3KCmQnx1V6z4dLfBOOdLkc8Bp9T3dU0" alt="Pookie Trend Logo" width="100" style="margin-bottom: 20px;">
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
                        <img src="https://qonnughbkdvopqwqmxow.supabase.co/storage/v1/object/sign/product-images/LOGO4.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJwcm9kdWN0LWltYWdlcy9MT0dPNC5wbmciLCJpYXQiOjE3NDI2ODU5MTIsImV4cCI6MTkwMDM2NTkxMn0.Y2L94dHjbhAE3KCmQnx1V6z4dLfBOOdLkc8Bp9T3dU0" alt="Pookie Trend Logo" width="80">
                    </div>
                </div>`
            })
        })
            .then(response => {
                if (response.ok) {
                    console.log("OTP sent successfully.");
                } else {
                    console.error("Error sending OTP:", response.statusText);
                }
            })
            .catch(error => console.error("Error sending OTP:", error));
    }
});
