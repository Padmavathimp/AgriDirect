
// AgriDirect - Advanced Farmer Order Management

const farmerOrderList = document.getElementById("farmerOrderList");

// Load Orders
function getOrders() {
    return JSON.parse(localStorage.getItem("orders")) || [];
}

// Display Farmer Orders
function displayOrders() {

    const orders = getOrders();

    farmerOrderList.innerHTML = "";

    if (orders.length === 0) {
        farmerOrderList.innerHTML = `
            <div style="text-align:center;padding:40px;">
                <h2>📦 No Customer Orders Yet</h2>
                <p>New customer orders will appear here.</p>
            </div>
        `;
        return;
    }

    orders.forEach((order, index) => {

        const div = document.createElement("div");

        div.style.cssText = `
            background:white;
            padding:22px;
            margin:20px 0;
            border-radius:12px;
            border-left:5px solid #16803c;
            box-shadow:0 3px 12px #00000012;
        `;

        const status = order.status || "Pending";

        div.innerHTML = `
            <h2>📦 Order #${order.id}</h2>

            <p>📅 Date: ${order.date}</p>

            <p>
                Status:
                <strong style="color:#16803c;">
                    ${status}
                </strong>
            </p>

            <hr>

            <h3>💳 Payment Details</h3>

            <p>Payment Method:
                ${order.paymentMethod || "Not available"}
            </p>

            <p>Payment Status:
                ${order.paymentStatus || "Pending"}
            </p>

            <hr>

            <h3>🚚 Customer Delivery Details</h3>

            <p>Name: ${order.delivery?.name || "Not available"}</p>

            <p>Mobile: ${order.delivery?.phone || "Not available"}</p>

            <p>Address: ${order.delivery?.address || "Not available"}</p>

            <p>PIN Code: ${order.delivery?.pincode || "Not available"}</p>

            <hr>

            <h3>🥬 Ordered Products</h3>

            <div class="ordered-products"></div>

            <hr>

            <h2 style="color:#16803c;">
                Total: ₹${Number(order.total).toFixed(2)}
            </h2>
        `;

        // Display Products
        const productList = div.querySelector(".ordered-products");

        (order.items || []).forEach(item => {

            const p = document.createElement("p");

            p.textContent =
                "🌱 " + item.cropName +
                " | " + item.quantity + " Kg" +
                " | ₹" + Number(item.price).toFixed(2) + " / Kg";

            productList.appendChild(p);
        });

        // Accept Order Button
        if (status === "Pending") {

            const acceptButton = document.createElement("button");

            acceptButton.textContent = "✅ Accept Order";

            acceptButton.style.cssText =
                "background:#16803c;color:white;padding:12px 18px;border:none;border-radius:7px;cursor:pointer;margin:8px;";

            acceptButton.onclick = function() {
                updateStatus(order.id, "Accepted");
            };

            div.appendChild(acceptButton);
        }

        // Mark as Delivered Button
        if (status === "Accepted") {

            const deliverButton = document.createElement("button");

            deliverButton.textContent = "🚚 Mark as Delivered";

            deliverButton.style.cssText =
                "background:#16803c;color:white;padding:12px 18px;border:none;border-radius:7px;cursor:pointer;margin:8px;";

            deliverButton.onclick = function() {
                updateStatus(order.id, "Delivered");
            };

            div.appendChild(deliverButton);
        }

        // Completed Order
        if (status === "Delivered") {

            const completed = document.createElement("p");

            completed.textContent = "🎉 Order Successfully Delivered!";

            completed.style.cssText =
                "color:#16803c;font-weight:bold;margin-top:15px;";

            div.appendChild(completed);
        }

        farmerOrderList.appendChild(div);
    });
}

// Update Order Status
function updateStatus(orderId, status) {

    let orders = getOrders();

    const order = orders.find(
        item => String(item.id) === String(orderId)
    );

    if (!order) {
        alert("Order not found!");
        return;
    }

    order.status = status;

    localStorage.setItem("orders", JSON.stringify(orders));

    alert("Order status updated to " + status + "!");

    displayOrders();
}

// Load Orders
displayOrders();
