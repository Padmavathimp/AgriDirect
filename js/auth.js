
// AgriDirect - Supabase Registration and Login

// ===============================
// REGISTRATION
// ===============================

const registerForm = document.getElementById("registerForm");

if (registerForm) {
    registerForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const name = document.getElementById("fullName").value.trim();
        const mobile = document.getElementById("phone").value.trim();
        const role = document.getElementById("accountType").value;
        const email = document.getElementById("regEmail").value.trim();
        const password = document.getElementById("regPassword").value;

        if (!name || !mobile || !role || !email || !password) {
            alert("Please fill all fields.");
            return;
        }

        try {
            const { data, error } = await supabaseClient.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        full_name: name,
                        mobile: mobile,
                        role: role
                    }
                }
            });

            if (error) throw error;

            alert(
                "Registration successful! Please check your email for verification if requested."
            );

            window.location.href = "login.html";

        } catch (error) {
            console.error("Registration error:", error);
            alert("Registration failed: " + error.message);
        }
    });
}


// ===============================
// LOGIN
// ===============================

const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const role = document.getElementById("role").value.toLowerCase();

        try {
            const { data, error } =
                await supabaseClient.auth.signInWithPassword({
                    email: email,
                    password: password
                });

            if (error) throw error;

            const user = data.user;
            const userRole = user.user_metadata.role;
            const userName = user.user_metadata.full_name;
            const mobile = user.user_metadata.mobile;

            if (userRole !== role) {
                await supabaseClient.auth.signOut();
                alert("Please select the correct account type.");
                return;
            }

            const loggedInUser = {
                id: user.id,
                name: userName,
                mobile: mobile,
                role: userRole,
                email: user.email
            };

            localStorage.setItem(
                "loggedInUser",
                JSON.stringify(loggedInUser)
            );

            alert("Login successful! Welcome " + userName);

            if (userRole === "farmer") {
                window.location.href = "farmer.html";
            } else {
                window.location.href = "buyer.html";
            }

        } catch (error) {
            console.error("Login error:", error);
            alert("Login failed: " + error.message);
        }
    });
}
