
// AgriDirect - Admin Dashboard

function displayAdminDashboard() {

    const users = JSON.parse(localStorage.getItem("users")) || [];
    const products = JSON.parse(localStorage.getItem("products")) || [];
    const orders = JSON.parse(localStorage.getItem("orders")) || [];

    // Dashboard statistics
    document.getElementById("totalUsers").textContent = users.length;
    document.getElementById("totalProducts").textContent = products.length;
    document.getElementById("totalOrders").textContent = orders.length;

    // Product Management
    const productList = document.getElementById("adminProducts");
    productList.innerHTML = "";

    if (products.length === 0) {
        productList.textContent = "No products available.";
    }

    products.forEach(product => {

        const div = document.createElement("div");

        const heading = document.createElement("h3");
        heading.textContent = product.cropName;

        const price = document.createElement("p");
        price.textContent = "Price: ₹" + product.price + " per kg";

        const quantity = document.createElement("p");
        quantity.textContent = "Quantity: " + product.quantity + " kg";

        const farmer = document.createElement("p");
        farmer.textContent = "Farmer: " + (product.farmer || "N/A");

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete Product";

        deleteButton.onclick = function() {
            if (confirm("Are you sure you want to delete this product?")) {
                let updatedProducts = JSON.parse(localStorage.getItem("products")) || [];
                updatedProducts = updatedProducts.filter(p => p.id !== product.id);
                localStorage.setItem("products", JSON.stringify(updatedProducts));
                displayAdminDashboard();
            }
        };

        div.appendChild(heading);
        div.appendChild(price);
        div.appendChild(quantity);
        div.appendChild(farmer);
        div.appendChild(deleteButton);

        productList.appendChild(div);
    });

    // Order Management
    const orderList = document.getElementById("adminOrders");
    orderList.innerHTML = "";

    if (orders.length === 0) {
        orderList.textContent = "No orders available.";
    }

    orders.forEach(order => {

        const div = document.createElement("div");

        const heading = document.createElement("h3");
        heading.textContent = "Order ID: " + order.id;

        const total = document.createElement("p");
        total.textContent = "Total: ₹" + order.total;

        const status = document.createElement("p");
        status.textContent = "Status: " + order.status;

        const payment = document.createElement("p");
        payment.textContent = "Payment: " + (order.paymentMethod || "N/A");

        const statusSelect = document.createElement("select");

        ["Pending", "Accepted", "Delivered", "Cancelled"].forEach(value => {
            const option = document.createElement("option");
            option.value = value;
            option.textContent = value;
            statusSelect.appendChild(option);
        });

        statusSelect.value = order.status || "Pending";

        const updateButton = document.createElement("button");
        updateButton.textContent = "Update Status";

        updateButton.onclick = function() {
            let updatedOrders = JSON.parse(localStorage.getItem("orders")) || [];
            const selectedOrder = updatedOrders.find(o => o.id === order.id);

            if (selectedOrder) {
                selectedOrder.status = statusSelect.value;
                localStorage.setItem("orders", JSON.stringify(updatedOrders));
                alert("Order status updated!");
                displayAdminDashboard();
            }
        };

        div.appendChild(heading);
        div.appendChild(total);
        div.appendChild(status);
        div.appendChild(payment);
        div.appendChild(statusSelect);
        div.appendChild(updateButton);

        orderList.appendChild(div);
    });
}

displayAdminDashboard();
