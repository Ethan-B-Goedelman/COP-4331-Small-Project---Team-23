document.addEventListener("DOMContentLoaded", () => {

    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");

    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;

            const data = await apiRequest("/login.php", "POST", { email, password });

            if (data.success) {
                localStorage.setItem("userId", data.userId);
                window.location.href = "dashboard.html";
            } else {
                document.getElementById("loginError").textContent = data.message;
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const name = document.getElementById("regName").value;
            const email = document.getElementById("regEmail").value;
            const password = document.getElementById("regPassword").value;

            const data = await apiRequest("/register.php", "POST", { name, email, password });

            if (data.success) {
                window.location.href = "login.html";
            } else {
                document.getElementById("registerError").textContent = data.message;
            }
        });
    }

});
