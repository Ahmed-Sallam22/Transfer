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
  id?: number;
  order_index: number;
  name: string;
  decision_policy: 'ALL' | 'ANY' | 'QUORUM';
  quorum_count?: number | null;
  required_role?: string | null;
  dynamic_filter_json?: Record<string, unknown> | null;
  allow_reject: boolean;
  allow_delegate?: boolean;
  sla_hours: number;
  parallel_group?: string | null;
  required_user_level: number;
  required_user_level_name?: string;
  created_at?: string;
  updated_at?: string;
}

export interface WorkflowTemplateWithStages extends WorkflowTemplate {
  stages: WorkflowStage[];
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
    updateWorkflowTemplate: builder.mutation<WorkflowTemplate, { id: number; body: Partial<CreateWorkflowRequest> }>({
      query: ({ id, body }) => ({
        url: `/approvals/workflow-templates/${id}/`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['WorkflowTemplate'],
    }),
    deleteWorkflowTemplate: builder.mutation<void, number>({
      query: (id) => ({
        url: `/approvals/workflow-templates/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['WorkflowTemplate'],
    }),
    getWorkflowTemplate: builder.query<WorkflowTemplateWithStages, number>({
      query: (id) => ({
        url: `/approvals/workflow-templates/${id}/`,
        method: 'GET',
      }),
      providesTags: (_result, _error, id) => [{ type: 'WorkflowTemplate', id }],
    }),
  }),
});

export const {
  useGetWorkflowTemplatesQuery,
  useGetUserLevelsQuery,
  useCreateWorkflowTemplateMutation,
  useUpdateWorkflowTemplateMutation,
  useDeleteWorkflowTemplateMutation,
  useGetWorkflowTemplateQuery,
} = workflowApi;