// Base API URL configuration
// Locally, this defaults to "" so Vite's proxy forwards requests to http://127.0.0.1:8000
// In production (Vercel), set VITE_API_BASE_URL to your hosted backend URL (e.g. Render / Railway)
export const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
