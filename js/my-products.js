
// AgriDirect - My Products Management

const myProductList = document.getElementById("myProductList");

function displayMyProducts() {

    let products = JSON.parse(localStorage.getItem("products")) || [];

    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

    myProductList.innerHTML = "";

    if (!loggedInUser) {
        myProductList.textContent = "Please login first.";
        return;
    }

    // Show only products added by the logged-in farmer
    products = products.filter(product =>
        product.farmer === loggedInUser.name
    );

    if (products.length === 0) {
        myProductList.textContent = "No products added yet.";
        return;
    }

    products.forEach(product => {

        const div = document.createElement("div");

        div.innerHTML = `
            <h3>${product.cropName}</h3>

            <img src="${product.image}" width="180" height="120"
                 style="object-fit:cover;">

            <p>Category: ${product.category || "Other"}</p>
            <p>Price: ₹${product.price} per kg</p>
            <p>Quantity: ${product.quantity} kg</p>
            <p>${product.description}</p>
        `;

        // Edit Button
        const editButton = document.createElement("button");
        editButton.textContent = "Edit Product";

        editButton.onclick = function() {

            const newName = prompt("Enter product name:", product.cropName);
            if (newName === null || newName.trim() === "") return;

            const newPrice = prompt("Enter price:", product.price);
            if (newPrice === null || newPrice.trim() === "" ||
                !Number.isFinite(Number(newPrice)) || Number(newPrice) <= 0) {
                alert("Enter a valid price.");
                return;
            }

            const newQuantity = prompt("Enter quantity:", product.quantity);
            if (newQuantity === null || newQuantity.trim() === "" ||
                !Number.isFinite(Number(newQuantity)) || Number(newQuantity) < 0) {
                alert("Enter a valid quantity.");
                return;
            }

            const newDescription = prompt("Enter description:", product.description);
            if (newDescription === null) return;

            let allProducts = JSON.parse(localStorage.getItem("products")) || [];

            const selectedProduct = allProducts.find(p => p.id === product.id);

            if (selectedProduct) {
                selectedProduct.cropName = newName.trim();
                selectedProduct.price = newPrice;
                selectedProduct.quantity = newQuantity;
                selectedProduct.description = newDescription;

                localStorage.setItem("products", JSON.stringify(allProducts));

                alert("Product updated successfully!");
                displayMyProducts();
            }
        };

        // Delete Button
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete Product";

        deleteButton.onclick = function() {

            if (confirm("Do you want to delete this product?")) {

                let allProducts = JSON.parse(localStorage.getItem("products")) || [];

                allProducts = allProducts.filter(p => p.id !== product.id);

                localStorage.setItem("products", JSON.stringify(allProducts));

                alert("Product deleted successfully!");
                displayMyProducts();
            }
        };

        div.appendChild(editButton);
        div.appendChild(deleteButton);

        myProductList.appendChild(div);
    });
}

displayMyProducts();
