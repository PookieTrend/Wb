document.addEventListener("DOMContentLoaded", () => {
    const supabaseUrl = "https://qonnughbkdvopqwqmxow.supabase.co";
    const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvbm51Z2hia2R2b3Bxd3FteG93Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIwNTg1NDQsImV4cCI6MjA1NzYzNDU0NH0.MHA50QOAOe9c5DzDl_I4RdBakcbVJEeG0mv3Zkh-0So";
    const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

    const productForm = document.getElementById("product-form");
    const productType = document.getElementById("product-type");
    const productIdInput = document.getElementById("product-id");

    let currentPrefix = ""; // To store the selected prefix

    // Update Product ID input placeholder based on Product Type selection
    productType.addEventListener("change", () => {
        switch (productType.value) {
            case "Oversize t-shirt":
                currentPrefix = "OVERSIZEDPRODUCT";
                break;
            case "Polo t-shirt":
                currentPrefix = "POLOPRODUCT00";
                break;
            case "Vests":
                currentPrefix = "VESTPRODUCT";
                break;
            case "SuperHero t-shirt":
                currentPrefix = "HEROPRODUCT00";
                break;
            default:
                currentPrefix = "";
        }
        
        productIdInput.placeholder = `Enter last 3 digits (e.g., 001)`;
        productIdInput.value = ""; // Clear previous input
    });

    productForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const productName = document.getElementById("product-name").value;
        const productTypeValue = productType.value;
        const lastThreeDigits = productIdInput.value.trim();
        const productPrice = document.getElementById("product-price").value;
        const productDescription = document.getElementById("product-description").value;
        const productImage = document.getElementById("product-image").files[0];

        // Validate last three digits
        if (!/^\d{3}$/.test(lastThreeDigits)) {
            alert("Product ID should be exactly 3 digits (e.g., 001).");
            return;
        }

        if (!productImage) {
            alert("Please upload a product image.");
            return;
        }

        try {
            // Upload Image to Supabase Storage
            const { data: imageData, error: imageError } = await supabase
                .storage.from("product-images")
                .upload(`images/${Date.now()}_${productImage.name}`, productImage);

            if (imageError) throw imageError;

            const imageUrl = `${supabaseUrl}/storage/v1/object/public/product-images/${imageData.path}`;

            // Combine Prefix and Last Three Digits to form complete product_id
            const product_id = `${currentPrefix}${lastThreeDigits}`;

            // Insert Product Data into Supabase Database
            const { data, error } = await supabase.from("products").insert([{
                product_id: product_id,
                product_name: productName,
                product_price: productPrice,
                product_description: productDescription,
                product_image: imageUrl
            }]);

            if (error) throw error;

            alert("Product added successfully!");
            productForm.reset();
        } catch (error) {
            console.error("Error adding product:", error.message);
            alert("Failed to add product. Please try again.");
        }
    });
});