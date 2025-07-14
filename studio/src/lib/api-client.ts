import axios from "axios";

const baseUrl = process.env.NEXT_PUBLIC_API_URL;

const apiClient = axios.create({
  baseURL: baseUrl,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

export default apiClient;
