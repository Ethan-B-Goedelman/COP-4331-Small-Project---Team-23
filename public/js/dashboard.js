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
    
        const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        const phoneDigits = phone.replace(/\D/g, ""); // keep only numbers
      
        if (!fullName) {
          errEl.textContent = "Please enter a name.";
          return;
        }
        if (!emailOk) {
          errEl.textContent = "Please enter a valid email.";
          return;
        }
        if (phone && phoneDigits.length < 7) {
          errEl.textContent = "Please enter a valid phone number.";
          return;
        }
        // Split full name into first/last for backend
        const parts = fullName.split(/\s+/);
        const firstName = parts[0] || "";
        const lastName = parts.slice(1).join(" ");
        const data = await apiRequest("/addContact.php", "POST", {
          firstName,
          lastName,
          phone: phoneDigits,
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
      async function deleteContact(contactId) {
        const ok = confirm("Delete this contact?");
        if (!ok) return;
        const userId = Number(localStorage.getItem("userId"));
        const data = await apiRequest("/DeleteContact.php", "POST", {
          userId,
          contactId: Number(contactId)
        });
        // backend uses "error" field for success message too
        if (data.error === "Contact deleted successfully") {
          searchContacts(); // refresh results
        } else {
          alert(data.error || "Delete failed.");
        }
      }
      async function editContact(contact) {
        const userId = Number(localStorage.getItem("userId"));
        const contactId = Number(contact.ID);
        const firstName = prompt("First name:", contact.FirstName || "");
        if (firstName === null) return;
      
        const lastName = prompt("Last name:", contact.LastName || "");
        if (lastName === null) return;
      
        const email = prompt("Email:", contact.Email || "");
        if (email === null) return;
      
        const phone = prompt("Phone:", contact.Phone || "");
        if (phone === null) return;

        const firstT = firstName.trim();
        const lastT  = lastName.trim();
        const emailT = email.trim();
        const phoneT = phone.trim();
        if (!firstT || !lastT) {
            alert("First and last name are required.");
            return;
        }
        const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailT);
        if (!emailOk) {
            alert("Please enter a valid email.");
            return;
        }
        const phoneDigits = phoneT.replace(/\D/g, "");
        if (phoneT && phoneDigits.length < 7) {
            alert("Please enter a valid phone number.");
            return;
        }
        const data = await apiRequest("/EditContact.php", "POST", {
            userId,
            contactId,
            firstName: firstT,
            lastName: lastT,
            email: emailT,
            phone: phoneDigits
          });
        if (data.error === "Contact updated successfully") {
          searchContacts();
        } else {
          alert(data.error || "Update failed.");
        }
      }

      function displayContacts(results) {
        const list = document.getElementById("contactsList");
        list.innerHTML = "";
      
        if (!results || results.length === 0) {
          list.innerHTML = `<p class="error-message">No contacts found.</p>`;
          return;
        }
      
        results.forEach((c) => {
          const id    = c.ID;
          const first = (c.FirstName || "").trim();
          const last  = (c.LastName || "").trim();
          const email = (c.Email || "").trim();
          const phone = (c.Phone || "").trim();
      
          const div = document.createElement("div");
          div.classList.add("contact-card");
      
          div.innerHTML = `
            <strong>${first} ${last}</strong><br>
            ${email ? email + "<br>" : ""}
            ${phone ? phone + "<br>" : ""}
            <button class="btn secondary small edit-btn" data-id="${c.ID}">Edit</button>
            <button class="btn secondary small delete-btn">Delete</button>
          `;
      
          div.querySelector(".delete-btn").addEventListener("click", () => deleteContact(id));
      
          list.appendChild(div);
          div.querySelector(".edit-btn").addEventListener("click", () => editContact(c));
        });
      }
      const addBtn = document.getElementById("addBtn");
  if (addBtn) addBtn.addEventListener("click", addContact);
});
