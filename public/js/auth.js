
import { apiRequest } from "./api.js";
document.addEventListener("DOMContentLoaded", () => {

    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");
    // if on login form this runs
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            // Gets the email and password from input boxes
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;
            const errEl = document.getElementById("loginError");
            errEl.textContent = "";
            // if email is empty or password retunrs message
            if (!email.trim() || !password) {
                errEl.textContent = "Please enter your email and password.";
                return;
            }
            //sends email and password to backend
            const data = await apiRequest("/login.php", "POST", { email, password });
            // if success store userId and go to dashboard
            if (!data.error) {
                localStorage.setItem("userId", data.id);
                window.location.href = "dashboard.html";
            } else {
                errEl.textContent = data.error;
            }
        });
    }
    // reuns in register
    if (registerForm) {
        registerForm.addEventListener("submit", async (e) => {
          e.preventDefault();
          // read register input. Uses trim to remove spaces
          const firstName = document.getElementById("regFirstName").value.trim();
          const lastName = document.getElementById("regLastName").value.trim();
          const email = document.getElementById("regEmail").value.trim();
          const password = document.getElementById("regPassword").value;
          const confirmPassword = document.getElementById("regConfirmPassword").value;
      
          const errEl = document.getElementById("registerError");
          errEl.textContent = "";
          // Ensure both fields are filled
          if (!firstName || !lastName) {
            errEl.textContent = "Please enter both your first and last name.";
            return;
          }
          // checks if email is valid
          const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
          if (!emailOk) {
            errEl.textContent = "Please enter a valid email address.";
            return;
          }
          // min password length
          if (password.length < 8) {
            errEl.textContent = "Password must be at least 8 characters.";
            return;
          }
          // password match
          if (password !== confirmPassword) {
            errEl.textContent = "Passwords do not match.";
            return;
          }

          //  Merge them into one string for the current API
          const fullName = `${firstName} ${lastName}`;
      
          // Send the payload using the 'fullName' key the PHP currently expects
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
