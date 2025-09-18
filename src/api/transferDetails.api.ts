import { createApi } from '@reduxjs/toolkit/query/react';
import { customBaseQuery } from './baseQuery';

export interface TransferDetail {
  transfer_id: number;
  approved_budget: string;
  available_budget: string;
  from_center: string;
  to_center: string;
  reason: string | null;
  account_code: number;
  account_name: string;
  project_code: string;
  project_name: string;
  cost_center_code: number;
  cost_center_name: string;
  done: number;
  encumbrance: string;
  actual: string;
  file: string | null;
  transaction: number;
  validation_errors?: string[];
  // New financial fields
  budget_adjustments?: string;
  commitments?: string;
  expenditures?: string;
  initial_budget?: string;
  obligations?: string;
  other_consumption?: string;
}

export interface TransferDetailsSummary {
  transaction_id: string;
  total_transfers: number;
  total_from: number;
  total_to: number;
  balanced: boolean;
  status: string;
  period: string;
}

export interface TransferDetailsStatus {
  status: string;
}

export interface TransferDetailsResponse {
  summary: TransferDetailsSummary;
  transfers: TransferDetail[];
  status: TransferDetailsStatus;
}

export interface UpdateTransferDetailRequest {
  transfer_id: number;
  from_center?: string;
  to_center?: string;
  cost_center_code?: number;
}

export interface UpdateTransferDetailResponse {
  success: boolean;
  message?: string;
}

export interface CreateTransferData {
  transaction: number;
  cost_center_code: string;
  cost_center_name: string;
  account_code: string;
  account_name: string;
  project_code: string;
  project_name: string;
  approved_budget: number;
  available_budget: number;
  to_center: number;
  encumbrance: number;
  actual: number;
  done: number;
  from_center: number;
}

export interface CreateTransferRequest {
  transfers: CreateTransferData[];
}

export interface CreateTransferResponse {
  success: boolean;
  message?: string;
  created_transfers?: number[];
}

export interface SubmitTransferRequest {
  transaction: number;
}

export interface SubmitTransferResponse {
  success: boolean;
  message?: string;
}

export interface ExcelUploadRequest {
  file: File;
  transaction: number;
}

export interface ExcelUploadResponse {
  success: boolean;
  message?: string;
  created_transfers?: number[];
}

export interface ReopenTransferRequest {
  transaction: number;
  action: string;
}

export interface ReopenTransferResponse {
  success: boolean;
  message?: string;
}

export interface FinancialDataParams {
  segment1: number; // cost center code
  segment2: number; // account code
  segment3: string; // project code
  as_of_period: string; // period parameter
  control_budget_name: string; // budget name parameter
}

export interface FinancialDataRecord {
  control_budget_name: string;
  ledger_name: string;
  as_of_period: string | null;
  segment1: string;
  segment2: string;
  segment3: string;
  encumbrance_ytd: number;
  other_ytd: number;
  actual_ytd: number;
  funds_available_asof: number;
  budget_ytd: number;
}

export interface FinancialDataResponse {
  message: string;
  data: {
    success: boolean;
    data: FinancialDataRecord[];
    message: string;
    total_records: number;
  };
}

export const transferDetailsApi = createApi({
  reducerPath: 'transferDetailsApi',
  baseQuery: customBaseQuery,
  tagTypes: ['TransferDetails'],
  endpoints: (builder) => ({
    getTransferDetails: builder.query<TransferDetailsResponse, string>({
      query: (transactionId) => ({
        url: `/transfers/`,
        method: 'GET',
        params: {
          transaction: transactionId,
        },
      }),
      providesTags: (_result, _error, transactionId) => [
        { type: 'TransferDetails', id: transactionId }
      ],
    }),
    updateTransferDetail: builder.mutation<UpdateTransferDetailResponse, UpdateTransferDetailRequest>({
      query: ({ transfer_id, ...body }) => ({
        url: `/transfers/${transfer_id}/`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_result, _error, { transfer_id }) => [
        { type: 'TransferDetails', id: 'LIST' },
        { type: 'TransferDetails', id: transfer_id.toString() }
      ],
    }),
    createTransfer: builder.mutation<CreateTransferResponse, CreateTransferData[]>({
      query: (transfers) => ({
        url: `/transfers/create/`,
        method: 'POST',
        body: transfers,
      }),
      invalidatesTags: ['TransferDetails'],
    }),
    submitTransfer: builder.mutation<SubmitTransferResponse, SubmitTransferRequest>({
      query: (body) => ({
        url: `/transfers/submit/`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['TransferDetails'],
    }),
    getFinancialData: builder.query<FinancialDataResponse, FinancialDataParams>({
      query: ({ segment1, segment2, segment3, as_of_period, control_budget_name }) => ({
        url: `/accounts-entities/balance-report/single_balance/?as_of_period=${as_of_period}&control_budget_name=${control_budget_name}&segment1=${segment1}&segment2=${segment2}&segment3=${segment3}`,
        method: 'GET',
      }),
      providesTags: ['TransferDetails'],
    }),
    uploadExcel: builder.mutation<ExcelUploadResponse, ExcelUploadRequest>({
      query: ({ file, transaction }) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('transaction', transaction.toString());
        
        return {
          url: `/transfers/excel-upload/`,
          method: 'POST',
          body: formData,
          formData: true,
        };
      },
      invalidatesTags: ['TransferDetails'],
    }),
    reopenTransfer: builder.mutation<ReopenTransferResponse, ReopenTransferRequest>({
      query: (body) => ({
        url: `/transfers/reopen/`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['TransferDetails'],
    }),
  }),
});

export const {
  useGetTransferDetailsQuery,
  useUpdateTransferDetailMutation,
  useCreateTransferMutation,
  useSubmitTransferMutation,
  useGetFinancialDataQuery,
  useUploadExcelMutation,
  useReopenTransferMutation,
} = transferDetailsApi;
