import { baseApi } from "./baseApi";
import type { ApiResponse, Property } from "@amaken/shared";

export const propertyApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProperties: builder.query<
      ApiResponse<Property[]>,
      Record<string, string | number> | void
    >({
      query: (params) =>
        params ? { url: "/properties", params } : { url: "/properties" },
    }),
    getProperty: builder.query<ApiResponse<Property>, number>({
      query: (id) => ({ url: `/properties/${id}` }),
      providesTags: (result, _error, id) => [
        { type: "Property", id: id as number & string },
      ],
    }),
    getPropertiesByState: builder.query<
      ApiResponse<Property[]>,
      { slug: string; params?: Record<string, string | number> }
    >({
      query: ({ slug, params }) => ({
        url: `/properties/state/${slug}`,
        params,
      }),
    }),
    getMyProperties: builder.query<
      ApiResponse<Property[]>,
      Record<string, string | number> | void
    >({
      query: (params) =>
        params
          ? { url: "/properties/my", params }
          : { url: "/properties/my" },
      providesTags: ["MyProperty"],
    }),
    createProperty: builder.mutation<ApiResponse<Property>, FormData>({
      query: (formData) => ({
        url: "/properties",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["MyProperty"],
    }),
    updateProperty: builder.mutation<
      ApiResponse<Property>,
      { id: number; formData: FormData }
    >({
      query: ({ id, formData }) => ({
        url: `/properties/${id}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: ["Property", "MyProperty"],
    }),
    deleteProperty: builder.mutation<ApiResponse, number>({
      query: (id) => ({ url: `/properties/${id}`, method: "DELETE" }),
      invalidatesTags: ["MyProperty", "Property"],
    }),
  }),
});

export const {
  useGetPropertiesQuery,
  useGetPropertyQuery,
  useGetPropertiesByStateQuery,
  useGetMyPropertiesQuery,
  useCreatePropertyMutation,
  useUpdatePropertyMutation,
  useDeletePropertyMutation,
} = propertyApi;