import axios from "axios";

// in production the backend serves the frontend, so default to the same origin
// strip a trailing "/api" or "/" so we never end up calling /api/api/...
const apiUrl = (import.meta.env.VITE_API_URL || window.location.origin).replace(/\/(api\/?)?$/, "");

const api = axios.create({
  baseURL: apiUrl + "/api",
  withCredentials: true,
});

export default api;
