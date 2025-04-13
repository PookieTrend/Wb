document.addEventListener("DOMContentLoaded", () => {
    const supabaseUrl = "https://qonnughbkdvopqwqmxow.supabase.co";
    const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvbm51Z2hia2R2b3Bxd3FteG93Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIwNTg1NDQsImV4cCI6MjA1NzYzNDU0NH0.MHA50QOAOe9c5DzDl_I4RdBakcbVJEeG0mv3Zkh-0So";
    const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

    const productsTableBody = document.querySelector("#products-table tbody");

    // Attach Event Listeners
    function attachEventListeners() {
        document.querySelectorAll(".update-btn").forEach(button => {
            button.addEventListener("click", async () => {
                const row = button.closest("tr");
                const id = button.getAttribute("data-id");

                const productNameInput = row.querySelector('input[name="product_name"]');
                const productName = productNameInput ? productNameInput.value : null;

                const productPriceInput = row.querySelector('input[name="product_price"]');
                const productPrice = productPriceInput ? parseFloat(productPriceInput.value) : null;

                const productDescriptionInput = row.querySelector('input[name="product_description"]');
                const productDescription = productDescriptionInput ? productDescriptionInput.value : null;

                if (!productName || !productPrice || !productDescription) {
                    alert("Please fill all the fields before updating.");
                    return;
                }

                const productImageInput = row.querySelector(".image-input").files[0];
                let imageUrl = row.querySelector("img").src; 

                if (productImageInput) {
                    const { data: imageData, error: imageError } = await supabase
                        .storage
                        .from("product-images")
                        .upload(`images/${Date.now()}_${productImageInput.name}`, productImageInput);

                    if (imageError) {
                        console.error("Image upload failed:", imageError.message);
                        alert("Image upload failed.");
                        return;
                    }

                    const { data: publicUrlData } = await supabase
                        .storage
                        .from("product-images")
                        .getPublicUrl(imageData.path);

                    if (publicUrlData) {
                        imageUrl = publicUrlData.publicUrl;
                    }
                }

                const updatedData = {
                    product_name: productName,
                    product_price: productPrice,
                    product_description: productDescription,
                    product_image: imageUrl
                };

                await updateProduct(id, updatedData);
            });
        });

        document.querySelectorAll(".delete-btn").forEach(button => {
            button.addEventListener("click", async () => {
                const id = button.getAttribute("data-id");

                if (confirm("Are you sure you want to delete this product?")) {
                    await deleteProduct(id);
                }
            });
        });
    }

    async function fetchProducts() {
        const { data: products, error } = await supabase.from("products").select("*");

        if (error) {
            console.error("Error fetching products:", error.message);
            return;
        }

        productsTableBody.innerHTML = "";

        products.forEach(product => {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td><input type="text" id="product_id_${product.product_id}" name="product_id" value="${product.product_id}" readonly></td>
                <td><input type="text" id="product_name_${product.product_id}" name="product_name" value="${product.product_name}"></td>
                <td><input type="number" id="product_price_${product.product_id}" name="product_price" value="${product.product_price}"></td>
                <td><input type="text" id="product_description_${product.product_id}" name="product_description" value="${product.product_description}"></td>
                <td>
                    <input type="file" accept="image/*" class="image-input" id="product_image_${product.product_id}" name="product_image">
                </td>
                <td><button class="update-btn" data-id="${product.product_id}" style="background-color: #f0a500; color: white; box-shadow: 0 0 5px #f0a500; padding: 6px 15px; border: none; border-radius: 4px; cursor: pointer; transition: all 0.3s; font-weight: bold;">Update</button></td>
                <td><button class="delete-btn" data-id="${product.product_id}" style="background-color: #d9534f; color: white; box-shadow: 0 0 5px #d9534f; padding: 6px 15px; border: none; border-radius: 4px; cursor: pointer; transition: all 0.3s; font-weight: bold;">Delete</button></td>
            `;

            productsTableBody.appendChild(row);
        });

        attachEventListeners();
    }

    async function updateProduct(id, updatedData) {
        const { error } = await supabase.from("products").update(updatedData).eq("product_id", id);

        if (error) {
            console.error("Error updating product:", error.message);
            alert("Failed to update product. Please try again.");
        } else {
            alert("Product updated successfully.");
            fetchProducts();
        }
    }

    async function deleteProduct(id) {
        const { error } = await supabase.from("products").delete().eq("product_id", id);

        if (error) {
            console.error("Error deleting product:", error.message);
            alert("Failed to delete product.");
        } else {
            alert("Product deleted successfully.");
            fetchProducts();
        }
    }

    fetchProducts();
});
