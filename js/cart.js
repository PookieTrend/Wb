document.addEventListener("DOMContentLoaded", async function () {
    const supabaseUrl = "https://qonnughbkdvopqwqmxow.supabase.co";
    const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvbm51Z2hia2R2b3Bxd3FteG93Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIwNTg1NDQsImV4cCI6MjA1NzYzNDU0NH0.MHA50QOAOe9c5DzDl_I4RdBakcbVJEeG0mv3Zkh-0So";
    const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

    const userId = sessionStorage.getItem('user_id'); // Retrieve user_id from localStorage

    if (!userId) {
        alert("Please log in to use the cart.");
        window.location.href = "login.html";
        return;
    }

    // ✅ Update Cart Count
    async function updateCartCount() {
        const { data: cartItems, error } = await supabase
            .from("cart")
            .select("quantity")
            .eq("user_id", userId);

        if (error) {
            console.error("Error fetching cart items:", error.message);
            return;
        }

        let cartCountElement = document.querySelector(".cart-opener .num");
        if (cartCountElement) {
            cartCountElement.textContent = cartItems.reduce((total, item) => total + item.quantity, 0);
        }
    }

    // ✅ Display Cart Items
    async function displayCartItems() {
        const { data: cartItems, error } = await supabase
            .from("cart")
            .select("*")
            .eq("user_id", userId);

        if (error) {
            console.error("Error fetching cart items:", error.message);
            return;
        }

        const cartContainer = document.querySelector("#cart-items-container");
        const subtotalElement = document.querySelector(".mt-total-txt");
        let subtotal = 0;

        if (!cartContainer) return;
        cartContainer.innerHTML = "";

        cartItems.forEach((item) => {
            let itemTotal = item.product_price * item.quantity;
            subtotal += itemTotal;

            let cartRow = document.createElement("div");
            cartRow.classList.add("cart-row");
            cartRow.innerHTML = `
                <a href="#" class="img">
                    <img src="${item.product_image}" alt="${item.product_name}" style="width: 40px; height: 40px;">
                </a>
                <span>${item.product_name}</span>
                <span>₹${item.product_price.toFixed(2)}</span>
                <div>
                    <button class="qty-btn" data-id="${item.id}" data-action="decrease">-</button>
                    <span>${item.quantity}</span>
                    <button class="qty-btn" data-id="${item.id}" data-action="increase">+</button>
                </div>
                <a href="#" class="close" data-id="${item.id}">X</a>
            `;

            cartContainer.appendChild(cartRow);
        });

        if (subtotalElement) {
            subtotalElement.innerHTML = `<i class="fa fa-rupee"></i> ${subtotal.toFixed(2)}`;
        }

        attachEventListeners();
    }

    // ✅ Attach Event Listeners
    function attachEventListeners() {
        document.querySelectorAll(".qty-btn").forEach(button => {
            button.addEventListener("click", function () {
                const id = button.getAttribute("data-id");
                const action = button.getAttribute("data-action");
                updateCartQuantity(id, action);
            });
        });

        document.querySelectorAll(".close").forEach(button => {
            button.addEventListener("click", function (event) {
                event.preventDefault();
                const id = button.getAttribute("data-id");
                removeFromCart(id);
            });
        });

        document.getElementById("remove-all")?.addEventListener("click", removeAllItems);
        document.getElementById("checkout")?.addEventListener("click", checkout);
    }

    // Show Cart Popup Notification (Small Notification)
    function showCartPopup() {
        let popup = document.getElementById("cart-popup");
        if (popup) {
            popup.style.display = "block";
            setTimeout(() => {
                popup.style.display = "none";
            }, 3000); // Auto-hide after 3 seconds
        }
    }



    // ✅ Add to Cart
    async function addToCart(event) {
        event.preventDefault();

        let productElement = event.target.closest(".product-post");
        if (!productElement) return;

        // Make sure your product element has the 'data-id' attribute
        let productId = productElement.getAttribute("data-id");
        if (!productId) {
            console.error("Product ID is missing. Make sure the product-post element has the 'data-id' attribute.");
            return;
        }

        let productName = productElement.querySelector(".title a")?.textContent.trim();
        let productPrice = parseFloat(productElement.querySelector(".price")?.textContent.replace(/[^\d.]/g, ""));
        let productImage = productElement.querySelector(".img-holder img")?.src;

        if (!productName || isNaN(productPrice) || !productImage) {
            console.error("Product details are missing. Ensure product name, price, and image are present.");
            return;
        }

        const { data, error } = await supabase.from("cart").insert([{
            user_id: userId,
            product_id: productId,
            product_name: productName,
            product_price: productPrice,
            product_image: productImage,
            quantity: 1
        }]);

        if (error) {
            console.error("Error adding item to cart:", error.message);
        } else {
            showCartPopup();
            updateCartCount();
            displayCartItems();
        }
    }


    // ✅ Update Cart Quantity
    async function updateCartQuantity(id, action) {
        const { data: cartItem, error } = await supabase
            .from("cart")
            .select("*")
            .eq("id", id)
            .single();

        if (error || !cartItem) {
            console.error("Error fetching cart item:", error?.message);
            return;
        }

        let newQuantity = action === "increase" ? cartItem.quantity + 1 : cartItem.quantity - 1;

        if (newQuantity <= 0) {
            await removeFromCart(id);
        } else {
            await supabase.from("cart").update({ quantity: newQuantity }).eq("id", id);
            displayCartItems();
        }
    }

    // ✅ Remove from Cart
    async function removeFromCart(id) {
        await supabase.from("cart").delete().eq("id", id);
        updateCartCount();
        displayCartItems();
    }

    // ✅ Remove All Items
    async function removeAllItems() {
        await supabase.from("cart").delete().eq("user_id", userId);
        updateCartCount();
        displayCartItems();
    }

    // ✅ Checkout
    function checkout() {
        window.location.href = "order-checkout.html";
    }

    // Show Cart Empty Popup Notification (Small Notification)
    function showCartEmptyPopup() {
        let popup = document.getElementById("cart-empty-popup");
        if (popup) {
            popup.style.display = "block";
            setTimeout(() => {
                popup.style.display = "none";
            }, 3000); // Auto-hide after 3 seconds
        }
    }

    // ✅ Toggle Cart Modal (Modified)
    async function toggleCartModal(event) {
        event.preventDefault();
        const cartModal = document.getElementById("cart-modal");

        const { data: cartItems, error } = await supabase
            .from("cart")
            .select("*")
            .eq("user_id", userId);

        if (error) {
            console.error("Error fetching cart items:", error.message);
            return;
        }

        if (cartItems.length === 0) {
            showCartEmptyPopup();  // Show empty cart message if the cart is empty
            return; // Prevents displayCartItems() from executing
        }

        if (cartModal) {
            cartModal.style.display = cartModal.style.display === "flex" ? "none" : "flex";
            displayCartItems();
        }
    }


    const viewCartButton = document.querySelector(".cart-opener");
    if (viewCartButton) viewCartButton.addEventListener("click", toggleCartModal);

    const closeCartButton = document.getElementById("close-cart");
    if (closeCartButton) closeCartButton.addEventListener("click", () => document.getElementById("cart-modal").style.display = "none");

    document.querySelectorAll(".btn-cart").forEach(button => {
        button.addEventListener("click", addToCart);
    });

    updateCartCount();
    displayCartItems();
});
