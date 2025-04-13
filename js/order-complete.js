document.addEventListener("DOMContentLoaded", async function () {
    const supabaseUrl = "https://qonnughbkdvopqwqmxow.supabase.co";
    const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvbm51Z2hia2R2b3Bxd3FteG93Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIwNTg1NDQsImV4cCI6MjA1NzYzNDU0NH0.MHA50QOAOe9c5DzDl_I4RdBakcbVJEeG0mv3Zkh-0So";
    const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

    // Retrieve the logged-in user's ID from sessionStorage
    const userId = sessionStorage.getItem("user_id");

    if (!userId) {
        alert("Please log in to view your order details.");
        window.location.href = "login.html";
        return;
    }

    try {
        // Fetch the latest order_id for the user
        const { data, error } = await supabase
            .from("billing_details")
            .select("order_id")
            .eq("user_id", userId)
            .order("created_at", { ascending: false })
            .limit(1);

        if (error) throw error;

        if (data.length > 0) {
            const orderId = data[0].order_id;
            const successMessageDiv = document.querySelector(".order-t");

            if (successMessageDiv) {
                successMessageDiv.innerHTML = `
                    <p style="color:white;">Your Order ID : <strong>${orderId}</strong></p>
                `;
            }
        } else {
            console.warn("No order found for the user.");
        }
    } catch (error) {
        console.error("Error fetching order ID:", error.message);
    }
});
