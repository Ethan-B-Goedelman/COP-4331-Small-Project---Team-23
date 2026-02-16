import { apiRequest } from "./api.js";
document.addEventListener("DOMContentLoaded", () => {

    document.getElementById("searchBtn").addEventListener("click", searchContacts);

    async function searchContacts() {
        const searchTerm = document.getElementById("searchInput").value;
        const userId = localStorage.getItem("userId");
        const list = document.getElementById("contactsList");
        list.innerHTML = ""; // clear old results
        const data = await apiRequest("/SearchContact.php", "POST", {
          userId,
          search: searchTerm
        });
      
        
        if (data.error && data.error !== "") {
          list.innerHTML = `<p class="error-message">${data.error}</p>`;
          return;
        }
      
        displayContacts(data.results || []);
    }

    async function addContact() {
        const fullName = document.getElementById("addName").value.trim();
        const email = document.getElementById("addEmail").value.trim();
        const phone = document.getElementById("addPhone").value.trim();
        const userId = localStorage.getItem("userId");
        const errEl = document.getElementById("addError");
        errEl.textContent = "";
    
        if (!fullName) {
          errEl.textContent = "Please enter a name.";
          return;
        }
        if (!email) {
          errEl.textContent = "Please enter an email.";
          return;
        }
    
        // Split full name into first/last for backend
        const parts = fullName.split(/\s+/);
        const firstName = parts[0] || "";
        const lastName = parts.slice(1).join(" ");
        const data = await apiRequest("/addContact.php", "POST", {
          firstName,
          lastName,
          phone,
          email,
          userId: Number(userId)
        });
    
        // addContact.php uses {"error":"Contact added successfully"} for success
        if (data.error === "Contact added successfully") {
          errEl.textContent = "Added!";
          setTimeout(() => { errEl.textContent = ""; }, 2000);
          document.getElementById("addName").value = "";
          document.getElementById("addEmail").value = "";
          document.getElementById("addPhone").value = "";
          searchContacts();
        } else {
          errEl.textContent = data.error || "Failed to add contact.";
        }
      }

      function displayContacts(results) {
        const list = document.getElementById("contactsList");
        list.innerHTML = "";
      
        if (!results || results.length === 0) {
          list.innerHTML = `<p class="error-message">No contacts found.</p>`;
          return;
        }
      
        results.forEach((name) => {
          const div = document.createElement("div");
          div.classList.add("contact-card");
          div.innerHTML = `<strong>${String(name).trim()}</strong>`;
          list.appendChild(div);
        });
      } 
    const addBtn = document.getElementById("addBtn");
    if (addBtn) addBtn.addEventListener("click", addContact);
});
