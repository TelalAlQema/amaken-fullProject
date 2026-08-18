import { api } from "@/lib/api";
import type {
  Admin,
  User,
  Property,
  Feedback,
  About,
  TeamMember,
  City,
  State,
  Contact,
  PropertyLead,
  DelAccount,
  RegisterEmail,
  ApiResponse,
} from "@amaken/shared";

// ===================== ADMIN AUTH =====================

export const adminVerifyPin = (pin: string) =>
  api.post<ApiResponse>("/admin/pin", { pin });

export const adminLogin = (email: string, password: string) =>
  api.post<ApiResponse<{ accessToken: string; refreshToken: string; admin: Admin }>>("/admin/login", { email, password });

// ===================== ADMIN PROFILE =====================

export const getAdminProfile = () =>
  api.get<ApiResponse<Admin>>("/admin/profile");

export const updateAdminProfile = (data: Record<string, unknown>) =>
  api.put<ApiResponse<Admin>>("/admin/profile", data);

export const uploadAdminAvatar = (file: File) => {
  const formData = new FormData();
  formData.append("avatar", file);
  return api.post<ApiResponse<{ image: string }>>("/admin/profile/avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 60000,
  });
};

export const removeAdminAvatar = () =>
  api.delete<ApiResponse>("/admin/profile/avatar");

export const uploadAdminLogo = (file: File) => {
  const formData = new FormData();
  formData.append("logo", file);
  return api.post<ApiResponse<{ image: string }>>("/admin/profile/logo", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 60000,
  });
};

export const removeAdminLogo = () =>
  api.delete<ApiResponse>("/admin/profile/logo");

export const updateAdminLinks = (links: Record<string, string>) =>
  api.put<ApiResponse>("/admin/profile/links", links);

export const changeAdminPassword = (currentPassword: string, newPassword: string) =>
  api.put<ApiResponse>("/admin/profile/password", { currentPassword, newPassword });

// ===================== ADMIN USER MANAGEMENT =====================

export const listAdminUsers = (type?: string, page?: number, limit?: number) =>
  api.get<ApiResponse<User[]>>("/admin/users", { params: { type, page, limit } });

export const listAdminAgents = (page?: number, limit?: number) =>
  api.get<ApiResponse<User[]>>("/admin/users/agents", { params: { page, limit } });

export const listAdminBuilders = (page?: number, limit?: number) =>
  api.get<ApiResponse<User[]>>("/admin/users/builders", { params: { page, limit } });

export const listAdminAdmins = () =>
  api.get<ApiResponse<Admin[]>>("/admin/users/admins");

export const adminUserStatus = (id: number, action: string) =>
  api.put<ApiResponse>(`/admin/users/${id}/status`, { action });

export const adminDeleteUser = (id: number) =>
  api.delete<ApiResponse>(`/admin/users/${id}`);

// ===================== ADMIN ACCOUNT LISTS =====================

export const listRegisteredAccounts = (page?: number, limit?: number) =>
  api.get<ApiResponse<RegisterEmail[]>>("/admin/accounts/registered", { params: { page, limit } });

export const listDeletedAccounts = (page?: number, limit?: number) =>
  api.get<ApiResponse<DelAccount[]>>("/admin/accounts/deleted", { params: { page, limit } });

export const listBlockedAccounts = (page?: number, limit?: number) =>
  api.get<ApiResponse<DelAccount[]>>("/admin/accounts/blocked", { params: { page, limit } });

export const deleteAccountRecord = (id: number) =>
  api.delete<ApiResponse>(`/admin/accounts/${id}`);

// ===================== ADMIN PROPERTY MANAGEMENT =====================

export const adminListProperties = (params: {
  page?: number;
  limit?: number;
  status?: string;
  stype?: string;
  type?: string;
  search?: string;
}) => api.get<ApiResponse<Property[]>>("/admin/properties", { params });

export const adminListPendingApproval = (page?: number, limit?: number) =>
  api.get<ApiResponse<Property[]>>("/admin/properties/approval", { params: { page, limit } });

export const approveProperty = (id: number) =>
  api.put<ApiResponse>(`/admin/properties/${id}/approve`);

export const disapproveProperty = (id: number) =>
  api.put<ApiResponse>(`/admin/properties/${id}/disapprove`);

export const hideProperty = (id: number) =>
  api.put<ApiResponse>(`/admin/properties/${id}/hide`);

export const displayProperty = (id: number) =>
  api.put<ApiResponse>(`/admin/properties/${id}/display`);

export const freezeProperty = (id: number) =>
  api.put<ApiResponse>(`/admin/properties/${id}/freeze`);

export const releaseProperty = (id: number) =>
  api.put<ApiResponse>(`/admin/properties/${id}/release`);

export const adminDeleteProperty = (id: number) =>
  api.delete<ApiResponse>(`/admin/properties/${id}`);

// ===================== ADMIN LEADS =====================

export const adminListLeads = (params: {
  page?: number;
  limit?: number;
  from?: string;
  to?: string;
}) => api.get<ApiResponse<PropertyLead[]>>("/admin/leads", { params });

export const exportLeads = (params: {
  mode?: string;
  page?: number;
  limit?: number;
  from?: string;
  to?: string;
}) =>
  api.get("/admin/leads/export", {
    params,
    responseType: "blob",
  });

export const deleteLead = (id: number) =>
  api.delete<ApiResponse>(`/admin/leads/${id}`);

export const bulkDeleteLeads = (ids: number[]) =>
  api.post<ApiResponse>("/admin/leads/bulk-delete", { ids });

export const deleteAllLeads = () =>
  api.post<ApiResponse>("/admin/leads/delete-all");

// ===================== ADMIN CONTACTS =====================

export const adminListContacts = (page?: number, limit?: number) =>
  api.get<ApiResponse<Contact[]>>("/admin/contacts", { params: { page, limit } });

export const deleteContact = (id: number) =>
  api.delete<ApiResponse>(`/admin/contacts/${id}`);

// ===================== ADMIN FEEDBACK =====================

export const getCompanyFeedback = () =>
  api.get<ApiResponse<Feedback[]>>("/admin/feedback/company");

export const getAgentFeedback = () =>
  api.get<ApiResponse<Feedback[]>>("/admin/feedback/agents");

// ===================== ADMIN DASHBOARD =====================

export const getDashboardStats = () =>
  api.get<ApiResponse>("/admin/dashboard/stats");

export const getDashboardCharts = (status?: string) =>
  api.get<ApiResponse>("/admin/dashboard/charts", { params: { status } });

export const getSidebarCounts = () =>
  api.get<ApiResponse>("/admin/dashboard/sidebar-counts");

// ===================== ADMIN CMS - ABOUT =====================

export const adminCreateAbout = (data: { title?: string; content: string }, file?: File) => {
  const formData = new FormData();
  if (data.title) formData.append("title", data.title);
  formData.append("content", data.content);
  if (file) formData.append("image", file);
  return api.post<ApiResponse<About>>("/admin/about", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 60000,
  });
};

export const adminUpdateAbout = (id: number, data: { title?: string; content: string }, file?: File) => {
  const formData = new FormData();
  if (data.title) formData.append("title", data.title);
  formData.append("content", data.content);
  if (file) formData.append("image", file);
  return api.put<ApiResponse<About>>(`/admin/about/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 60000,
  });
};

export const adminDeleteAbout = (id: number) =>
  api.delete<ApiResponse>(`/admin/about/${id}`);

// ===================== ADMIN CMS - TEAM =====================

export const adminCreateTeamMember = (formData: FormData) =>
  api.post<ApiResponse<TeamMember>>("/admin/team", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 60000,
  });

export const adminUpdateTeamMember = (id: number, formData: FormData) =>
  api.put<ApiResponse<TeamMember>>(`/admin/team/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 60000,
  });

export const adminDeleteTeamMember = (id: number) =>
  api.delete<ApiResponse>(`/admin/team/${id}`);

// ===================== ADMIN CMS - LOCATIONS =====================

export const adminCreateState = (sname: string) =>
  api.post<ApiResponse<State>>("/admin/states", { sname });

export const adminUpdateState = (id: number, sname: string) =>
  api.put<ApiResponse<State>>(`/admin/states/${id}`, { sname });

export const adminDeleteState = (id: number) =>
  api.delete<ApiResponse>(`/admin/states/${id}`);

export const adminCreateCity = (cname: string, sid: number) =>
  api.post<ApiResponse<City>>("/admin/cities", { cname, sid });

export const adminUpdateCity = (id: number, cname: string, sid: number) =>
  api.put<ApiResponse<City>>(`/admin/cities/${id}`, { cname, sid });

export const adminDeleteCity = (id: number) =>
  api.delete<ApiResponse>(`/admin/cities/${id}`);
