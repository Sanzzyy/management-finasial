import axios from "axios";

// Buat instance axios
const api = axios.create({
  baseURL: "https://management-finasial-api.vercel.app/api",
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
