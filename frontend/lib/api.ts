import axios from "axios";
import type {
  ApiResponse,
  Property,
  User,
  Admin,
  Feedback,
  About,
  TeamMember,
  City,
  State,
  Contact,
} from "@amaken/shared";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem("refresh_token");
        if (refreshToken) {
          const { data } = await axios.post(`${API_URL}/auth/refresh`, {
            refreshToken,
          });
          if (data.success && data.data) {
            localStorage.setItem("access_token", data.data.accessToken);
            localStorage.setItem("refresh_token", data.data.refreshToken);
            originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
            return api(originalRequest);
          }
        }
      } catch {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

// ===================== AUTH ENDPOINTS =====================

export const authVerifyEmail = (email: string) =>
  api.post<ApiResponse>("/auth/verify-email", { email });

export const authVerifyOtp = (email: string, code: string) =>
  api.post<ApiResponse>("/auth/verify-otp", { email, code });

export const authRegister = (data: {
  uname: string;
  lname: string;
  email: string;
  phone: string;
  password: string;
  utype: string;
  dateofbirth?: string;
  Address?: string;
  city?: string;
  state?: string;
  ugender?: string;
  wphone?: string;
  company?: string;
  Companyaddress?: string;
  website?: string;
  facebook?: string;
  linkedin?: string;
  instagram?: string;
  tiktok?: string;
  twitter?: string;
}) => api.post<ApiResponse<{ accessToken: string; refreshToken: string; user: User }>>("/auth/register", data);

export const authLogin = (email: string, password: string) =>
  api.post<ApiResponse<{ accessToken: string; refreshToken: string; user: User }>>("/auth/login", { email, password });

export const authForgotPassword = (email: string) =>
  api.post<ApiResponse>("/auth/forgot-password", { email });

export const authVerifyForgotOtp = (email: string, code: string) =>
  api.post<ApiResponse<{ resetToken: string }>>("/auth/verify-forgot-otp", { email, code });

export const authResetPassword = (email: string, resetToken: string, password: string) =>
  api.post<ApiResponse>("/auth/reset-password", { email, resetToken, password });

export const authRefreshToken = (refreshToken: string) =>
  api.post<ApiResponse<{ accessToken: string; refreshToken: string }>>("/auth/refresh", { refreshToken });

export const authLogout = () =>
  api.post<ApiResponse>("/auth/logout");

// ===================== USER PROFILE ENDPOINTS =====================

export const getMe = () =>
  api.get<ApiResponse<User>>("/users/me");

export const updateMe = (data: Record<string, unknown>) =>
  api.put<ApiResponse<User>>("/users/me", data);

export const uploadAvatar = (file: File) => {
  const formData = new FormData();
  formData.append("avatar", file);
  return api.post<ApiResponse<{ image: string }>>("/users/me/avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const removeAvatar = () =>
  api.delete<ApiResponse>("/users/me/avatar");

export const uploadLogo = (file: File) => {
  const formData = new FormData();
  formData.append("logo", file);
  return api.post<ApiResponse<{ image: string }>>("/users/me/logo", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const removeLogo = () =>
  api.delete<ApiResponse>("/users/me/logo");

export const changePassword = (currentPassword: string, newPassword: string) =>
  api.put<ApiResponse>("/users/me/password", { currentPassword, newPassword });

export const updateSocialLinks = (links: Record<string, string>) =>
  api.put<ApiResponse>("/users/me/links", links);

export const deactivateAccount = () =>
  api.post<ApiResponse>("/users/me/deactivate");

export const activateAccount = () =>
  api.post<ApiResponse>("/users/me/activate");

export const deleteAccount = () =>
  api.delete<ApiResponse>("/users/me");

export const blockUser = (id: number) =>
  api.post<ApiResponse>(`/users/block/${id}`);

export const unblockUser = (id: number) =>
  api.post<ApiResponse>(`/users/unblock/${id}`);

export const getUserProfile = (id: number) =>
  api.get<ApiResponse<User>>(`/users/${id}`);

// ===================== PROPERTY ENDPOINTS =====================

export const getProperties = (params?: Record<string, string | number>) =>
  api.get<ApiResponse<Property[]>>("/properties", { params });

export const getProperty = (id: number) =>
  api.get<ApiResponse<Property>>(`/properties/${id}`);

export const getPropertiesByState = (slug: string, params?: Record<string, string | number>) =>
  api.get<ApiResponse<Property[]>>(`/properties/state/${slug}`, { params });

export const getMyProperties = (params?: Record<string, string | number>) =>
  api.get<ApiResponse<Property[]>>("/properties/my", { params });

export const createProperty = (formData: FormData) =>
  api.post<ApiResponse<Property>>("/properties", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 60000,
  });

export const updateProperty = (id: number, formData: FormData) =>
  api.put<ApiResponse<Property>>(`/properties/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 60000,
  });

export const deleteProperty = (id: number) =>
  api.delete<ApiResponse>(`/properties/${id}`);

// ===================== FEEDBACK ENDPOINTS =====================

export const getFeedback = (id: number) =>
  api.get<ApiResponse<Feedback>>(`/feedback/${id}`);

export const getMyFeedback = (params?: Record<string, string | number>) =>
  api.get<ApiResponse<Feedback[]>>("/feedback/my", { params });

export const getFeedbackAboutMe = (params?: Record<string, string | number>) =>
  api.get<ApiResponse<Feedback[]>>("/feedback/about-me", { params });

export const createFeedback = (data: {
  receive_email: string;
  fdescription: string;
  rating: number;
}) => api.post<ApiResponse<Feedback>>("/feedback", data);

export const updateFeedback = (id: number, data: { fdescription: string; rating: number }) =>
  api.put<ApiResponse<Feedback>>(`/feedback/${id}`, data);

export const deleteFeedback = (id: number) =>
  api.delete<ApiResponse>(`/feedback/${id}`);

// ===================== CMS ENDPOINTS =====================

export const getAboutContent = () =>
  api.get<ApiResponse<About[]>>("/about");

export const getTeamMembers = () =>
  api.get<ApiResponse<TeamMember[]>>("/team");

export const getStates = () =>
  api.get<ApiResponse<State[]>>("/states");

export const getCities = () =>
  api.get<ApiResponse<City[]>>("/cities");

// ===================== CONTACT =====================

export const submitContact = (data: {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}) => api.post<ApiResponse<Contact>>("/contact", data);

// ===================== LEADS =====================

export const submitLead = (
  propertyId: number,
  data: {
    name: string;
    email: string;
    phone: string;
    nationality: string;
  }
) => api.post<ApiResponse>(`/properties/${propertyId}/lead`, data);

// ===================== ADMIN ENDPOINTS =====================

export const getDashboardStats = () =>
  api.get<ApiResponse>("/admin/dashboard/stats");
