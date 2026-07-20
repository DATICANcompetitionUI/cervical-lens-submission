import type { TokenStore } from "./client";

export function createNativeTokenStore(
  secureStore: {
    getItemAsync(key: string): Promise<string | null>;
    setItemAsync(key: string, value: string): Promise<void>;
    deleteItemAsync(key: string): Promise<void>;
  },
  key = "cervicallens_token"
): TokenStore {
  return {
    getToken() {
      return secureStore.getItemAsync(key);
    },
    setToken(token: string) {
      return secureStore.setItemAsync(key, token);
    },
    clearToken() {
      return secureStore.deleteItemAsync(key);
    },
  };
}
