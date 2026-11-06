
// AgriDirect - Advanced Buyer Order Tracking

const orderList = document.getElementById("orderList");

function displayOrders() {

    const orders = JSON.parse(localStorage.getItem("orders")) || [];

    orderList.innerHTML = "";

    if (orders.length === 0) {
        orderList.innerHTML = `
            <div style="text-align:center;padding:40px;">
                <h2>🛒 No orders placed yet!</h2>
                <p>Start shopping directly from farmers.</p>
                <a href="marketplace.html">Visit Marketplace</a>
            </div>
        `;
        return;
    }

    orders.slice().reverse().forEach(order => {

        const div = document.createElement("div");
        div.className = "order-card";

        const status = order.status || "Pending";

        let tracking = "";

        if (status === "Pending") {
            tracking = `
                <p>🟢 Order Placed</p>
                <p>⚪ Order Accepted</p>
                <p>⚪ Order Delivered</p>
            `;
        } else if (status === "Accepted") {
            tracking = `
                <p>🟢 Order Placed</p>
                <p>🟢 Order Accepted</p>
                <p>⚪ Order Delivered</p>
            `;
        } else if (status === "Delivered") {
            tracking = `
                <p>🟢 Order Placed</p>
                <p>🟢 Order Accepted</p>
                <p>🟢 Order Delivered</p>
            `;
        } else {
            tracking = `
                <p>🟢 Order Placed</p>
                <p>Current update: ${status}</p>
            `;
        }

        div.innerHTML = `
            <h3>📦 Order ID: ${order.id}</h3>

            <p>📅 Date: ${order.date}</p>

            <p>
                Order Status:
                <span class="order-status">${status}</span>
            </p>

            <hr>

            <h3>🚚 Order Tracking</h3>

            ${tracking}

            <hr>

            <h3>🥬 Ordered Products</h3>

            <div class="product-details"></div>

            <hr>

            <h3>💳 Payment Details</h3>

            <p>Payment Method:
                ${order.paymentMethod || "Not available"}
            </p>

            <p>Payment Status:
                ${order.paymentStatus || "Pending"}
            </p>

            <hr>

            <h3>📍 Delivery Details</h3>

            <p>Name: ${order.delivery?.name || "Not available"}</p>

            <p>Mobile: ${order.delivery?.phone || "Not available"}</p>

            <p>Address: ${order.delivery?.address || "Not available"}</p>

            <p>PIN Code: ${order.delivery?.pincode || "Not available"}</p>

            <hr>

            <h2 class="order-total">
                Total Amount: ₹${Number(order.total).toFixed(2)}
            </h2>
        `;

        const productDetails = div.querySelector(".product-details");

        (order.items || []).forEach(item => {

            const product = document.createElement("p");

            product.textContent =
                "🌱 " + item.cropName +
                " | Quantity: " + item.quantity + " Kg" +
                " | Price: ₹" + Number(item.price).toFixed(2) + " / Kg";

            productDetails.appendChild(product);

        });

        orderList.appendChild(div);

    });
}

// Load Orders
displayOrders();
