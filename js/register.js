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
        return fetch("/.netlify/functions/sendRegisterOTP", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, otp })
        })
            .then(response => {
                if (response.ok) {
                    console.log("OTP sent successfully.");
                } else {
                    console.error("Failed to send OTP");
                }
            })
            .catch(error => {
                console.error("Error sending OTP:", error);
            });
    }
});
