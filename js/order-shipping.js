document.addEventListener("DOMContentLoaded", async function () {
    const supabaseUrl = "https://qonnughbkdvopqwqmxow.supabase.co";
    const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvbm51Z2hia2R2b3Bxd3FteG93Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIwNTg1NDQsImV4cCI6MjA1NzYzNDU0NH0.MHA50QOAOe9c5DzDl_I4RdBakcbVJEeG0mv3Zkh-0So";
    const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

    // Fetch logged-in user ID
    const loggedInUserId = sessionStorage.getItem("user_id");

    if (!loggedInUserId) {
        alert("Please log in to use the cart.");
        window.location.href = "login.html";
        return;
    }

    let subtotal = 0;
    let shippingCost = 50; // Default shipping cost
    let cartTotal = 0;

    try {
        // Fetch cart items from Supabase
        const { data: cart, error } = await supabase
            .from("cart")
            .select("*")
            .eq("user_id", loggedInUserId);

        if (error) {
            console.error("Error fetching cart data:", error.message);
            return;
        }

        // Calculate Subtotal
        cart.forEach(item => {
            subtotal += item.product_price * item.quantity;
        });

        // Calculate Total (Subtotal + Shipping)
        cartTotal = subtotal + shippingCost;

        // Product Table Container
        const productTable = document.querySelector(".mt-product-table .container");

        if (productTable) {
            // Clear previous content
            productTable.innerHTML = `
                <div class="row border">
                    <div class="col-xs-12 col-sm-6"><strong class="title">PRODUCT</strong></div>
                    <div class="col-xs-12 col-sm-2"><strong class="title">PRICE</strong></div>
                    <div class="col-xs-12 col-sm-2"><strong class="title">QUANTITY</strong></div>
                    <div class="col-xs-12 col-sm-2"><strong class="title">TOTAL</strong></div>
                </div>
            `;

            // Dynamically add each product from the cart
            cart.forEach((item, index) => {
                let itemTotal = item.product_price * item.quantity;

                let row = document.createElement("div");
                row.classList.add("row", "border");

                row.innerHTML = `
                    <div class="col-xs-12 col-sm-2">
                        <div class="img-holder">
                            <img src="${item.product_image}" alt="${item.product_name}" style="width: 60px; height: 60px;">
                        </div>
                    </div>
                    <div class="col-xs-12 col-sm-4">
                        <strong class="product-name">${item.product_name}</strong>
                    </div>
                    <div class="col-xs-12 col-sm-2">
                        <strong class="price"><i class="fa fa-rupee"></i> ${item.product_price.toFixed(2)}</strong>
                    </div>
                    <div class="col-xs-12 col-sm-2">
                        <form action="#" class="qyt-form">
                            <fieldset>
                                <input type="number" min="1" value="${item.quantity}" data-index="${index}" class="quantity-input" style="width: 60px; color: #696969;">
                            </fieldset>
                        </form>
                    </div>
                    <div class="col-xs-12 col-sm-2">
                        <strong class="price"><i class="fa fa-rupee"></i> ${itemTotal.toFixed(2)}</strong>
                        <a href="#" class="remove-item" data-id="${item.id}" style="color: red; margin-left: 10px;">
                            <i class="fa fa-close"></i>
                        </a>
                    </div>
                `;
                productTable.appendChild(row);
            });
        }

        // Update UI with calculated values
        const cartSubtotalElement = document.querySelector(".cart li:nth-child(1) .txt span");
        const shippingElement = document.querySelector(".cart li:nth-child(2) .txt strong");
        const cartTotalElement = document.querySelector(".cart li:nth-child(3) .txt span");

        if (cartSubtotalElement) {
            cartSubtotalElement.innerHTML = `<i class="fa fa-rupee"></i> ${subtotal.toFixed(2)}`;
        }
        if (shippingElement) {
            shippingElement.innerHTML = `<span style="color: #696969;"><i class="fa fa-rupee"></i> ${shippingCost.toFixed(2)}</span>`;
        }
        if (cartTotalElement) {
            cartTotalElement.innerHTML = `<i class="fa fa-rupee"></i> ${cartTotal.toFixed(2)}`;
        }

        // Event listener for removing items
        document.querySelectorAll(".remove-item").forEach(button => {
            button.addEventListener("click", async function (event) {
                event.preventDefault();
                const itemId = this.getAttribute("data-id");

                const { error } = await supabase
                    .from("cart")
                    .delete()
                    .eq("id", itemId);

                if (error) {
                    console.error("Error deleting item from cart:", error.message);
                } else {
                    location.reload();
                }
            });
        });

        // Event listener for quantity change
        document.querySelectorAll(".quantity-input").forEach(input => {
            input.addEventListener("change", async function () {
                const index = parseInt(this.getAttribute("data-index"));
                const newQuantity = parseInt(this.value);
                const itemId = cart[index].id;

                if (newQuantity > 0) {
                    const { error } = await supabase
                        .from("cart")
                        .update({ quantity: newQuantity })
                        .eq("id", itemId);

                    if (error) {
                        console.error("Error updating quantity:", error.message);
                    } else {
                        location.reload();
                    }
                }
            });
        });

    } catch (error) {
        console.error("Error fetching data from Supabase:", error.message);
    }
});

// Redirect to order-checkout.html when clicking on the Proceed to Checkout button
const proceedToCheckoutBtn = document.querySelector(".process-btn");
if (proceedToCheckoutBtn) {
    proceedToCheckoutBtn.addEventListener("click", function (event) {
        event.preventDefault();
        window.location.href = "order-checkout.html";
    });
}
