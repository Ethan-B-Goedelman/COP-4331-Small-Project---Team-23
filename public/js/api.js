const API_BASE = "http://167.172.209.93/api";

export async function apiRequest(endpoint, method, body = null) {
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
