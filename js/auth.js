
// AgriDirect - Registration and Login

// REGISTRATION
const registerForm = document.getElementById("registerForm");

if (registerForm) {
    registerForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const name = document.getElementById("fullName").value;
        const mobile = document.getElementById("phone").value;
        const role = document.getElementById("accountType").value;
        const email = document.getElementById("regEmail").value;
        const password = document.getElementById("regPassword").value;

        let users = JSON.parse(localStorage.getItem("users")) || [];

        const existingUser = users.find(user => user.email === email);

        if (existingUser) {
            alert("Email already registered!");
            return;
        }

        const newUser = {
            name,
            mobile,
            role,
            email,
            password
        };

        users.push(newUser);
        localStorage.setItem("users", JSON.stringify(users));

        alert("Registration successful!");
        window.location.href = "login.html";
    });
}

// LOGIN
const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const role = document.getElementById("role").value.toLowerCase();

        const users = JSON.parse(localStorage.getItem("users")) || [];

        const user = users.find(user =>
            user.email === email &&
            user.password === password &&
            user.role.toLowerCase() === role
        );

        if (user) {
            localStorage.setItem("loggedInUser", JSON.stringify(user));

            alert("Login successful! Welcome " + user.name);

            if (user.role === "farmer") {
                window.location.href = "farmer.html";
            } else {
                window.location.href = "buyer.html";
            }
        } else {
            alert("Invalid email, password or account type!");
        }
    });
}

