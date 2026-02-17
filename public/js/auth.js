// public/js/auth.js
import { apiPost } from "./api.js";

function $(id) { return document.getElementById(id); }

export async function doLogin() {
  $("loginMsg").textContent = "";

  const email = $("loginEmail").value.trim();
  const password = $("loginPassword").value;

  try {
    const data = await apiPost("/api/login.php", { email, password });

    if (data.error && data.error !== "") throw new Error(data.error);

    // store basic info locally (optional)
    localStorage.setItem("userId", data.id);
    localStorage.setItem("firstName", data.firstName);
    localStorage.setItem("lastName", data.lastName);

    window.location.href = "/dashboard.html";
  } catch (err) {
    $("loginMsg").textContent = err.message;
  }
}

export async function doRegister() {
  $("regMsg").textContent = "";

  const fullName = $("regFullName").value.trim();
  const email = $("regEmail").value.trim();
  const password = $("regPassword").value;
  const confirmPassword = $("regConfirm").value;

  try {
    const data = await apiPost("/api/register.php", {
      fullName, email, password, confirmPassword
    });

    if (data.error && data.error !== "") throw new Error(data.error);

    // after register, take them to login
    window.location.href = "/login.html";
  } catch (err) {
    $("regMsg").textContent = err.message;
  }
}
