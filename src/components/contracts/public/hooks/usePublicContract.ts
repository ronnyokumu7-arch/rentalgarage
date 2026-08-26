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
  downloadPdf: () => Promise<void>;
  signed: boolean;
  signingError: string | null;
  isDownloadingPdf: boolean;
  refetch: () => Promise<void>;
}

export function usePublicContract(token: string): UsePublicContractReturn {
  const [contract, setContract] = useState<PublicContractView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSigning, setIsSigning] = useState(false);
  const [signingError, setSigningError] = useState<string | null>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

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
    // Validate contract state
    if (!contract) {
      setSigningError("No contract found");
      toast.error("No contract found");
      return false;
    }
    
    if (contract.signed_by_client) {
      setSigningError("Contract already signed");
      toast.error("This contract has already been signed");
      return false;
    }
    
    // Validate signature data
    if (!signatureData || signatureData.trim() === "") {
      setSigningError("Please provide a valid signature");
      toast.error("Signature is required");
      return false;
    }
    
    // Check if signature is empty canvas (common issue with signature pads)
    if (signatureData === "data:image/png;base64," || signatureData.length < 100) {
      setSigningError("Please draw your signature before submitting");
      toast.error("Signature cannot be empty");
      return false;
    }
    
    setIsSigning(true);
    setSigningError(null);
    
    try {
      await contractsApi.publicSign(token, signatureData);
      
      // Update local state
      setContract(prev => prev ? { 
        ...prev, 
        signed_by_client: true,
        status: "signed" as const
      } : null);
      
      toast.success("Contract signed successfully!");
      return true;
    } catch (err: unknown) {
      const apiErr = err as { 
        response?: { 
          status?: number; 
          data?: { 
            detail?: string; 
            errors?: Array<{ msg: string; loc: string[] }>;
          } 
        } 
      };
      
      const status = apiErr.response?.status;
      const responseData = apiErr.response?.data;
      
      // Handle validation errors (422)
      if (status === 422) {
        if (responseData?.errors) {
          const errorMessages = responseData.errors
            .map(err => `${err.loc.join('.')}: ${err.msg}`)
            .join(', ');
          setSigningError(errorMessages);
          toast.error(errorMessages);
        } else {
          const detail = responseData?.detail || "Validation error. Please check your input.";
          setSigningError(detail);
          toast.error(detail);
        }
      } else {
        const detail = responseData?.detail || "Failed to sign contract. Please try again.";
        setSigningError(detail);
        toast.error(detail);
      }
      
      return false;
    } finally {
      setIsSigning(false);
    }
  };

  const downloadPdf = async () => {
    if (!contract || isDownloadingPdf) return;
    
    setIsDownloadingPdf(true);
    
    try {
      const res = await contractsApi.publicDownloadPdf(token);
      const blob = res.data instanceof Blob ? res.data : new Blob([res.data]);
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `contract-${contract.contract_number || "document"}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 100);
      
      toast.success("PDF downloaded successfully");
    } catch (error) {
      console.error("PDF download error:", error);
      toast.error("Failed to download PDF. Please try again.");
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchContract();
    }
  }, [token, fetchContract]);

  return {
    contract,
    loading,
    error,
    isSigning,
    signContract,
    downloadPdf,
    signed: contract?.signed_by_client ?? false,
    signingError,
    isDownloadingPdf,
    refetch: fetchContract
  };
}
