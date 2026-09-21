import { baseApi } from "./baseApi";
import type {
  ApiResponse,
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
} from "@amaken/shared";

export const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    adminVerifyPin: builder.mutation<ApiResponse, { pin: string }>({
      query: (body) => ({ url: "/admin/pin", method: "POST", body }),
    }),
    adminLogin: builder.mutation<
      ApiResponse<{ accessToken: string; refreshToken: string; admin: Admin }>,
      { email: string; password: string }
    >({
      query: (body) => ({ url: "/admin/login", method: "POST", body }),
    }),
    getAdminProfile: builder.query<ApiResponse<Admin>, void>({
      query: () => ({ url: "/admin/profile" }),
      providesTags: ["Admin"],
    }),
    updateAdminProfile: builder.mutation<
      ApiResponse<Admin>,
      Record<string, unknown>
    >({
      query: (body) => ({ url: "/admin/profile", method: "PUT", body }),
      invalidatesTags: ["Admin"],
    }),
    uploadAdminAvatar: builder.mutation<ApiResponse<{ image: string }>, FormData>(
      {
        query: (formData) => ({
          url: "/admin/profile/avatar",
          method: "POST",
          body: formData,
        }),
        invalidatesTags: ["Admin"],
      }
    ),
    removeAdminAvatar: builder.mutation<ApiResponse, void>({
      query: () => ({ url: "/admin/profile/avatar", method: "DELETE" }),
      invalidatesTags: ["Admin"],
    }),
    uploadAdminLogo: builder.mutation<ApiResponse<{ image: string }>, FormData>({
      query: (formData) => ({
        url: "/admin/profile/logo",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Admin"],
    }),
    removeAdminLogo: builder.mutation<ApiResponse, void>({
      query: () => ({ url: "/admin/profile/logo", method: "DELETE" }),
      invalidatesTags: ["Admin"],
    }),
    updateAdminLinks: builder.mutation<
      ApiResponse,
      Record<string, string>
    >({
      query: (body) => ({ url: "/admin/profile/links", method: "PUT", body }),
      invalidatesTags: ["Admin"],
    }),
    changeAdminPassword: builder.mutation<
      ApiResponse,
      { currentPassword: string; newPassword: string }
    >({
      query: (body) => ({ url: "/admin/profile/password", method: "PUT", body }),
    }),
    listAdminUsers: builder.query<
      ApiResponse<User[]>,
      { type?: string; page?: number; limit?: number }
    >({
      query: (params) => ({ url: "/admin/users", params }),
      providesTags: ["AdminUser"],
    }),
    listAdminAgents: builder.query<
      ApiResponse<User[]>,
      { page?: number; limit?: number }
    >({
      query: (params) => ({ url: "/admin/users/agents", params }),
      providesTags: ["AdminUser"],
    }),
    listAdminBuilders: builder.query<
      ApiResponse<User[]>,
      { page?: number; limit?: number }
    >({
      query: (params) => ({ url: "/admin/users/builders", params }),
      providesTags: ["AdminUser"],
    }),
    listAdminAdmins: builder.query<ApiResponse<Admin[]>, void>({
      query: () => ({ url: "/admin/users/admins" }),
      providesTags: ["AdminUser"],
    }),
    adminUserStatus: builder.mutation<
      ApiResponse,
      { id: number; action: string }
    >({
      query: ({ id, action }) => ({
        url: `/admin/users/${id}/status`,
        method: "PUT",
        body: { action },
      }),
      invalidatesTags: ["AdminUser"],
    }),
    adminDeleteUser: builder.mutation<ApiResponse, number>({
      query: (id) => ({ url: `/admin/users/${id}`, method: "DELETE" }),
      invalidatesTags: ["AdminUser"],
    }),
    listRegisteredAccounts: builder.query<
      ApiResponse<RegisterEmail[]>,
      { page?: number; limit?: number }
    >({
      query: (params) => ({ url: "/admin/accounts/registered", params }),
      providesTags: ["AdminAccount"],
    }),
    listDeletedAccounts: builder.query<
      ApiResponse<DelAccount[]>,
      { page?: number; limit?: number }
    >({
      query: (params) => ({ url: "/admin/accounts/deleted", params }),
      providesTags: ["AdminAccount"],
    }),
    listBlockedAccounts: builder.query<
      ApiResponse<DelAccount[]>,
      { page?: number; limit?: number }
    >({
      query: (params) => ({ url: "/admin/accounts/blocked", params }),
      providesTags: ["AdminAccount"],
    }),
    deleteAccountRecord: builder.mutation<ApiResponse, number>({
      query: (id) => ({ url: `/admin/accounts/${id}`, method: "DELETE" }),
      invalidatesTags: ["AdminAccount"],
    }),
    adminListProperties: builder.query<
      ApiResponse<Property[]>,
      {
        page?: number;
        limit?: number;
        status?: string;
        stype?: string;
        type?: string;
        search?: string;
      }
    >({
      query: (params) => ({ url: "/admin/properties", params }),
      providesTags: ["Property"],
    }),
    adminListPendingApproval: builder.query<
      ApiResponse<Property[]>,
      { page?: number; limit?: number }
    >({
      query: (params) => ({ url: "/admin/properties/approval", params }),
      providesTags: ["Property"],
    }),
    approveProperty: builder.mutation<ApiResponse, number>({
      query: (id) => ({ url: `/admin/properties/${id}/approve`, method: "PUT" }),
      invalidatesTags: ["Property"],
    }),
    disapproveProperty: builder.mutation<ApiResponse, number>({
      query: (id) => ({
        url: `/admin/properties/${id}/disapprove`,
        method: "PUT",
      }),
      invalidatesTags: ["Property"],
    }),
    hideProperty: builder.mutation<ApiResponse, number>({
      query: (id) => ({ url: `/admin/properties/${id}/hide`, method: "PUT" }),
      invalidatesTags: ["Property"],
    }),
    displayProperty: builder.mutation<ApiResponse, number>({
      query: (id) => ({ url: `/admin/properties/${id}/display`, method: "PUT" }),
      invalidatesTags: ["Property"],
    }),
    freezeProperty: builder.mutation<ApiResponse, number>({
      query: (id) => ({ url: `/admin/properties/${id}/freeze`, method: "PUT" }),
      invalidatesTags: ["Property"],
    }),
    releaseProperty: builder.mutation<ApiResponse, number>({
      query: (id) => ({ url: `/admin/properties/${id}/release`, method: "PUT" }),
      invalidatesTags: ["Property"],
    }),
    adminDeleteProperty: builder.mutation<ApiResponse, number>({
      query: (id) => ({ url: `/admin/properties/${id}`, method: "DELETE" }),
      invalidatesTags: ["Property"],
    }),
    adminListLeads: builder.query<
      ApiResponse<PropertyLead[]>,
      { page?: number; limit?: number; from?: string; to?: string }
    >({
      query: (params) => ({ url: "/admin/leads", params }),
      providesTags: ["Lead"],
    }),
    exportLeads: builder.query<
      Blob,
      { mode?: string; page?: number; limit?: number; from?: string; to?: string }
    >({
      query: (params) => ({
        url: "/admin/leads/export",
        params,
        responseHandler: (response: Response) => response.blob(),
      }),
      transformResponse: (response: Blob) => response,
    }),
    deleteLead: builder.mutation<ApiResponse, number>({
      query: (id) => ({ url: `/admin/leads/${id}`, method: "DELETE" }),
      invalidatesTags: ["Lead"],
    }),
    bulkDeleteLeads: builder.mutation<ApiResponse, number[]>({
      query: (ids) => ({
        url: "/admin/leads/bulk-delete",
        method: "POST",
        body: { ids },
      }),
      invalidatesTags: ["Lead"],
    }),
    deleteAllLeads: builder.mutation<ApiResponse, void>({
      query: () => ({ url: "/admin/leads/delete-all", method: "POST" }),
      invalidatesTags: ["Lead"],
    }),
    adminListContacts: builder.query<
      ApiResponse<Contact[]>,
      { page?: number; limit?: number }
    >({
      query: (params) => ({ url: "/admin/contacts", params }),
      providesTags: ["Contact"],
    }),
    deleteContact: builder.mutation<ApiResponse, number>({
      query: (id) => ({ url: `/admin/contacts/${id}`, method: "DELETE" }),
      invalidatesTags: ["Contact"],
    }),
    getCompanyFeedback: builder.query<ApiResponse<Feedback[]>, void>({
      query: () => ({ url: "/admin/feedback/company" }),
      providesTags: ["Feedback"],
    }),
    getAgentFeedback: builder.query<ApiResponse<Feedback[]>, void>({
      query: () => ({ url: "/admin/feedback/agents" }),
      providesTags: ["Feedback"],
    }),
    getDashboardStats: builder.query<ApiResponse, void>({
      query: () => ({ url: "/admin/dashboard/stats" }),
      providesTags: ["Dashboard"],
    }),
    getDashboardCharts: builder.query<ApiResponse, { status?: string }>({
      query: (params) => ({ url: "/admin/dashboard/charts", params }),
    }),
    getSidebarCounts: builder.query<ApiResponse, void>({
      query: () => ({ url: "/admin/dashboard/sidebar-counts" }),
      providesTags: ["Dashboard"],
    }),
    adminCreateAbout: builder.mutation<
      ApiResponse<About>,
      { data: { title?: string; content: string }; file?: File }
    >({
      query: ({ data, file }) => {
        const formData = new FormData();
        if (data.title) formData.append("title", data.title);
        formData.append("content", data.content);
        if (file) formData.append("image", file);
        return { url: "/admin/about", method: "POST", body: formData };
      },
      invalidatesTags: ["About"],
    }),
    adminUpdateAbout: builder.mutation<
      ApiResponse<About>,
      { id: number; data: { title?: string; content: string }; file?: File }
    >({
      query: ({ id, data, file }) => {
        const formData = new FormData();
        if (data.title) formData.append("title", data.title);
        formData.append("content", data.content);
        if (file) formData.append("image", file);
        return { url: `/admin/about/${id}`, method: "PUT", body: formData };
      },
      invalidatesTags: ["About"],
    }),
    adminDeleteAbout: builder.mutation<ApiResponse, number>({
      query: (id) => ({ url: `/admin/about/${id}`, method: "DELETE" }),
      invalidatesTags: ["About"],
    }),
    adminCreateTeamMember: builder.mutation<ApiResponse<TeamMember>, FormData>({
      query: (formData) => ({ url: "/admin/team", method: "POST", body: formData }),
      invalidatesTags: ["Team"],
    }),
    adminUpdateTeamMember: builder.mutation<
      ApiResponse<TeamMember>,
      { id: number; formData: FormData }
    >({
      query: ({ id, formData }) => ({
        url: `/admin/team/${id}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: ["Team"],
    }),
    adminDeleteTeamMember: builder.mutation<ApiResponse, number>({
      query: (id) => ({ url: `/admin/team/${id}`, method: "DELETE" }),
      invalidatesTags: ["Team"],
    }),
    adminCreateState: builder.mutation<ApiResponse<State>, { sname: string }>({
      query: (body) => ({ url: "/admin/states", method: "POST", body }),
      invalidatesTags: ["State"],
    }),
    adminUpdateState: builder.mutation<
      ApiResponse<State>,
      { id: number; sname: string }
    >({
      query: ({ id, sname }) => ({
        url: `/admin/states/${id}`,
        method: "PUT",
        body: { sname },
      }),
      invalidatesTags: ["State"],
    }),
    adminDeleteState: builder.mutation<ApiResponse, number>({
      query: (id) => ({ url: `/admin/states/${id}`, method: "DELETE" }),
      invalidatesTags: ["State"],
    }),
    adminCreateCity: builder.mutation<
      ApiResponse<City>,
      { cname: string; sid: number }
    >({
      query: (body) => ({ url: "/admin/cities", method: "POST", body }),
      invalidatesTags: ["City"],
    }),
    adminUpdateCity: builder.mutation<
      ApiResponse<City>,
      { id: number; cname: string; sid: number }
    >({
      query: ({ id, cname, sid }) => ({
        url: `/admin/cities/${id}`,
        method: "PUT",
        body: { cname, sid },
      }),
      invalidatesTags: ["City"],
    }),
    adminDeleteCity: builder.mutation<ApiResponse, number>({
      query: (id) => ({ url: `/admin/cities/${id}`, method: "DELETE" }),
      invalidatesTags: ["City"],
    }),
  }),
});

export const {
  useAdminVerifyPinMutation,
  useAdminLoginMutation,
  useGetAdminProfileQuery,
  useUpdateAdminProfileMutation,
  useUploadAdminAvatarMutation,
  useRemoveAdminAvatarMutation,
  useUploadAdminLogoMutation,
  useRemoveAdminLogoMutation,
  useUpdateAdminLinksMutation,
  useChangeAdminPasswordMutation,
  useListAdminUsersQuery,
  useListAdminAgentsQuery,
  useListAdminBuildersQuery,
  useListAdminAdminsQuery,
  useAdminUserStatusMutation,
  useAdminDeleteUserMutation,
  useListRegisteredAccountsQuery,
  useListDeletedAccountsQuery,
  useListBlockedAccountsQuery,
  useDeleteAccountRecordMutation,
  useAdminListPropertiesQuery,
  useAdminListPendingApprovalQuery,
  useApprovePropertyMutation,
  useDisapprovePropertyMutation,
  useHidePropertyMutation,
  useDisplayPropertyMutation,
  useFreezePropertyMutation,
  useReleasePropertyMutation,
  useAdminDeletePropertyMutation,
  useAdminListLeadsQuery,
  useExportLeadsQuery,
  useDeleteLeadMutation,
  useBulkDeleteLeadsMutation,
  useDeleteAllLeadsMutation,
  useAdminListContactsQuery,
  useDeleteContactMutation,
  useGetCompanyFeedbackQuery,
  useGetAgentFeedbackQuery,
  useGetDashboardStatsQuery,
  useGetDashboardChartsQuery,
  useGetSidebarCountsQuery,
  useAdminCreateAboutMutation,
  useAdminUpdateAboutMutation,
  useAdminDeleteAboutMutation,
  useAdminCreateTeamMemberMutation,
  useAdminUpdateTeamMemberMutation,
  useAdminDeleteTeamMemberMutation,
  useAdminCreateStateMutation,
  useAdminUpdateStateMutation,
  useAdminDeleteStateMutation,
  useAdminCreateCityMutation,
  useAdminUpdateCityMutation,
  useAdminDeleteCityMutation,
} = adminApi;