import axios from "axios";
import { API_URL } from "./constants";

const AUTH_KEYS = ["signinToken", "token"];

const getCookieValue = (name) => {
    if (typeof document === "undefined") return null;

    const cookie = document.cookie
        .split("; ")
        .find((item) => item.startsWith(`${name}=`));

    return cookie ? decodeURIComponent(cookie.split("=").slice(1).join("=")) : null;
};

const persistToken = (token) => {
    AUTH_KEYS.forEach((key) => localStorage.setItem(key, token));
};

export const syncAuthTokenFromCookie = () => {
    const token = getCookieValue("signinToken") || getCookieValue("token");

    if (token) {
        persistToken(token);
    }

    return token;
};

export const getStoredAuthToken = () => {
    const fromStorage = AUTH_KEYS.map((key) => localStorage.getItem(key)).find(Boolean);

    return fromStorage || syncAuthTokenFromCookie();
};

const axiosInstance = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
    }
});

axiosInstance.interceptors.request.use((config) => {
    const token = getStoredAuthToken();

    if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

export default axiosInstance;

export function setAuthToken(token) {
    if (token) {
        persistToken(token);
    } else {
        AUTH_KEYS.forEach((key) => localStorage.removeItem(key));
    }
}