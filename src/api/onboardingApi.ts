import axios from 'axios';

const base = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/public/onboarding`
  : '/public/onboarding'; // no auth token needed — use plain axios

export type BusinessType = 'CAMP' | 'STUDIO' | 'SCHOOL' | 'TOUR' | 'OTHER';

export interface RegisterRequest {
  orgName: string;
  adminName: string;
  email: string;
  password: string;
  businessType: BusinessType;
}

export interface RegisterResponse {
  token: string;
}

export const onboardingApi = {
  register: (data: RegisterRequest): Promise<RegisterResponse> =>
    axios.post(`${base}/register`, data).then((r) => r.data),
};
