const API_BASE_URL = 'http://localhost:3002/api';

// Auth API calls
export const authAPI = {
    register: async (userData) => {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        return response.json();
    },

    login: async (credentials) => {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
        });
        const data = await response.json();
        if (data.token) {
            localStorage.setItem('authToken', data.token);
        }
        return data;
    }
};

// Appointment API calls
export const appointmentAPI = {
    create: async (appointmentData) => {
        const response = await fetch(`${API_BASE_URL}/appointments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(appointmentData)
        });
        return response.json();
    },

    getAll: async () => {
        const response = await fetch(`${API_BASE_URL}/appointments`);
        return response.json();
    },

    getUserAppointments: async (userId) => {
        const response = await fetch(`${API_BASE_URL}/appointments/user/${userId}`);
        return response.json();
    },

    update: async (id, data) => {
        const response = await fetch(`${API_BASE_URL}/appointments/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return response.json();
    },

    delete: async (id) => {
        const response = await fetch(`${API_BASE_URL}/appointments/${id}`, {
            method: 'DELETE'
        });
        return response.json();
    }
};

// User API calls
export const userAPI = {
    getAll: async () => {
        const response = await fetch(`${API_BASE_URL}/users`);
        return response.json();
    },

    delete: async (id) => {
        const response = await fetch(`${API_BASE_URL}/users/${id}`, {
            method: 'DELETE'
        });
        return response.json();
    }
};

// Emergency API calls
export const emergencyAPI = {
    create: async (emergencyData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/emergencies`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(emergencyData)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Emergency API error:', error);
            throw error;
        }
    },

    getAll: async () => {
        const response = await fetch(`${API_BASE_URL}/emergencies`);
        return response.json();
    },

    getUserEmergencies: async (userId) => {
        const response = await fetch(`${API_BASE_URL}/emergencies/user/${userId}`);
        return response.json();
    },

    update: async (id, data) => {
        const response = await fetch(`${API_BASE_URL}/emergencies/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return response.json();
    },

    delete: async (id) => {
        const response = await fetch(`${API_BASE_URL}/emergencies/${id}`, {
            method: 'DELETE'
        });
        return response.json();
    }
};

// Medicine API calls
export const medicineAPI = {
    getAll: async () => {
        const response = await fetch(`${API_BASE_URL}/medicines`);
        return response.json();
    },

    create: async (medicineData) => {
        const response = await fetch(`${API_BASE_URL}/medicines`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(medicineData)
        });
        return response.json();
    },

    update: async (id, data) => {
        const response = await fetch(`${API_BASE_URL}/medicines/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return response.json();
    },

    delete: async (id) => {
        const response = await fetch(`${API_BASE_URL}/medicines/${id}`, {
            method: 'DELETE'
        });
        return response.json();
    },

    getLowStock: async () => {
        const response = await fetch(`${API_BASE_URL}/medicines/low-stock`);
        return response.json();
    }
};

// Orders API calls
export const ordersAPI = {
    getAll: async () => {
        const response = await fetch(`${API_BASE_URL}/orders`);
        return response.json();
    },

    create: async (orderData) => {
        const response = await fetch(`${API_BASE_URL}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });
        return response.json();
    },

    update: async (id, data) => {
        const response = await fetch(`${API_BASE_URL}/orders/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return response.json();
    },

    delete: async (id) => {
        const response = await fetch(`${API_BASE_URL}/orders/${id}`, {
            method: 'DELETE'
        });
        return response.json();
    }
};