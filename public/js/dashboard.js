//connects visual corkboard to the database, handles user interactions, and updates screen without reloading page
import { apiRequest } from "./api.js";

// safety trigegr that tells code wait until html is finished loading before touching anything
document.addEventListener("DOMContentLoaded", () => {
    // Makes sure bootstrap is actually loaded or edit/add cant do anything
    const modalEl = document.getElementById("contactModal");
    if (!modalEl) {
        console.error("contactModal element not found. Edit/Add will not work.");
        return;
    }
    if (typeof bootstrap === "undefined" || !bootstrap.Modal) {
        console.error("Bootstrap Modal JS not loaded. Edit/Add will not work.");
        return;
    }
    const contactModal = new bootstrap.Modal(modalEl);
    // Update HTML elements
    const contactsList = document.getElementById("contactsList");
    const searchInput = document.getElementById("searchInput");
    const modalForm = document.getElementById("modalForm");
    const modalTitle = document.getElementById("modalTitle");
    const openAddBtn = document.getElementById("openAddModalBtn");
    //Grab inputs
    const mFirstName = document.getElementById("mFirstName");
    const mLastName = document.getElementById("mLastName");  
    const mEmail = document.getElementById("mEmail");
    const mPhone = document.getElementById("mPhone");
    const mId = document.getElementById("mId"); // Hidden ID for edits
    const modalError = document.getElementById("modalError"); 
    // When page is ready it runs search with empty search(reveals all contacts when logged in)
    searchContacts();
    // Add starts fresh
    function clearModalFields() {
        mFirstName.value = "";
        mLastName.value = "";
        mEmail.value = "";
        mPhone.value = "";
        mId.value = "";
        if (modalError) modalError.textContent = "";
    }
    // searches instantly as user types
    searchInput.addEventListener("input", searchContacts); 

    // opens popup and sets the title
    openAddBtn.addEventListener("click", () => {
        // Set the title so our 'submit' listener knows to run addContact()
        modalTitle.textContent = "Add Contact";
        clearModalFields();
    });

    modalForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        //If mId.value has a number like 45 we are editing
        // If mId.value is empty we are adding
        const mode = mId.value ? "edit" : "add"; 
        
        //calls either add or edit
        if (mode === "add") {
            await addContact();
        } else {
            await updateContact();
        }
    }); 

    // logout
    const logoutBtn = document.getElementById("logoutBtn");

    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.clear(); 
            window.location.href = "login.html";
        });
    }

    // Connects frontend to backend
    async function searchContacts() {
        const userId = localStorage.getItem("userId");
        const term = searchInput.value;

        const data = await apiRequest("/SearchContact.php", "POST", {
            userId: userId,
            search: term
        });

        if ((data.error && data.error !== "") || !data.results || data.results.length === 0) {
            contactsList.innerHTML = `
                <div class="col-12 text-center mt-5">
                    <div class="empty-board-note mx-auto p-5 shadow">
                        <div class="pin-tack"></div>
                        <h2 class="mb-3">The Board is Empty!</h2>
                        <p class="fs-5">It looks like you haven't pinned any contacts yet.</p>
                        <p>Click the <strong>Pink Note</strong> on the right to get started!</p>
                    </div>
                </div>
            `;
            return;
        }
        displayContacts(data.results || []);
    }
    // Helper function to format phone numbers
    function formatPhoneNumber(phone) {
        const cleaned = ('' + phone).replace(/\D/g, '');
        const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
        if (match) {
            return '(' + match[1] + ') ' + match[2] + '-' + match[3];
        }
        return phone; // Return original if it's not a standard 10-digit number
    }

    // Builds each card
    function displayContacts(results) {
        contactsList.innerHTML = ""; 

        results.forEach(c => {
            const first = (c.FirstName || "").trim();
            const last = (c.LastName || "").trim();
            const email = c.Email || "";
            const phone = c.Phone || "";

            // Format the phone number before displaying
            const displayPhone = formatPhoneNumber(phone);

            // create the Sticky Note
            const col = document.createElement("div");
            col.className = "col-12 col-md-6 col-lg-4 col-xl-3";
            col.innerHTML = `
                <div class="sticky-note-card h-100 position-relative p-4 shadow d-flex flex-column align-items-center">
                    <div class="pin-tack"></div>
                    
                    <h3 class="note-name w-100 text-center text-break mt-2">${first} ${last}</h3>
                    
                    <div class="note-divider w-100 my-2"></div>

                    <div class="note-body flex-grow-1 d-flex flex-column justify-content-center align-items-center w-100 mb-3">
                         <p class="mb-2 text-muted text-break" style="font-size: 1.1rem;">${email}</p>
                         <p class="fw-bold" style="font-size: 1.3rem; letter-spacing: 1px;">${displayPhone}</p>
                    </div>
                    
                    <div class="d-flex gap-2 w-100">
                        <button class="btn btn-sm btn-outline-dark flex-grow-1 edit-btn fw-bold">Edit</button>
                        <button class="btn btn-sm btn-outline-danger flex-grow-1 del-btn fw-bold">Delete</button>
                    </div>
                </div>
            `;

            // Button Logic: edit
            col.querySelector(".edit-btn").addEventListener("click", () => {
                if (!contactModal) {
                    console.error("Bootstrap modal not initialized; cannot open edit modal.");
                    return;
                }
                if (!mFirstName || !mLastName || !mEmail || !mPhone || !mId || !modalTitle) {
                    console.error("Modal input elements missing; cannot open edit modal.");
                    return;
                }
                mFirstName.value = c.FirstName || ""; 
                mLastName.value = c.LastName || "";
                
                mEmail.value = c.Email || "";
                mPhone.value = c.Phone || ""; 
                
                // set the hidden ID field so the Update API knows which record to change
                mId.value = String(c.ID ?? c.Id ?? c.id ?? "");
                
                modalTitle.textContent = "Edit Contact";
                if (modalError) modalError.textContent = ""; 
                
                contactModal.show();
            });

            col.querySelector(".del-btn").addEventListener("click", () => {
                deleteContact(c.ID);
            });

            contactsList.appendChild(col);
        });
    }
    // When in add mode
    async function addContact() {
        // Read separate inputs from the UI
        const firstName = mFirstName.value.trim();
        const lastName = mLastName.value.trim();
        // Sends POST request
        const data = await apiRequest("/addContact.php", "POST", {
            firstName: firstName,
            lastName: lastName, 
            phone: mPhone.value.replace(/\D/g, ""), 
            email: mEmail.value.trim(),
            userId: Number(localStorage.getItem("userId"))
        });
        // if sucess
        if (data.error === "" || data.error === "Contact added successfully") {
            clearModalFields();
            contactModal.hide();
            searchContacts();
        } else {
            if (modalError) {
                modalError.textContent = data.error;
            } else {
                console.error("Add contact failed:", data.error);
            }
        }
    }
    // Similar to addContact but it sends the contactId to the database
    async function updateContact() {
        const firstName = mFirstName.value.trim();
        const lastName = mLastName.value.trim();

    // Sends POST request to EditContact.php
        const data = await apiRequest("/EditContact.php", "POST", {
            userId: Number(localStorage.getItem("userId")),
            contactId: Number(mId.value), 
            firstName: firstName,
            lastName: lastName,
            phone: mPhone.value.replace(/\D/g, ""),
            email: mEmail.value.trim()
        });

        if (data.error === "" || data.error === "Contact updated successfully") {
            clearModalFields();
            contactModal.hide();
            searchContacts();
        } else {
            if (modalError) {
                modalError.textContent = data.error;
            } else {
                console.error("Update contact failed:", data.error);
            }
        }
    }
    // Asks for confirmation
        async function deleteContact(id) {
        if(!confirm("Are you sure you want to delete this contact?")) return;
    
        const data = await apiRequest("/DeleteContact.php", "POST", {
            userId: Number(localStorage.getItem("userId")),
            contactId: Number(id)
        });

        if (data.error === "" || data.error === "Contact deleted successfully") {
            searchContacts();
        } else {
            console.error("Could not delete:", data.error);
        }
    }
});