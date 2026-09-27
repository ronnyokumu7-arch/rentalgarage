import apiClient from "@/lib/api-client";
import type { InvestorContract } from "@/lib/types";

// ✅ Payload for generating a new contract
export interface InvestorContractCreatePayload {
  vehicle_id: number;
  booking_id?: number | null;       // Required for daily contracts
  duration_months?: number | null;  // Required for monthly contracts (1, 2, 3, 6, 12)
}

// ✅ Payload for signing a contract
export interface InvestorContractSignPayload {
  signature: string;                // Base64 encoded signature image
  signer_role: "agency" | "investor";
}

export const investorContractsApi = {
  // 1. Generate a new contract (Agency action)
  generate: (data: InvestorContractCreatePayload) =>
    apiClient.post<InvestorContract>("/investor-contracts/", data).then((r) => r.data),

  // 2. List contracts for the current tenant
  list: (params?: { vehicle_id?: number; contract_status?: string }) =>
    apiClient.get<InvestorContract[]>("/investor-contracts/", { params }).then((r) => r.data),

  // 3. Sign a contract (Agency or Investor)
  sign: (contractId: number, data: InvestorContractSignPayload) =>
    apiClient.post<InvestorContract>(`/investor-contracts/${contractId}/sign`, data).then((r) => r.data),

  // 4. Public view (No auth required, used for email links)
  getPublic: (token: string) =>
    apiClient.get(`/investor-contracts/public/${token}`).then((r) => r.data),
};
