const users = [
    {
        id: 0,
        fullName: "Admin",
        email: "Admin@123",
        password: "Admin@123",
        role: "Admin"
    },
    {
        id: 1,
        fullName: "An Nguyễn",
        email: "nguyenquangan@gmail.com",
        password: "12345678",
        role: "user"
    },
    {
        id: 2,
        fullName: "An Phạm",
        email: "anphamls6969@gmail.com",
        password: "ls123456",
        role: "user"
    }
];

function login() {
    let email = document.getElementById("emailInput").value.trim();
    let password = document.getElementById("passInput").value.trim();

    let emailError = document.getElementById("email_error");
    let passwordError = document.getElementById("password_error");

    emailError.textContent = "";
    passwordError.textContent = "";

    if (email === "") {
        emailError.textContent = "Email không được để trống";
        return;
    }

    if (password === "") {
        passwordError.textContent = "Mật khẩu không được để trống";
        return;
    }

    let user = JSON.parse(localStorage.getItem('users')).find(u => u.email === email);

    if (user.password !== password) {
        passwordError.textContent = "Tài khoản hoặc mật khẩu không chính xác";
        return;
    }

    alert("Đăng nhập thành công!");

    localStorage.setItem("currentUser", JSON.stringify(user));

    if (user.role === "Admin") {
        window.location.href = "../pages/category-manager.html";
    } else {
        window.location.href = "../pages/dashboard.html";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    saveUser(users);
});

function saveUser(users) {
    localStorage.setItem("users", JSON.stringify(users));
}
