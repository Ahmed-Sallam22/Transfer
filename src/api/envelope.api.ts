import { createApi } from '@reduxjs/toolkit/query/react';
import { customBaseQuery } from './baseQuery';

export interface Project {
  id: string;
  project?: string;
  alias_default?: string;
}

export interface ProjectsResponse {
  data: Project[];
}

export interface EnvelopeProject {
  project_code: string;
  submitted_total: number;
  approved_total: number;
}

export interface EnvelopeResponse {
  message: string;
  initial_envelope: number;
  current_envelope: number;
  estimated_envelope: number;
  data: EnvelopeProject[];
}

export const envelopeApi = createApi({
  reducerPath: 'envelopeApi',
  baseQuery: customBaseQuery,
  tagTypes: ['Envelope', 'Projects'],
  endpoints: (builder) => ({
    getProjects: builder.query<ProjectsResponse, void>({
      query: () => ({
        url: '/accounts-entities/projects/',
        method: 'GET',
      }),
      providesTags: ['Projects'],
    }),
    getProjectsEnvelope: builder.query<ProjectsResponse, void>({
      query: () => ({
        url: '/projects/envelope/',
        method: 'GET',
      }),
      providesTags: ['Projects'],
    }),
    getActiveProjectsWithEnvelope: builder.query<EnvelopeResponse, {
      project_code: string ;
      year?: string;
      month?: string;
    }>({
      query: ({ project_code, year, month }) => {
        const params = new URLSearchParams({ project_code });
        if (year) params.append('year', year);
        if (month) params.append('month', month);
        
        return {
          url: `/accounts-entities/projects/active-with-envelope/?${params.toString()}`,
          method: 'GET',
        };
      },
      providesTags: ['Envelope'],
    }),
  }),
});

export const {
  useGetProjectsQuery,
  useGetProjectsEnvelopeQuery,
  useGetActiveProjectsWithEnvelopeQuery,
} = envelopeApi;
