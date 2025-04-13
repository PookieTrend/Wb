document.querySelector('.process-btn').addEventListener('click', async (e) => {
    const supabaseUrl = "https://qonnughbkdvopqwqmxow.supabase.co";
    const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvbm51Z2hia2R2b3Bxd3FteG93Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIwNTg1NDQsImV4cCI6MjA1NzYzNDU0NH0.MHA50QOAOe9c5DzDl_I4RdBakcbVJEeG0mv3Zkh-0So";
    const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
    e.preventDefault();

    // Get the user ID from session storage (Set during login)
    const userId = sessionStorage.getItem('user_id');

    if (!userId) {
        alert("You must be logged in to proceed.");
        return;
    }

    // Get form values
    const Name = document.getElementById('billing-name').value.trim();
    const LastName = document.getElementById('billing-lastname').value.trim();
    const Address = document.getElementById('billing-address').value.trim();
    const City = document.getElementById('billing-city').value.trim();
    const State = document.getElementById('billing-state').value.trim();
    const Pincode = document.getElementById('billing-pincode').value.trim();
    const Email = document.getElementById('billing-email').value.trim();
    const MyEmail = "amankumarsrivastav124@gmail.com";
    const Phone = document.getElementById('billing-phone').value.trim();
    const OrderNotes = document.getElementById('billing-notes').value.trim();
    const Size = document.getElementById('billing-size').value.trim(); // optional field

    // Check if any required field is empty
    if (!Name || !LastName || !Address || !City || !State || !Pincode || !Email || !Phone) {
        alert("Please fill in all the required billing details.");
        return;
    }

    function sendOrderConfirmationEmail(customerEmail, customerContent, adminEmail, adminContent) {
        fetch("/.netlify/functions/sendEmail", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                customerEmail: customerEmail,
                adminEmail: adminEmail,
                customerContent: customerContent,
                adminContent: adminContent
            })
        })
        .then(response => {
            if (response.ok) {
                console.log("Emails sent successfully.");
            } else {
                console.error("Failed to send emails.");
            }
        })
        .catch(error => {
            console.error("Error sending emails:", error);
        });
    }    


    const loadingPopup = document.createElement('div');
    loadingPopup.innerHTML = `
        <div id="loading-popup" style="
            position: fixed;
            top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.7);
            display: flex; justify-content: center; align-items: center;
            color: white; font-size: 20px; font-weight: bold;
            z-index: 9999;">
            Processing your order, please wait...
        </div>
    `;
    document.body.appendChild(loadingPopup);

    try {
        // Fetch Cart Items for the Logged-In User
        const { data: cartItems, error: cartError } = await supabase
            .from('cart')
            .select('*')
            .eq('user_id', userId);

        if (cartError) throw cartError;

        if (cartItems.length === 0) {
            alert("Your cart is empty.");
            return;
        }

        // Fetch existing order_id for the user
        const { data: existingOrder, error: orderError } = await supabase
            .from('billing_details')
            .select('order_id')
            .eq('user_id', userId)
            .order('id', { ascending: false })
            .limit(1);

        if (orderError) throw orderError;

        // Generate a new order_id if the user doesn't have one
        let orderId = existingOrder.length > 0 ? existingOrder[0].order_id : generateOrderId();

        // Insert Billing Details for Each Product in the Cart
        for (let item of cartItems) {
            const { error: billingError } = await supabase
                .from('billing_details')
                .insert([{
                    user_id: userId,
                    order_id: orderId, // Assign order_id
                    name: Name,
                    lastname: LastName,
                    address: Address,
                    city: City,
                    state: State,
                    pincode: Pincode,
                    email: Email,
                    phonenumber: Phone,
                    ordernotes: OrderNotes,
                    product_id: item.product_id,
                    product_name: item.product_name,
                    product_price: item.product_price,
                    quantity: item.quantity,
                    size: Size || null
                }]);

            if (billingError) throw billingError;
        }

        // Prepare order summary for email
        let orderSummary = `
            <h2>Order Confirmation - Pookie Trend</h2>
            <p><strong>Order ID:</strong> ${orderId}</p>
            <p><strong>Name:</strong> ${Name} ${LastName}</p>
            <p><strong>Address:</strong> ${Address}, ${City}, ${State}, ${Pincode}</p>
            <p><strong>Email:</strong> ${Email}</p>
            <p><strong>Phone:</strong> ${Phone}</p>
            <p><strong>Order Notes:</strong> ${OrderNotes || "N/A"}</p>
            <h3>Order Details:</h3>
            <ul>`;

        let UserOrderSummary = `
            <h2>Order Confirmed - Pookie Trend</h2>
            <p><strong>Order ID:</strong> ${orderId}</p>
            <h3>Order Details:</h3>
            <ul>`;

        cartItems.forEach(item => {
            orderSummary += `<li>${item.product_name} - ${item.quantity} x ₹${item.product_price} ${Size ? `(Size: ${Size})` : ''}</li>`;
        });

        cartItems.forEach(item => {
            UserOrderSummary += `<li>${item.product_name} - ${item.quantity} x ₹${item.product_price} ${Size ? `(Size: ${Size})` : ''}</li>`;
        });

        UserOrderSummary += `</ul><p>Thank you for shopping with us!</p>`;

        // Send confirmation email
        sendOrderConfirmationEmail(Email, UserOrderSummary, MyEmail, orderSummary);


        setTimeout(() => {
            document.getElementById('loading-popup').remove(); // Remove the popup
            window.location.href = "Order-Complete.html"; // Redirect after delay
        }, 3000);

    } catch (error) {
        console.error('Error storing billing details:', error.message);
        alert("An error occurred while saving billing details.");
        document.getElementById('loading-popup').remove(); // Remove popup in case of error
    }

    // Function to generate a random 7-character alphanumeric order ID
    function generateOrderId() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 7; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

});
