export interface TokenStore {
  getToken(): string | null | Promise<string | null>;
  setToken(token: string): void | Promise<void>;
  clearToken(): void | Promise<void>;
}

export interface ApiClientOptions {
  baseUrl: string;
  tokenStore: TokenStore;
  onUnauthorized?: () => void;
}

export type ApiClient = ReturnType<typeof createApiClient>;

export function createApiClient({ baseUrl, tokenStore, onUnauthorized }: ApiClientOptions) {
  async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...((options.headers as Record<string, string>) || {}),
    };

    const token = await tokenStore.getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      await tokenStore.clearToken();
      onUnauthorized?.();
      throw new Error("Unauthorized");
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || `Request failed: ${response.status}`);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return response.json();
  }

  function get<T>(endpoint: string) {
    return request<T>(endpoint);
  }

  function post<T>(endpoint: string, body?: unknown) {
    return request<T>(endpoint, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  function patch<T>(endpoint: string, body?: unknown) {
    return request<T>(endpoint, {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  function del<T>(endpoint: string) {
    return request<T>(endpoint, { method: "DELETE" });
  }

  async function upload<T>(endpoint: string, formData: FormData): Promise<T> {
    const headers: Record<string, string> = {};
    const token = await tokenStore.getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: "POST",
      headers,
      body: formData,
    });

    if (response.status === 401) {
      await tokenStore.clearToken();
      onUnauthorized?.();
      throw new Error("Unauthorized");
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || `Upload failed: ${response.status}`);
    }

    return response.json();
  }

  return {
    request,
    get,
    post,
    patch,
    del,
    upload,
    setToken: (token: string) => tokenStore.setToken(token),
    clearToken: () => tokenStore.clearToken(),
    getToken: () => tokenStore.getToken(),
  };
}
