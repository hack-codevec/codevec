// apiClient.js
import axios from "axios";

const apiClient = axios.create({
  baseURL: "https://backend.sasewa.org/v1", // Replace with your actual base URL
  timeout: 10000, // Optional timeout
  headers: {
    "Content-Type": "application/json",

  },
});

export default apiClient;
