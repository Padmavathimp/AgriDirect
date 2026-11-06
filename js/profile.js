
// AgriDirect - User Profile Management

const profileDetails = document.getElementById("profileDetails");

function displayProfile() {

    const user = JSON.parse(localStorage.getItem("loggedInUser"));

    if (!user) {
        profileDetails.innerHTML = "<h3>Please login to view your profile.</h3>";
        return;
    }

    profileDetails.innerHTML = `
        <h2>👋 Welcome, ${user.name}!</h2>

        <p><strong>Name:</strong> ${user.name}</p>
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>Mobile:</strong> ${user.phone}</p>
        <p><strong>Account Type:</strong> ${user.role}</p>

        <button id="editProfile">Edit Profile</button>
    `;

    document.getElementById("editProfile").onclick = editProfile;
}

function editProfile() {

    const user = JSON.parse(localStorage.getItem("loggedInUser"));

    const name = prompt("Enter your name:", user.name);
    if (name === null || name.trim() === "") return;

    const email = prompt("Enter your email:", user.email);
    if (email === null || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        alert("Enter a valid email.");
        return;
    }

    const phone = prompt("Enter your mobile number:", user.phone);
    if (phone === null || !/^[6-9]\d{9}$/.test(phone)) {
        alert("Enter a valid 10-digit mobile number.");
        return;
    }

    user.name = name.trim();
    user.email = email.trim();
    user.phone = phone.trim();

    // Update logged-in user
    localStorage.setItem("loggedInUser", JSON.stringify(user));

    // Update registered user list
    let users = JSON.parse(localStorage.getItem("users")) || [];

    const index = users.findIndex(u => u.email === user.email ||
        u.phone === user.phone);

    if (index !== -1) {
        users[index].name = user.name;
        users[index].email = user.email;
        users[index].phone = user.phone;
        localStorage.setItem("users", JSON.stringify(users));
    }

    alert("Profile updated successfully!");

    displayProfile();
}

displayProfile();
