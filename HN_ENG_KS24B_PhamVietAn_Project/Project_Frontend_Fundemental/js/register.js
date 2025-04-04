function register() {
    let name = document.getElementById("nameInput").value.trim();
    let email = document.getElementById("emailInput").value.trim();
    let password = document.getElementById("passInput").value.trim();
    let repassword = document.getElementById("repassInput").value.trim();

    let nameError = document.getElementById("username_error");
    let emailError = document.getElementById("email_error");
    let passwordError = document.getElementById("password_error");
    let repasswordError = document.getElementById("repassword_error");

    let isValid = true;

    nameError.textContent = "";
    emailError.textContent = "";
    passwordError.textContent = "";
    repasswordError.textContent = "";

    if (name === "") {
        nameError.textContent = "Họ và tên không được để trống";
        isValid = false;
    }

    let emailPattern = /^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[A-Za-z]{2,}$/;
    if (email === "") {
        emailError.textContent = "Email không được để trống";
        isValid = false;
    } else if (!emailPattern.test(email)) {
        emailError.textContent = "Email không đúng định dạng";
        isValid = false;
    }

    let users = JSON.parse(localStorage.getItem("users")) || [];

    let emailExists = users.some(user => user.email === email);
    if (emailExists) {
        emailError.textContent = "Email đã được sử dụng, vui lòng chọn email khác";
        isValid = false;
    }

    if (password === "") {
        passwordError.textContent = "Mật khẩu không được để trống";
        isValid = false;
    } else if (password.length < 8) {
        passwordError.textContent = "Mật khẩu phải có ít nhất 8 ký tự";
        isValid = false;
    }

    if (repassword === "") {
        repasswordError.textContent = "Xác nhận mật khẩu không được để trống";
        isValid = false;
    } else if (repassword !== password) {
        repasswordError.textContent = "Mật khẩu xác nhận không khớp";
        isValid = false;
    }

    if (isValid) {
        let users = JSON.parse(localStorage.getItem("users")) || [];

        let newId = users.length > 0 ? users[users.length - 1].id + 1 : 1;

        let newUser = {
            id: newId,
            fullName: name,
            email: email,
            password: password,
            role: "user"
        };

        users.push(newUser);
        localStorage.setItem("users", JSON.stringify(users));

        alert("Đăng ký thành công!");
        window.location.href = "../pages/dashboard.html";
    }
}
