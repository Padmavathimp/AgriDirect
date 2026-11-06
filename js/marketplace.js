
// AgriDirect - Complete Marketplace

const productList = document.getElementById("productList");
const searchProduct = document.getElementById("searchProduct");
const categoryFilter = document.getElementById("categoryFilter");
const priceSort = document.getElementById("priceSort");

// Display Products
function displayProducts() {

    let products = JSON.parse(localStorage.getItem("products")) || [];
    const reviews = JSON.parse(localStorage.getItem("reviews")) || {};

    if (!productList) return;

    // Assign category to older products
    products.forEach(product => {
        if (!product.category) {
            product.category = "Other";
        }
    });

    localStorage.setItem("products", JSON.stringify(products));

    const search = searchProduct
        ? searchProduct.value.toLowerCase().trim()
        : "";

    const category = categoryFilter
        ? categoryFilter.value
        : "All";

    const sorting = priceSort
        ? priceSort.value
        : "default";

    productList.innerHTML = "";

    // Search and Category Filter
    let filteredProducts = products.filter(product => {

        const crop = String(product.cropName || "").toLowerCase();
        const categoryName = String(product.category || "Other");

        const matchesSearch = crop.includes(search);

        const matchesCategory =
            category === "All" || categoryName === category;

        return matchesSearch && matchesCategory;
    });

    // Price Sorting
    if (sorting === "low") {
        filteredProducts.sort(
            (a, b) => Number(a.price) - Number(b.price)
        );
    }

    if (sorting === "high") {
        filteredProducts.sort(
            (a, b) => Number(b.price) - Number(a.price)
        );
    }

    // No Products
    if (filteredProducts.length === 0) {
        productList.textContent = "No products available. Please add products first.";
        return;
    }

    // Display Each Product
    filteredProducts.forEach(product => {

        const card = document.createElement("div");

        card.style.cssText =
            "width:280px;padding:15px;background:white;border-radius:12px;border:1px solid #ddd;margin:10px;";

        // Product Image
        const img = document.createElement("img");

        img.src = product.image || "";
        img.alt = product.cropName || "Product";

        img.style.cssText =
            "width:100%;height:160px;object-fit:cover;border-radius:8px;";

        // Product Details
        card.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;gap:5px;">

                <span style="background:#e2f7e7;color:#16803c;padding:6px 10px;border-radius:20px;font-size:12px;font-weight:bold;">
                    🌱 Fresh Product
                </span>

                <span style="background:#fff0d9;color:#a65b00;padding:6px 10px;border-radius:20px;font-size:12px;font-weight:bold;">
                    ${Number(product.quantity) > 0 ? "In Stock" : "Out of Stock"}
                </span>

            </div>

            <h3>${product.cropName || "Product"}</h3>

            <p>Category: ${product.category}</p>

            <p>Price: ₹${product.price} / Kg</p>

            <p>Available: ${product.quantity} Kg</p>

            <p>Farmer: ${product.farmer || "Farmer"}</p>

            <p>${product.description || ""}</p>

            <p style="background:#e5f7e8;color:#167333;padding:10px;border-radius:8px;font-weight:bold;">
                🎉 Buy more than 10 Kg and get 10% OFF!
            </p>

            <label>Choose Quantity (Kg):</label>

            <input type="number" class="buyQuantity"
                min="1" max="${product.quantity}" value="1"
                style="width:80px;padding:6px;"
                ${Number(product.quantity) <= 0 ? "disabled" : ""}>
        `;

        // Add image AFTER setting card HTML
        card.prepend(img);

        // Add to Cart Button
        const addButton = document.createElement("button");

        addButton.textContent = "Add to Cart";

        if (Number(product.quantity) <= 0) {
            addButton.disabled = true;
            addButton.textContent = "Out of Stock";
            addButton.style.background = "#999";
        }

        addButton.addEventListener("click", function() {

            const quantity = Number(
                card.querySelector(".buyQuantity").value
            );

            const stock = Number(product.quantity);

            if (!Number.isInteger(quantity) ||
                quantity < 1 || quantity > stock) {

                alert("Please enter a valid quantity.");
                return;
            }

            let cart =
                JSON.parse(localStorage.getItem("cart")) || [];

            const existingItem = cart.find(
                item => String(item.id) === String(product.id)
            );

            const totalQuantity = existingItem
                ? Number(existingItem.quantity) + quantity
                : quantity;

            if (totalQuantity > stock) {
                alert("Only " + stock + " Kg available.");
                return;
            }

            const originalPrice = Number(product.price);

            const finalPrice = totalQuantity > 10
                ? originalPrice * 0.90
                : originalPrice;

            if (existingItem) {

                existingItem.quantity = totalQuantity;
                existingItem.price = finalPrice;
                existingItem.originalPrice = originalPrice;

            } else {

                cart.push({
                    id: product.id,
                    cropName: product.cropName,
                    price: finalPrice,
                    originalPrice: originalPrice,
                    quantity: quantity
                });
            }

            localStorage.setItem(
                "cart",
                JSON.stringify(cart)
            );

            alert(
                product.cropName + " added to cart!\n" +
                "Quantity: " + totalQuantity + " Kg\n" +
                "Price per Kg: ₹" + finalPrice.toFixed(2) +
                (totalQuantity > 10
                    ? "\n10% discount applied!" : "")
            );
        });

        card.appendChild(addButton);

        // Reviews and Ratings
        const productReviews = reviews[String(product.id)] || [];

        const averageRating = productReviews.length
            ? productReviews.reduce(
                (sum, review) => sum + Number(review.rating), 0
              ) / productReviews.length
            : 0;

        const reviewSection = document.createElement("div");

        reviewSection.style.cssText =
            "margin-top:15px;border-top:1px solid #ddd;padding-top:10px;";

        // Average Rating
        const ratingInfo = document.createElement("p");

        if (productReviews.length > 0) {

            ratingInfo.textContent =
                "⭐ " + averageRating.toFixed(1) +
                " / 5 (" + productReviews.length + " reviews)";

        } else {

            ratingInfo.textContent = "⭐ No reviews yet";
        }

        reviewSection.appendChild(ratingInfo);

        // Rating Selection
        const ratingSelect = document.createElement("select");

        ratingSelect.innerHTML = `
            <option value="5">5 Stars ⭐⭐⭐⭐⭐</option>
            <option value="4">4 Stars ⭐⭐⭐⭐</option>
            <option value="3">3 Stars ⭐⭐⭐</option>
            <option value="2">2 Stars ⭐⭐</option>
            <option value="1">1 Star ⭐</option>
        `;

        reviewSection.appendChild(ratingSelect);

        // Review Text
        const reviewInput = document.createElement("textarea");

        reviewInput.placeholder = "Write your review...";

        reviewInput.style.cssText =
            "width:100%;margin-top:10px;padding:8px;";

        reviewSection.appendChild(reviewInput);

        // Submit Review Button
        const submitReview = document.createElement("button");

        submitReview.textContent = "Submit Review";

        submitReview.addEventListener("click", function() {

            const comment = reviewInput.value.trim();

            if (!comment) {
                alert("Please write a review.");
                return;
            }

            let allReviews =
                JSON.parse(localStorage.getItem("reviews")) || {};

            const key = String(product.id);

            if (!allReviews[key]) {
                allReviews[key] = [];
            }

            allReviews[key].push({
                rating: Number(ratingSelect.value),
                comment: comment,
                date: new Date().toLocaleDateString()
            });

            localStorage.setItem(
                "reviews",
                JSON.stringify(allReviews)
            );

            alert("Thank you for your review!");

            displayProducts();
        });

        reviewSection.appendChild(submitReview);

        // Display Existing Reviews
        productReviews.forEach(review => {

            const reviewItem = document.createElement("p");

            reviewItem.textContent =
                "⭐".repeat(Number(review.rating)) +
                " - " + review.comment +
                " (" + review.date + ")";

            reviewSection.appendChild(reviewItem);
        });

        card.appendChild(reviewSection);

        productList.appendChild(card);
    });
}

// Search Event
if (searchProduct) {
    searchProduct.addEventListener("input", displayProducts);
}

// Category Filter Event
if (categoryFilter) {
    categoryFilter.addEventListener("change", displayProducts);
}

// Price Sorting Event
if (priceSort) {
    priceSort.addEventListener("change", displayProducts);
}

// Load Products
displayProducts();
