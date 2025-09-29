// RTK Query endpoint configured like your example (attachmentsApi)
import { createApi } from '@reduxjs/toolkit/query/react';
import { customBaseQuery } from './baseQuery';

export interface ChatbotRequest {
  user_input: string;
}

export interface ChatbotAgents {
  GeneralQAAgent?: string;
  PageNavigatorAgent?: string;   // a route path string
  SQLBuilderAgent?: string;      // HTML string for table
}

export interface ChatbotResponse {
  status: 'success' | 'error';
  response?: ChatbotAgents;
  message?: string;
}

export const chatbotApi = createApi({
  reducerPath: 'chatbotApi',
  baseQuery: customBaseQuery,
  endpoints: (builder) => ({
    sendMessage: builder.mutation<ChatbotResponse, ChatbotRequest>({
      query: (body) => ({
        url: '/chatbot/public',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const { useSendMessageMutation } = chatbotApi;
