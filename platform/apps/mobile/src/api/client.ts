/**
 * CervicalLens mobile API client.
 *
 * 10.0.2.2 is the Android emulator's alias for the host machine's localhost;
 * on a physical device this must be swapped for the host's LAN IP (or the
 * deployed API URL) — see the EXPO_PUBLIC_API_URL override.
 */
import * as SecureStore from "expo-secure-store";

export const API_BASE =
  process.env.EXPO_PUBLIC_API_URL || "http://10.0.2.2:8000/api/v1";

/** Better Auth is mounted at /api/auth on the API root, not under /api/v1. */
const AUTH_BASE = `${API_BASE.replace(/\/api\/v1\/?$/, "")}/api/auth`;

async function authHeaders(): Promise<Record<string, string>> {
  const token = await SecureStore.getItemAsync("cervicallens_token").catch(() => null);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

interface AuthResponse {
  token: string;
  user: Record<string, unknown>;
}

async function authRequest(path: string, body: unknown): Promise<AuthResponse> {
  const res = await fetch(`${AUTH_BASE}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
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
}) {
  return authRequest("/sign-up/email", params);
}

export async function storeToken(token: string) {
  await SecureStore.setItemAsync("cervicallens_token", token);
}

export async function getStoredToken(): Promise<string | null> {
  return SecureStore.getItemAsync("cervicallens_token").catch(() => null);
}

export async function clearToken() {
  await SecureStore.deleteItemAsync("cervicallens_token").catch(() => {});
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { headers: await authHeaders() });
  if (!res.ok) throw new Error(`GET ${path} failed (${res.status})`);
  return res.json();
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json", ...(await authHeaders()) },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`POST ${path} failed (${res.status})`);
  return res.json();
}

export interface CytologyResult {
  label: string;
  abnormal_probability: number;
  probabilities: Record<string, number>;
  model: string;
}

/** Screen a captured slide image (base64) against the imaging model. */
export async function screenCytology(imageBase64: string): Promise<CytologyResult> {
  return apiPost<CytologyResult>("/cytology/screen", { imageBase64 });
}

export interface Patient {
  id: number;
  patient_code: string;
  age?: number;
  region?: string;
  clinic_name?: string;
}

export async function registerPatient(patient: {
  patient_code: string;
  age?: number;
  region?: string;
  clinic_name?: string;
  notes?: string;
}): Promise<Patient> {
  return apiPost<Patient>("/patients/", patient);
}
