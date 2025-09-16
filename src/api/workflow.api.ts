import { createApi } from '@reduxjs/toolkit/query/react';
import { customBaseQuery } from './baseQuery';

export interface WorkflowTemplate {
  id: number;
  code: string;
  transfer_type: string;
  name: string;
  description: string;
  is_active: boolean;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface WorkflowStage {
  order_index: number;
  name: string;
  decision_policy: 'ALL' | 'ANY' | 'QUORUM';
  allow_reject: boolean;
  sla_hours: number;
  required_user_level: number;
}

export interface CreateWorkflowRequest {
  code: string;
  transfer_type: string;
  name: string;
  description: string;
  version: number;
  is_active: boolean;
  stages: WorkflowStage[];
}

export interface UserLevel {
  id: number;
  name: string;
  description: string;
  level_order: number;
}

export type UserLevelResponse = UserLevel[];

export interface WorkflowTemplateListResponse {
  results: WorkflowTemplate[];
  count: number;
  next: string | null;
  previous: string | null;
}

export const workflowApi = createApi({
  reducerPath: 'workflowApi',
  baseQuery: customBaseQuery,
  tagTypes: ['WorkflowTemplate', 'UserLevel'],
  endpoints: (builder) => ({
    getWorkflowTemplates: builder.query<WorkflowTemplateListResponse, void>({
      query: () => ({
        url: '/approvals/workflow-templates/',
        method: 'GET',
      }),
      providesTags: ['WorkflowTemplate'],
    }),
    getUserLevels: builder.query<UserLevelResponse, void>({
      query: () => ({
        url: '/auth/levels/',
        method: 'GET',
      }),
      providesTags: ['UserLevel'],
    }),
    createWorkflowTemplate: builder.mutation<WorkflowTemplate, CreateWorkflowRequest>({
      query: (body) => ({
        url: '/approvals/workflow-templates/',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['WorkflowTemplate'],
    }),
  }),
});

export const {
  useGetWorkflowTemplatesQuery,
  useGetUserLevelsQuery,
  useCreateWorkflowTemplateMutation,
} = workflowApi;