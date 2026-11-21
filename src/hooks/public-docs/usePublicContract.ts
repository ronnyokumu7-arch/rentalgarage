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
  signContract: (signatureData: string) => Promise<boolean>;
  submitHandover: (checklist: Record<string, boolean>, signature: string) => Promise<boolean>;
  downloadPdf: () => Promise<void>;
  signed: boolean;
  signingError: string | null;
  refetch: () => Promise<void>;
}

export function usePublicContract(token: string): UsePublicContractReturn {
  const [contract, setContract] = useState<PublicContractView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSigning, setIsSigning] = useState(false);
  const [signingError, setSigningError] = useState<string | null>(null);

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

  const signContract = async (signatureData: string): Promise<boolean> => {
    if (!contract) {
      setSigningError("No contract found");
      return false;
    }
    if (contract.signed_by_client) {
      setSigningError("Contract already signed");
      return false;
    }
    if (!signatureData || signatureData.trim() === "") {
      setSigningError("Please provide a valid signature");
      return false;
    }
    if (signatureData === "data:image/png;base64," || signatureData.length < 100) {
      setSigningError("Please draw your signature before submitting");
      return false;
    }

    setIsSigning(true);
    setSigningError(null);

    try {
      await contractsApi.publicSign(token, signatureData);
      setContract((prev) =>
        prev ? { ...prev, signed_by_client: true, status: "signed" as const } : null
      );
      return true;
    } catch (err: unknown) {
      const apiErr = err as {
        response?: {
          status?: number;
          data?: { detail?: string; errors?: Array<{ msg: string; loc: string[] }> };
        };
      };
      const status = apiErr.response?.status;
      const responseData = apiErr.response?.data;
      if (status === 422 && responseData?.errors) {
        const errorMessages = responseData.errors
          .map((e) => `${e.loc.join(".")}: ${e.msg}`)
          .join(", ");
        setSigningError(errorMessages);
      } else {
        const detail = responseData?.detail || "Failed to sign contract. Please try again.";
        setSigningError(detail);
      }
      return false;
    } finally {
      setIsSigning(false);
    }
  };

  const submitHandover = async (
    checklist: Record<string, boolean>,
    signature: string
  ): Promise<boolean> => {
    if (!contract) {
      toast.error("No contract found");
      return false;
    }
    if (contract.handover_signed_at) {
      toast.error("Handover already signed");
      return false;
    }
    if (!signature || signature.trim() === "" || signature.length < 100) {
      toast.error("Please draw your signature before submitting");
      return false;
    }

    setIsSigning(true);
    setSigningError(null);

    try {
      await contractsApi.publicSubmitHandover(token, { checklist, signature });
      setContract((prev) =>
        prev
          ? {
              ...prev,
              handover_checklist: checklist,
              handover_signed_at: new Date().toISOString(),
            }
          : null
      );
      toast.success("Handover checklist confirmed and signed!");
      return true;
    } catch (err: unknown) {
      const apiErr = err as {
        response?: {
          status?: number;
          data?: { detail?: string; errors?: Array<{ msg: string; loc: string[] }> };
        };
      };
      const status = apiErr.response?.status;
      const responseData = apiErr.response?.data;
      if (status === 422 && responseData?.errors) {
        const errorMessages = responseData.errors
          .map((e) => `${e.loc.join(".")}: ${e.msg}`)
          .join(", ");
        toast.error(errorMessages);
      } else {
        const detail = responseData?.detail || "Failed to submit handover. Please try again.";
        toast.error(detail);
      }
      return false;
    } finally {
      setIsSigning(false);
    }
  };

  const downloadPdf = async () => {
    if (!contract) {
      toast.error("No contract available to download");
      return;
    }
    try {
      const loadingToast = toast.loading("Generating PDF...");
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
      toast.dismiss(loadingToast);
      toast.success("PDF downloaded");
    } catch {
      toast.dismiss();
      toast.error("Failed to download PDF");
    }
  };

  useEffect(() => {
    if (token) fetchContract();
  }, [token, fetchContract]);

  return {
    contract,
    loading,
    error,
    isSigning,
    signContract,
    submitHandover,
    downloadPdf,
    signed: contract?.signed_by_client ?? false,
    signingError,
    refetch: fetchContract,
  };
}
