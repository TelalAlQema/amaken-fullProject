import { baseApi } from "./baseApi";
import type { ApiResponse, Contact } from "@amaken/shared";

export const contactApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    submitContact: builder.mutation<
      ApiResponse<Contact>,
      {
        name: string;
        email: string;
        phone: string;
        subject: string;
        message: string;
      }
    >({
      query: (body) => ({ url: "/contact", method: "POST", body }),
    }),
    submitLead: builder.mutation<
      ApiResponse,
      {
        propertyId: number;
        data: { name: string; email: string; phone: string; nationality: string };
      }
    >({
      query: ({ propertyId, data }) => ({
        url: `/properties/${propertyId}/lead`,
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const { useSubmitContactMutation, useSubmitLeadMutation } = contactApi;