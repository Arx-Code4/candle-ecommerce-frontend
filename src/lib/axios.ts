import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { env } from '@/config/env';
import { useAuthStore } from '@/store/auth.store';
import type { ApiResponse } from '@/types';

declare module 'axios' {
  interface InternalAxiosRequestConfig {
    _retry?: boolean;
  }
}

const api = axios.create({
  baseURL: env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
  withCredentials: true,
});

// Request interceptor — attach the access token to every request
api.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Single-flight refresh: rotation makes the refresh token single-use, so if
// several requests 401 at the same moment, only ONE may actually call
// /auth/refresh-token — a second concurrent call would present an
// already-rotated (now revoked) cookie and fail. Every other concurrent 401
// instead awaits this same in-flight promise and retries once it resolves.
let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = api
      .post<{ accessToken: string }>('/auth/refresh-token')
      .then(({ data }) => {
        useAuthStore.getState().setAccessToken(data.accessToken);
        return data.accessToken;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

// Response interceptor — unwrap the backend's envelope, and handle 401s
api.interceptors.response.use(
  (response) => {
    const body = response.data as ApiResponse<unknown>;
    if (body && typeof body === 'object' && 'data' in body) {
      response.data = body.data;
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig | undefined;
    const hadAuthHeader = Boolean(originalRequest?.headers?.Authorization);

    if (
      error.response?.status === 401 &&
      originalRequest &&
      hadAuthHeader &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      try {
        await refreshAccessToken();
        return api(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().clearAuth();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

//what's updated?
//withCredentials: true — this is the one-line fix for the biggest gap:
// without it, the browser never sends or stores the httpOnly refresh cookie on cross-domain requests, no matter what the backend does.
//Reading the token via useAuthStore.getState() instead of manually parsing localStorage

// Why hadAuthHeader is the deciding signal, not a URL check —
// the old interceptor treated every 401, anywhere, as "session expired, wipe and redirect."
// That's actually a latent bug: a 401 from POST /auth/login (wrong password) is a normal, expected response — not a token expiring —
// but the old code would still clear storage and hard-redirect to /login, which is nonsensical since the user is already sitting on the login page.
