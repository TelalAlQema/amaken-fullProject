import { baseApi } from "./baseApi";
import type { ApiResponse, Feedback } from "@amaken/shared";

type PaginatedFeedback = {
  items: (Omit<Feedback, "fid" | "fdescription"> & { id: number; description: string })[];
  pagination: NonNullable<ApiResponse["pagination"]>;
};

export const feedbackApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFeedback: builder.query<ApiResponse<Feedback>, number>({
      query: (id) => ({ url: `/feedback/${id}` }),
    }),
    getMyFeedback: builder.query<
      ApiResponse<PaginatedFeedback>,
      Record<string, string | number> | void
    >({
      query: (params) =>
        params ? { url: "/feedback/my", params } : { url: "/feedback/my" },
      providesTags: ["Feedback"],
    }),
    getFeedbackAboutMe: builder.query<
      ApiResponse<PaginatedFeedback>,
      Record<string, string | number> | void
    >({
      query: (params) =>
        params
          ? { url: "/feedback/about-me", params }
          : { url: "/feedback/about-me" },
    }),
    createFeedback: builder.mutation<
      ApiResponse<Feedback>,
      { receive_email: string; fdescription: string; rating: number }
    >({
      query: (body) => ({ url: "/feedback", method: "POST", body }),
      invalidatesTags: ["Feedback"],
    }),
    updateFeedback: builder.mutation<
      ApiResponse<Feedback>,
      { id: number; fdescription: string; rating: number }
    >({
      query: ({ id, ...body }) => ({
        url: `/feedback/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Feedback"],
    }),
    deleteFeedback: builder.mutation<ApiResponse, number>({
      query: (id) => ({ url: `/feedback/${id}`, method: "DELETE" }),
      invalidatesTags: ["Feedback"],
    }),
  }),
});

export const {
  useGetFeedbackQuery,
  useGetMyFeedbackQuery,
  useGetFeedbackAboutMeQuery,
  useCreateFeedbackMutation,
  useUpdateFeedbackMutation,
  useDeleteFeedbackMutation,
} = feedbackApi;
