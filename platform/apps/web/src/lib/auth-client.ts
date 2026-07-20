/**
 * Thin wrapper over the Better Auth REST endpoints (mounted at /api/auth/*
 * on the API's root, NOT under /api/v1). Better Auth's bearer plugin returns
 * a `token` on sign-up/sign-in; we store it under the same
 * `cervicallens_token` localStorage key every other page already reads for
 * its Authorization header, so no other fetch call needs to change.
 */
const API_ORIGIN = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1").replace(
  /\/api\/v1\/?$/,
  ""
);
const AUTH_BASE = `${API_ORIGIN}/api/auth`;

interface AuthResponse {
  token: string;
  user: Record<string, unknown>;
}

async function authRequest(path: string, body: unknown): Promise<AuthResponse> {
  const res = await fetch(`${AUTH_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || data.detail || "Request failed");
  }
  return res.json();
}

export function signIn(email: string, password: string) {
  return authRequest("/sign-in/email", { email, password });
}

export function signUp(params: {
  email: string;
  password: string;
  name: string;
  role: string;
  institution?: string;
  licenseNumber?: string;
}) {
  return authRequest("/sign-up/email", params);
}

export function storeToken(token: string) {
  localStorage.setItem("cervicallens_token", token);
}

export function clearToken() {
  localStorage.removeItem("cervicallens_token");
}
