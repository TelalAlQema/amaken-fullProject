import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const isAdminUrl = (arg: string | FetchArgs): boolean => {
  const url = typeof arg === "string" ? arg : arg.url;
  return typeof url === "string" && url.startsWith("/admin");
};

const getTokenKey = (admin: boolean) =>
  admin ? "admin_access_token" : "access_token";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_URL,
  prepareHeaders: (headers, { arg }) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem(getTokenKey(isAdminUrl(arg)));
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
    }
    return headers;
  },
});

const refreshAccessToken = async (admin: boolean): Promise<boolean> => {
  const refreshToken = localStorage.getItem(
    admin ? "admin_refresh_token" : "refresh_token"
  );
  if (!refreshToken) return false;
  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    const json = await res.json();
    if (json.success && json.data) {
      localStorage.setItem(
        getTokenKey(admin),
        json.data.accessToken
      );
      localStorage.setItem(
        admin ? "admin_refresh_token" : "refresh_token",
        json.data.refreshToken
      );
      return true;
    }
  } catch {
    // ignore
  }
  return false;
};

const clearTokens = (admin: boolean) => {
  localStorage.removeItem(getTokenKey(admin));
  localStorage.removeItem(admin ? "admin_refresh_token" : "refresh_token");
  if (admin) {
    localStorage.removeItem("admin_pin_verified");
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const adminRequest = isAdminUrl(args);
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    const refreshed = await refreshAccessToken(adminRequest);
    if (refreshed) {
      result = await rawBaseQuery(args, api, extraOptions);
    } else {
      clearTokens(adminRequest);
      if (typeof window !== "undefined") {
        window.location.href = adminRequest ? "/admin/login" : "/login";
      }
    }
  }
  return result;
};

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    "User",
    "Admin",
    "Property",
    "MyProperty",
    "Feedback",
    "About",
    "Team",
    "State",
    "City",
    "Contact",
    "Lead",
    "Dashboard",
    "AdminUser",
    "AdminAccount",
  ],
  endpoints: () => ({}),
});