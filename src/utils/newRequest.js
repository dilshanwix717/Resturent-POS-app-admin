import axios from "axios";

const newRequest = axios.create({
    //baseURL: "https://sepasmocktailbackend.onrender.com/api/",
    baseURL: "https://localhost:8081/api/",
    withCredentials: true,
});

// Add interceptor
newRequest.interceptors.response.use(
    (response) => response, // Pass through successful responses
    (error) => {
        if (error.response?.status === 401) {
            if (error.response?.status === 401) {
                const confirmed = window.confirm("Your session has expired. Please log in again.");

                if (confirmed) {
                    localStorage.removeItem('currentUser');
                    window.location.href = "/auth/signin";
                }
            }

        }
        return Promise.reject(error);
    }
);

export default newRequest;
