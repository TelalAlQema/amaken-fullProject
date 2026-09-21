import { baseApi } from "./baseApi";
import type { ApiResponse, User } from "@amaken/shared";

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMe: builder.query<ApiResponse<User>, void>({
      query: () => ({ url: "/users/me" }),
      providesTags: ["User"],
    }),
    updateMe: builder.mutation<
      ApiResponse<User>,
      { data: Record<string, unknown> }
    >({
      query: ({ data }) => ({ url: "/users/me", method: "PUT", body: data }),
      invalidatesTags: ["User"],
    }),
    uploadAvatar: builder.mutation<ApiResponse<{ image: string }>, FormData>({
      query: (formData) => ({
        url: "/users/me/avatar",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["User"],
    }),
    removeAvatar: builder.mutation<ApiResponse, void>({
      query: () => ({ url: "/users/me/avatar", method: "DELETE" }),
      invalidatesTags: ["User"],
    }),
    uploadLogo: builder.mutation<ApiResponse<{ image: string }>, FormData>({
      query: (formData) => ({
        url: "/users/me/logo",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["User"],
    }),
    removeLogo: builder.mutation<ApiResponse, void>({
      query: () => ({ url: "/users/me/logo", method: "DELETE" }),
      invalidatesTags: ["User"],
    }),
    changePassword: builder.mutation<
      ApiResponse,
      { currentPassword: string; newPassword: string }
    >({
      query: (body) => ({ url: "/users/me/password", method: "PUT", body }),
    }),
    updateSocialLinks: builder.mutation<
      ApiResponse,
      Record<string, string>
    >({
      query: (body) => ({ url: "/users/me/links", method: "PUT", body }),
      invalidatesTags: ["User"],
    }),
    deactivateAccount: builder.mutation<ApiResponse, void>({
      query: () => ({ url: "/users/me/deactivate", method: "POST" }),
      invalidatesTags: ["User"],
    }),
    activateAccount: builder.mutation<ApiResponse, void>({
      query: () => ({ url: "/users/me/activate", method: "POST" }),
      invalidatesTags: ["User"],
    }),
    deleteAccount: builder.mutation<ApiResponse, void>({
      query: () => ({ url: "/users/me", method: "DELETE" }),
    }),
    blockUser: builder.mutation<ApiResponse, number>({
      query: (id) => ({ url: `/users/block/${id}`, method: "POST" }),
    }),
    unblockUser: builder.mutation<ApiResponse, number>({
      query: (id) => ({ url: `/users/unblock/${id}`, method: "POST" }),
    }),
    getUserProfile: builder.query<ApiResponse<User>, number>({
      query: (id) => ({ url: `/users/${id}` }),
    }),
  }),
});

export const {
  useGetMeQuery,
  useUpdateMeMutation,
  useUploadAvatarMutation,
  useRemoveAvatarMutation,
  useUploadLogoMutation,
  useRemoveLogoMutation,
  useChangePasswordMutation,
  useUpdateSocialLinksMutation,
  useDeactivateAccountMutation,
  useActivateAccountMutation,
  useDeleteAccountMutation,
  useBlockUserMutation,
  useUnblockUserMutation,
  useGetUserProfileQuery,
} = userApi;