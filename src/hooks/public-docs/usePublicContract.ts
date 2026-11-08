// src/hooks/public-docs/usePublicContract.ts
import { useState, useEffect, useCallback } from 'react';
import { contractsApi } from '@/lib/api/contracts';
import type { PublicContractView } from '@/lib/types';
import toast from 'react-hot-toast';

export function usePublicContract(token: string) {
  const [contract, setContract] = useState<PublicContractView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSigning, setIsSigning] = useState(false);

  const fetchContract = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await contractsApi.getByToken(token);
      setContract(data);
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'This contract link is invalid or has expired.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const handleSign = async (signatureData: string) => {
    if (!contract || contract.signed_by_client) return;
    
    setIsSigning(true);
    try {
      const updatedContract = await contractsApi.signByToken(token, signatureData);
      setContract(updatedContract);
      toast.success('Contract signed successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to sign contract.');
    } finally {
      setIsSigning(false);
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
    handleSign, 
    refetch: fetchContract 
  };
}
