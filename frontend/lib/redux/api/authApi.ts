import { baseApi } from "./baseApi";
import type { ApiResponse, User } from "@amaken/shared";

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    authVerifyEmail: builder.mutation<ApiResponse, { email: string }>({
      query: (body) => ({ url: "/auth/verify-email", method: "POST", body }),
    }),
    authVerifyOtp: builder.mutation<
      ApiResponse,
      { email: string; code: string }
    >({
      query: (body) => ({ url: "/auth/verify-otp", method: "POST", body }),
    }),
    authVerifyForgotOtp: builder.mutation<
      ApiResponse<{ resetToken: string }>,
      { email: string; code: string }
    >({
      query: (body) => ({
        url: "/auth/verify-forgot-otp",
        method: "POST",
        body,
      }),
    }),
    authRegister: builder.mutation<
      ApiResponse<{ accessToken: string; refreshToken: string; user: User }>,
      Record<string, unknown>
    >({
      query: (body) => ({ url: "/auth/register", method: "POST", body }),
    }),
    authLogin: builder.mutation<
      ApiResponse<{ accessToken: string; refreshToken: string; user: User }>,
      { email: string; password: string }
    >({
      query: (body) => ({ url: "/auth/login", method: "POST", body }),
    }),
    authForgotPassword: builder.mutation<ApiResponse, { email: string }>({
      query: (body) => ({ url: "/auth/forgot-password", method: "POST", body }),
    }),
    authResetPassword: builder.mutation<
      ApiResponse,
      { email: string; resetToken: string; password: string }
    >({
      query: (body) => ({ url: "/auth/reset-password", method: "POST", body }),
    }),
    authLogout: builder.mutation<ApiResponse, void>({
      query: () => ({ url: "/auth/logout", method: "POST" }),
    }),
  }),
});

export const {
  useAuthVerifyEmailMutation,
  useAuthVerifyOtpMutation,
  useAuthVerifyForgotOtpMutation,
  useAuthRegisterMutation,
  useAuthLoginMutation,
  useAuthForgotPasswordMutation,
  useAuthResetPasswordMutation,
  useAuthLogoutMutation,
} = authApi;