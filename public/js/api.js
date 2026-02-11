const API_BASE = "https://yourdomain.com/api";

async function apiRequest(endpoint, method, body = null) {
    const options = {
        method: method,
        headers: {
            "Content-Type": "application/json"
        }
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE}${endpoint}`, options);
    return response.json();
}
