// src/lib/api/payments.ts
import apiClient from "@/lib/api-client";
import type { Payment, PaymentCreatePayload } from "@/lib/types";

export const paymentsApi = {
  list: async (): Promise<Payment[]> => {
    const res = await apiClient.get<Payment[]>("/payments");
    return res.data;
  },

  create: async (payload: PaymentCreatePayload): Promise<Payment> => {
    const res = await apiClient.post<Payment>("/payments", payload);
    return res.data;
  },
};
