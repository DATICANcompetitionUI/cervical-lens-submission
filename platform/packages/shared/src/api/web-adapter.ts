import type { TokenStore } from "./client";

export function createWebTokenStore(key = "cervicallens_token"): TokenStore {
  return {
    getToken() {
      if (typeof window === "undefined") return null;
      return localStorage.getItem(key);
    },
    setToken(token: string) {
      if (typeof window === "undefined") return;
      localStorage.setItem(key, token);
    },
    clearToken() {
      if (typeof window === "undefined") return;
      localStorage.removeItem(key);
    },
  };
}
