document.addEventListener("DOMContentLoaded", async function () {
    const supabaseUrl = "https://qonnughbkdvopqwqmxow.supabase.co";
    const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvbm51Z2hia2R2b3Bxd3FteG93Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIwNTg1NDQsImV4cCI6MjA1NzYzNDU0NH0.MHA50QOAOe9c5DzDl_I4RdBakcbVJEeG0mv3Zkh-0So";
    const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
    const userId = sessionStorage.getItem('user_id');
    if (!userId) {
        alert("Unauthorized access. Please try again.");
        window.location.href = "login.html";
        return;
    }

    const resetForm = document.getElementById("reset-form");

    async function hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest("SHA-256", data);
        return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
    }

    if (resetForm) {
        resetForm.addEventListener("submit", async function (event) {
            event.preventDefault();

            const newPassword = document.getElementById("new-password").value.trim();
            const confirmPassword = document.getElementById("confirm-password").value.trim();

            if (newPassword !== confirmPassword) {
                alert("Passwords do not match.");
                return;
            }

            const hashedPassword = await hashPassword(newPassword);

            const { error } = await supabase
                .from('users')
                .update({ password: hashedPassword })
                .eq('id', userId);

            if (error) {
                alert("Error resetting password. Please try again.");
            } else {
                alert("Password successfully reset! Please log in with your new password.");
                sessionStorage.removeItem('user_id');
                window.location.href = "login.html";
            }
        });
    }
});