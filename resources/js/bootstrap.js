import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// Add CSRF token to axios headers
const token = document.head.querySelector('meta[name="csrf-token"]');
if (token) {
    window.axios.defaults.headers.common['X-CSRF-TOKEN'] = token.content;
} else {
    console.error('CSRF token not found: https://laravel.com/docs/csrf#csrf-x-csrf-token');
}

// Add response interceptor to handle 419 CSRF errors
axios.interceptors.response.use(
    response => response,
    error => {
        if (error.response && error.response.status === 419) {
            // CSRF token mismatch, refresh the page to get new token
            window.location.reload();
        }
        return Promise.reject(error);
    }
);
