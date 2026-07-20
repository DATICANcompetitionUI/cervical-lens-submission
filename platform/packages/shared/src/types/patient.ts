export interface Patient {
  id: number;
  patient_code: string;
  age?: number;
  date_of_birth?: string;
  region?: string;
  clinic_name?: string;
  hpv_status?: string;
  parity?: number;
  previous_screening_result?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface PatientCreate {
  patient_code: string;
  age?: number;
  date_of_birth?: string;
  region?: string;
  clinic_name?: string;
  hpv_status?: string;
  parity?: number;
  previous_screening_result?: string;
  notes?: string;
}

export interface PatientUpdate {
  age?: number;
  date_of_birth?: string;
  region?: string;
  clinic_name?: string;
  hpv_status?: string;
  parity?: number;
  previous_screening_result?: string;
  notes?: string;
}
