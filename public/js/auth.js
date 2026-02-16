
import { apiRequest } from "./api.js";
document.addEventListener("DOMContentLoaded", () => {

    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");

    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;
            const errEl = document.getElementById("loginError");
            errEl.textContent = "";

            if (!email.trim() || !password) {
                errEl.textContent = "Please enter your email and password.";
                return;
            }
            const data = await apiRequest("/login.php", "POST", { email, password });

            if (!data.error) {
                localStorage.setItem("userId", data.id);
                window.location.href = "dashboard.html";
            } else {
                errEl.textContent = data.error;
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener("submit", async (e) => {
          e.preventDefault();
      
          const fullName = document.getElementById("regName").value.trim();
          const email = document.getElementById("regEmail").value.trim();
          const password = document.getElementById("regPassword").value;
          const confirmPassword = document.getElementById("regConfirmPassword").value;
      
          const errEl = document.getElementById("registerError");
          errEl.textContent = "";
      
          // Client-side validation
          if (!fullName) {
            errEl.textContent = "Please enter your full name.";
            return;
          }
      
          // simple email format check
          const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
          if (!emailOk) {
            errEl.textContent = "Please enter a valid email address.";
            return;
          }
      
          if (password.length < 8) {
            errEl.textContent = "Password must be at least 8 characters.";
            return;
          }
      
          if (password !== confirmPassword) {
            errEl.textContent = "Passwords do not match.";
            return;
          }
      
          
          const data = await apiRequest("/register.php", "POST", {
            fullName,
            email,
            password,
            confirmPassword
          });
      
          if (!data.error) {
            window.location.href = "login.html";
          } else {
            errEl.textContent = data.error;
          }
        });
      }

});
