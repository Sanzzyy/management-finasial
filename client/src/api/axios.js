import axios from "axios";

// Buat instance axios
const baseURL = import.meta.env.MODE === "development" ? "/api" : "https://management-finasial-api.vercel.app/api";

const api = axios.create({
  baseURL: baseURL,
  withCredentials: true,
});

// Interceptor: Setiap kali mau request, selipkan token
api.interceptors.request.use(
  (config) => {
    // Ambil token dari localStorage (disimpan saat login)
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const { token } = JSON.parse(storedUser);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default api;
