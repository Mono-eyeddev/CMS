import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

// Attach access token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
// Refresh token automatically
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refresh = localStorage.getItem("refresh_token");

      try {
        const res = await axios.post(
          "http://127.0.0.1:8000/api/token/refresh/",
          {
            refresh: refresh,
          }
        );

        const newAccess = res.data.access;

        localStorage.setItem("access_token", newAccess);

        originalRequest.headers.Authorization = `Bearer ${newAccess}`;

        return api(originalRequest);
      } 
      catch {
      localStorage.clear();
      window.location.href = "/login";
     }  
    }

    return Promise.reject(error);
  }
);
api.interceptors.request.use((config) => {
  console.log("API REQUEST:", config.baseURL + config.url);
  return config;
});
export default api;