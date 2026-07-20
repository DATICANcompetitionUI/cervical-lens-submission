export type UserRole = "technician" | "pathologist" | "admin";

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  is_verified: boolean;
  license_number?: string;
  institution?: string;
  specialization?: string;
  clinic_name?: string;
  clinic_region?: string;
  created_at: string;
  updated_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface UserCreate {
  email: string;
  password: string;
  full_name: string;
  role: UserRole;
  license_number?: string;
  institution?: string;
  specialization?: string;
  clinic_name?: string;
  clinic_region?: string;
}

export interface UserUpdate {
  full_name?: string;
  institution?: string;
  specialization?: string;
  clinic_name?: string;
  clinic_region?: string;
}
