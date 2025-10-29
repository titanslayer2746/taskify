import dotenv from "dotenv";

dotenv.config();

export const BACKEND_CONFIG = {
  API_URL: process.env.BACKEND_API_URL || "http://localhost:5000/api",
  BASE_URL: process.env.BACKEND_BASE_URL || "http://localhost:5000",
  TIMEOUT: 30000, // 30 seconds
};

export default BACKEND_CONFIG;
