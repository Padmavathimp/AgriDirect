
// AgriDirect - Add Product with Image Compression

const productForm = document.getElementById("productForm");

if (productForm) {
    productForm.addEventListener("submit", function(event) {
        event.preventDefault();

        const cropName = document.getElementById("cropName").value.trim();
        const category = document.getElementById("category").value;
        const price = Number(document.getElementById("price").value);
        const quantity = Number(document.getElementById("quantity").value);
        const description = document.getElementById("description").value.trim();
        const imageFile = document.getElementById("productImage").files[0];

        const user = JSON.parse(localStorage.getItem("loggedInUser") || "null");

        if (!user) {
            alert("Please login first.");
            return;
        }

        if (!cropName || !category || !description || price <= 0 || quantity <= 0 || !imageFile) {
            alert("Please fill all fields correctly and select an image.");
            return;
        }

        if (!imageFile.type.startsWith("image/")) {
            alert("Please select a valid image.");
            return;
        }

        const reader = new FileReader();

        reader.onload = function() {
            const image = new Image();

            image.onload = function() {
                const canvas = document.createElement("canvas");
                const maxSize = 700;

                let width = image.width;
                let height = image.height;

                if (width > height && width > maxSize) {
                    height = Math.round(height * maxSize / width);
                    width = maxSize;
                } else if (height > maxSize) {
                    width = Math.round(width * maxSize / height);
                    height = maxSize;
                }

                canvas.width = width;
                canvas.height = height;

                const context = canvas.getContext("2d");
                context.drawImage(image, 0, 0, width, height);

                const compressedImage = canvas.toDataURL("image/jpeg", 0.6);

                try {
                    const products = JSON.parse(localStorage.getItem("products") || "[]");

                    const newProduct = {
                        id: Date.now(),
                        cropName,
                        category,
                        price,
                        quantity,
                        description,
                        image: compressedImage,
                        farmer: user.name
                    };

                    products.push(newProduct);
                    localStorage.setItem("products", JSON.stringify(products));

                    alert("Product added successfully!");
                    productForm.reset();
                    window.location.href = "my-products.html";

                } catch (error) {
                    console.error("Product saving error:", error);
                    alert("Storage is still full. Existing saved products are safe. We need to move product images to a larger storage system.");
                }
            };

            image.onerror = function() {
                alert("Unable to process this image. Please choose another.");
            };

            image.src = reader.result;
        };

        reader.readAsDataURL(imageFile);
    });
}
