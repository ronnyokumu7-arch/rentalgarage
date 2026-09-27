import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import apiClient from "@/lib/api-client";
import type { User } from "@/lib/types";

export function useInvestorsList() {
  const [investors, setInvestors] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInvestors = useCallback(async () => {
    setLoading(true);
    try {
      // This calls the backend endpoint we just fixed: GET /api/v1/investors/
      const res = await apiClient.get<User[]>("/investors/");
      setInvestors(res.data);
    } catch (error) {
      console.error("Failed to fetch investors:", error);
      toast.error("Failed to load investors list");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvestors();
  }, [fetchInvestors]);

  return {
    investors,
    loading,
    refetch: fetchInvestors,
  };
}
