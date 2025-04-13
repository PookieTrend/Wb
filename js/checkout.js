document.addEventListener("DOMContentLoaded", async function () {
    // Prevent cart modal from appearing on the checkout page
    if (window.location.pathname.includes("order-checkout.html")) {
        let cartModal = document.getElementById("cart-modal");
        if (cartModal) cartModal.style.display = "none";
        
        let cartOpener = document.querySelector(".cart-opener");
        if (cartOpener) {
            cartOpener.style.display = "inline-block";
        }
    }

    // Retrieve the logged-in user's ID from localStorage (if previously stored)
    const userId = sessionStorage.getItem("user_id");

    if (!userId) {
        alert("Please log in to use the checkout.");
        window.location.href = "login.html";
        return;
    }

    // Initialize Supabase Client
    const supabaseUrl = "https://qonnughbkdvopqwqmxow.supabase.co";
    const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvbm51Z2hia2R2b3Bxd3FteG93Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIwNTg1NDQsImV4cCI6MjA1NzYzNDU0NH0.MHA50QOAOe9c5DzDl_I4RdBakcbVJEeG0mv3Zkh-0So";
    const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

    try {
        // Fetch cart data from Supabase for the logged-in user
        const { data: cart, error } = await supabase
            .from("cart")
            .select("*")
            .eq("user_id", userId);

        if (error) {
            console.error("Error fetching cart data:", error.message);
            return;
        }

        if (!cart || cart.length === 0) {
            console.error("Cart is empty.");
            return;
        }

        const holder = document.querySelector(".holder .block");
        if (!holder) return;

        let total = 0;
        let shippingFee = 50; // Default shipping fee

        // Clear previous content
        holder.innerHTML = `
            <li>
                <div class="txt-holder">
                    <div class="text-wrap pull-left"><strong style="color: #696969;">PRODUCTS</strong></div>
                    <div class="text-wrap txt text-right pull-right"><strong style="color: #696969;">TOTALS</strong></div>
                </div>
            </li>
        `;

        cart.forEach(item => {
            let itemTotal = item.product_price * item.quantity;
            total += itemTotal;

            let listItem = document.createElement("li");
            listItem.innerHTML = `
                <div class="txt-holder">
                    <div class="text-wrap pull-left">
                        <strong class="title" style="color:#696969;">${item.product_name} x ${item.quantity}</strong>
                    </div>
                    <div class="text-wrap txt text-right pull-right">
                        <strong class="title" style="color:#696969;"><i class="fa fa-rupee"></i> ${itemTotal.toFixed(2)}</strong>
                    </div>
                </div>
            `;
            holder.appendChild(listItem);
        });

        // Add Shipping Fee and Total
        holder.innerHTML += `
            <li>
                <div class="txt-holder">
                    <div class="text-wrap pull-left"><strong style="color: #696969;">SHIPPING FEE</strong></div>
                    <div class="text-wrap txt text-right pull-right">
                        <strong style="color: #696969;"><i class="fa fa-rupee"></i> ${shippingFee.toFixed(2)}</strong>
                    </div>
                </div>
            </li>
            <li>
                <div class="txt-holder">
                    <div class="text-wrap pull-left"><strong style="color: #696969;">ORDER TOTAL</strong></div>
                    <div class="text-wrap txt text-right pull-right">
                        <strong style="color: #696969;"><i class="fa fa-rupee"></i> ${(total + shippingFee).toFixed(2)}</strong>
                    </div>
                </div>
            </li>
            <a style="color:black !important";>Currently we are accepting only CASH ON DELIVERY mode of payment</a>
        `;

    } catch (error) {
        console.error("Error fetching cart data:", error);
    }
});
