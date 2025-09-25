import { createApi } from '@reduxjs/toolkit/query/react';
import { customBaseQuery } from './baseQuery';

export interface BalanceReportItem {
  control_budget_name: string;
  ledger_name: string | null;
  as_of_period: string;
  segment1: string;
  segment2: string;
  segment3: string;
  encumbrance_ytd: number;
  other_ytd: number;
  actual_ytd: number;
  funds_available_asof: number;
  budget_ytd: number;
  budget_adjustments: number;
  commitments: number;
  expenditures: number;
  initial_budget: number;
  obligations: number;
  other_consumption: number;
  total_budget: number;
  total_consumption: number;
}

export interface BalanceReportResponse {
  message: string;
  data: {
    success: boolean;
    data: BalanceReportItem[];
    message: string;
    total_records: number;
    count?: number;
    next?: string;
    previous?: string;
    current_page?: number;
    total_pages?: number;
  };
}

export interface BalanceReportParams {
  control_budget_name: string;
  as_of_period: string;
  page?: number;
  page_size?: number;
}

export const reportsApi = createApi({
  reducerPath: 'reportsApi',
  baseQuery: customBaseQuery,
  tagTypes: ['Report'],
  endpoints: (builder) => ({
    getBalanceReport: builder.query<BalanceReportResponse, BalanceReportParams>({
      query: ({ control_budget_name, as_of_period, page = 1, page_size = 10 }) => ({
        url: `/accounts-entities/balance-report/single_balance/`,
        method: 'GET',
        params: {
          control_budget_name,
          as_of_period,
          page,
          page_size,
        },
      }),
      providesTags: ['Report'],
    }),
  }),
});

export const { 
  useGetBalanceReportQuery,
} = reportsApi;
