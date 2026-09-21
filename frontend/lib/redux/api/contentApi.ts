import { baseApi } from "./baseApi";
import type {
  ApiResponse,
  About,
  TeamMember,
  City,
  State,
} from "@amaken/shared";

export const contentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAboutContent: builder.query<ApiResponse<About[]>, void>({
      query: () => ({ url: "/about" }),
    }),
    getTeamMembers: builder.query<ApiResponse<TeamMember[]>, void>({
      query: () => ({ url: "/team" }),
    }),
    getStates: builder.query<ApiResponse<State[]>, void>({
      query: () => ({ url: "/states" }),
    }),
    getCities: builder.query<ApiResponse<City[]>, void>({
      query: () => ({ url: "/cities" }),
    }),
  }),
});

export const {
  useGetAboutContentQuery,
  useGetTeamMembersQuery,
  useGetStatesQuery,
  useGetCitiesQuery,
} = contentApi;