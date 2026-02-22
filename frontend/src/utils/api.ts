import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3200', // Backend is on port 3200
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;
