document.addEventListener("DOMContentLoaded", () => {

    document.getElementById("searchBtn").addEventListener("click", searchContacts);

    async function searchContacts() {
        const searchTerm = document.getElementById("searchInput").value;
        const userId = localStorage.getItem("userId");

        const data = await apiRequest("/search.php", "POST", {
            userId,
            search: searchTerm
        });

        displayContacts(data.contacts);
    }

    function displayContacts(contacts) {
        const list = document.getElementById("contactsList");
        list.innerHTML = "";

        contacts.forEach(contact => {
            const div = document.createElement("div");
            div.classList.add("contact-card");
            div.innerHTML = `
                <strong>${contact.name}</strong><br>
                ${contact.email}<br>
                ${contact.phone}
            `;
            list.appendChild(div);
        });
    }

});
