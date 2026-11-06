
// AgriDirect - Shopping Cart and Place Order

let cart = JSON.parse(localStorage.getItem("cart")) || [];

// Get Cart
function getCart() {
    return JSON.parse(localStorage.getItem("cart")) || [];
}

// Save Cart
function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
}

// Display Cart
function displayCart() {

    const cartItems = document.getElementById("cartItems");
    const totalPrice = document.getElementById("totalPrice");

    if (!cartItems || !totalPrice) return;

    cart = getCart();
    cartItems.innerHTML = "";

    let total = 0;
    const products = JSON.parse(localStorage.getItem("products")) || [];

    if (cart.length === 0) {
        cartItems.innerHTML = `
            <h3 style="text-align:center;padding:30px;">
                🛒 Your cart is empty!
            </h3>
            <p style="text-align:center;">
                <a href="marketplace.html">Continue Shopping</a>
            </p>
        `;
        totalPrice.textContent = "0.00";
        return;
    }

    cart.forEach((item, index) => {

        const product = products.find(
            p => String(p.id) === String(item.id)
        );

        const div = document.createElement("div");
        div.className = "cart-item";

        const originalPrice = Number(item.originalPrice || item.price);
        const quantity = Number(item.quantity);
        const finalPrice = quantity > 10
            ? originalPrice * 0.90
            : originalPrice;

        const itemTotal = finalPrice * quantity;
        total += itemTotal;

        div.innerHTML = `
            <h3>${item.cropName}</h3>
            <p>Price: ₹${originalPrice.toFixed(2)} / Kg</p>
            <p>Quantity: ${quantity} Kg</p>
            <p>Subtotal: ₹${itemTotal.toFixed(2)}</p>

            <button type="button" onclick="changeQuantity(${index}, -1)">−</button>
            <button type="button" onclick="changeQuantity(${index}, 1)">+</button>
            <button type="button" onclick="removeItem(${index})">Remove</button>

            <p>${product ? "Available stock: " + product.quantity + " Kg" : "Product unavailable"}</p>
            <hr>
        `;

        cartItems.appendChild(div);
    });

    totalPrice.textContent = total.toFixed(2);
    saveCart();
}

// Change Quantity
function changeQuantity(index, change) {

    cart = getCart();
    const item = cart[index];

    if (!item) return;

    const newQuantity = Number(item.quantity) + change;

    const products = JSON.parse(localStorage.getItem("products")) || [];
    const product = products.find(
        p => String(p.id) === String(item.id)
    );

    if (newQuantity < 1) {
        alert("Minimum quantity is 1 Kg.");
        return;
    }

    if (!product || newQuantity > Number(product.quantity)) {
        alert("Available stock is insufficient.");
        return;
    }

    item.quantity = newQuantity;
    saveCart();
    displayCart();
}

// Remove Item
function removeItem(index) {

    cart = getCart();

    if (!cart[index]) return;

    if (confirm("Remove this product from cart?")) {
        cart.splice(index, 1);
        saveCart();
        displayCart();
    }
}

// Place Order
function placeOrder(event) {

    if (event) event.preventDefault();

    cart = getCart();

    if (cart.length === 0) {
        alert("Your cart is empty. Add products first.");
        return;
    }

    const name = document.getElementById("deliveryName").value.trim();
    const phone = document.getElementById("deliveryPhone").value.trim();
    const address = document.getElementById("deliveryAddress").value.trim();
    const pincode = document.getElementById("deliveryPincode").value.trim();

    if (!name || !phone || !address || !pincode) {
        alert("Please fill in all delivery details.");
        return;
    }

    if (!/^[6-9]\d{9}$/.test(phone)) {
        alert("Enter a valid 10-digit mobile number.");
        return;
    }

    if (!/^\d{6}$/.test(pincode)) {
        alert("Enter a valid 6-digit PIN code.");
        return;
    }

    const selectedPayment = document.querySelector(
        'input[name="paymentMethod"]:checked'
    );

    if (!selectedPayment) {
        alert("Please select a payment method.");
        return;
    }

    let products = JSON.parse(localStorage.getItem("products")) || [];

    // Check stock before placing order
    for (const item of cart) {

        const product = products.find(
            p => String(p.id) === String(item.id)
        );

        if (!product || Number(product.quantity) < Number(item.quantity)) {
            alert("Insufficient stock for " + item.cropName);
            return;
        }
    }

    // Calculate order total
    let total = 0;

    const orderItems = cart.map(item => {

        const originalPrice = Number(item.originalPrice || item.price);
        const quantity = Number(item.quantity);

        const finalPrice = quantity > 10
            ? originalPrice * 0.90
            : originalPrice;

        total += finalPrice * quantity;

        return {
            ...item,
            originalPrice: originalPrice,
            price: finalPrice,
            quantity: quantity
        };
    });

    // Reduce product stock
    for (const item of cart) {

        const product = products.find(
            p => String(p.id) === String(item.id)
        );

        product.quantity =
            Number(product.quantity) - Number(item.quantity);
    }

    // Save updated stock
    localStorage.setItem("products", JSON.stringify(products));

    // Save order
    let orders = JSON.parse(localStorage.getItem("orders")) || [];

    const newOrder = {
        id: Date.now(),
        items: orderItems,
        total: total,
        date: new Date().toLocaleString(),
        status: "Pending",
        paymentMethod: selectedPayment.value,
        paymentStatus: "Pending",
        delivery: {
            name: name,
            phone: phone,
            address: address,
            pincode: pincode
        }
    };

    orders.push(newOrder);
    localStorage.setItem("orders", JSON.stringify(orders));

    // Clear cart
    localStorage.removeItem("cart");
    cart = [];

    alert(
        "Order placed successfully!\n" +
        "Order ID: " + newOrder.id +
        "\nTotal: ₹" + total.toFixed(2)
    );

    document.getElementById("checkoutForm").reset();
    displayCart();
}

// Connect checkout form
const checkoutForm = document.getElementById("checkoutForm");

if (checkoutForm) {
    checkoutForm.addEventListener("submit", placeOrder);
}

// Load Cart
displayCart();
