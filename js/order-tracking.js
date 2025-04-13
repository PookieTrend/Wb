document.addEventListener("DOMContentLoaded", function () {
    const supabaseUrl = "https://qonnughbkdvopqwqmxow.supabase.co";
    const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvbm51Z2hia2R2b3Bxd3FteG93Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIwNTg1NDQsImV4cCI6MjA1NzYzNDU0NH0.MHA50QOAOe9c5DzDl_I4RdBakcbVJEeG0mv3Zkh-0So";
    window.supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
});

async function fetchOrderStatus() {
    const orderId = document.getElementById("orderId").value;
    const popup = document.getElementById("orderPopup");
    const popupContent = document.getElementById("popupContent");

    if (!orderId) {
        alert("Please enter an Order ID.");
        return;
    }

    popupContent.innerHTML = "<p>Loading...</p>";
    popup.style.display = "block";

    try {
        // Fetch order status from Supabase
        const { data, error } = await supabase
            .from("order_history")
            .select("status, updated_at")
            .eq("order_id", orderId)
            .order("updated_at", { ascending: true });

        if (error) throw error;

        if (data.length === 0) {
            popupContent.innerHTML = "<p>Currently, We are processing your order.</p>";
            return;
        }

        // Display Order Tracking
        popupContent.innerHTML = data.map((item, index) => `
            <div class="status-item">
                <div class="status-icon">${index + 1}</div>
                <p>${item.status} - ${new Date(item.updated_at).toLocaleString()}</p>
            </div>
        `).join("");

    } catch (err) {
        console.error("Error fetching order status:", err);
        popupContent.innerHTML = "<p>Error loading order status.</p>";
    }
}

function closePopup() {
    document.getElementById("orderPopup").style.display = "none";
}
