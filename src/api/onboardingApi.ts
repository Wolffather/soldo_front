import axios from 'axios';

const base = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/public/onboarding`
  : '/public/onboarding'; // no auth token needed — use plain axios

export type BusinessType = 'CAMP' | 'STUDIO' | 'SCHOOL' | 'CLINIC' | 'TOUR' | 'OTHER';

export interface RegisterRequest {
  orgName: string;
  slug: string;
  adminName: string;
  email: string;
  password: string;
  businessType: BusinessType;
}

export interface RegisterResponse {
  token: string;
  tenantId: number;
  tenantSlug: string;
  tenantName: string;
}

export const onboardingApi = {
  register: (data: RegisterRequest): Promise<RegisterResponse> =>
    axios.post(`${base}/register`, data).then((r) => r.data),

  checkSlug: (slug: string): Promise<{ available: boolean; suggested: string }> =>
    axios.get(`${base}/check-slug`, { params: { slug } }).then((r) => r.data),

  generateSlug: (name: string): Promise<{ slug: string }> =>
    axios.get(`${base}/generate-slug`, { params: { name } }).then((r) => r.data),
};
