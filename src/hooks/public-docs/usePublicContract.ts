"use client";

import { useState, useEffect, useCallback } from "react";
import { contractsApi } from "@/lib/api/contracts";
import type { PublicContractView } from "@/lib/types";
import toast from "react-hot-toast";

export interface UsePublicContractReturn {
  contract: PublicContractView | null;
  loading: boolean;
  error: string | null;
  isSigning: boolean;
  signContract: (signatureData: string) => Promise<void>;
  downloadPdf: () => Promise<void>;
  signed: boolean;
  signingError: string | null;
  signingOpensAt: string | null;
  refetch: () => Promise<void>;
}

export function usePublicContract(token: string): UsePublicContractReturn {
  const [contract, setContract] = useState<PublicContractView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSigning, setIsSigning] = useState(false);
  const [signingError, setSigningError] = useState<string | null>(null);
  const [signingOpensAt, setSigningOpensAt] = useState<string | null>(null);

  const fetchContract = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await contractsApi.publicView(token);
      setContract(data);
    } catch (err: unknown) {
      const apiErr = err as { response?: { status?: number; data?: { detail?: string } } };
      const msg = apiErr.response?.data?.detail || "This contract link is invalid or has expired.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const signContract = async (_signatureData: string) => {
    if (!contract || contract.signed_by_client) return;
    
    setIsSigning(true);
    setSigningError(null);
    
    try {
      await contractsApi.publicSign(token);
      
      setContract(prev => prev ? { 
        ...prev, 
        signed_by_client: true,
        status: "signed" as const
      } : null);
      
      toast.success("Contract signed successfully!");
    } catch (err: unknown) {
      const apiErr = err as { response?: { status?: number; data?: { detail?: string; opens_at?: string } } };
      const status = apiErr.response?.status;
      const detail = apiErr.response?.data?.detail || "Failed to sign contract.";
      
      if (status === 422) {
        setSigningError(detail);
        const opensAt = apiErr.response?.data?.opens_at;
        if (opensAt) {
          setSigningOpensAt(opensAt);
        }
      } else {
        toast.error(detail);
      }
    } finally {
      setIsSigning(false);
    }
  };

  const downloadPdf = async () => {
    if (!contract) return;
    try {
      toast.loading("Generating PDF...");
      const res = await contractsApi.publicDownloadPdf(token);
      const blob = res.data instanceof Blob ? res.data : new Blob([res.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `contract-${contract.contract_number}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.dismiss();
      toast.success("PDF downloaded");
    } catch {
      toast.dismiss();
      toast.error("Failed to download PDF");
    }
  };

  useEffect(() => {
    if (token) fetchContract();
  }, [token, fetchContract]);

  const signed = contract?.signed_by_client ?? false;

  return {
    contract,
    loading,
    error,
    isSigning,
    signContract,
    downloadPdf,
    signed,
    signingError,
    signingOpensAt,
    refetch: fetchContract
  };
}
