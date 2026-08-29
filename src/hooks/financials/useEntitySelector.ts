// src/hooks/financials/useEntitySelector.ts
"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
// ✅ FIXED: Removed unused toast import

interface UseEntitySelectorOptions<T> {
  fetcher: () => Promise<T[]>;
  // ✅ FIXED: Changed from (keyof T)[] to string[] to allow nested keys
  searchKeys: string[];
  initialData?: T[];
}

export function useEntitySelector<T>({ fetcher, searchKeys, initialData = [] }: UseEntitySelectorOptions<T>) {
  const [data, setData] = useState<T[]>(initialData);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // ✅ FIXED: Use a ref to store the latest fetcher (avoids infinite loop)
  const fetcherRef = useRef(fetcher);
  useEffect(() => {
    fetcherRef.current = fetcher;
  }, [fetcher]);

  // ✅ FIXED: Only run on mount (and when explicitly refetched), NOT on every render
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetcherRef.current();
      setData(result);
    } catch (error) {
      console.error("Failed to fetch entities:", error);
      // ✅ FIXED: Don't show toast on initial load failure (it's noise)
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []); // ✅ Empty dependency array = runs once on mount

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredData = useMemo(() => {
    if (!search.trim()) return data;
    const searchLower = search.toLowerCase();
    
    return data.filter((item) => {
      return searchKeys.some((key) => {
        // ✅ Handle nested keys (e.g., "client.full_name", "vehicle.plate_number")
        const value = key.split('.').reduce((obj: any, k: string) => {
          return obj && obj[k] !== undefined ? obj[k] : undefined;
        }, item);
        
        // ✅ Fallback to flat fields (e.g., client_name, vehicle_plate)
        const flatValue = (item as any)[key];
        const finalValue = value !== undefined ? value : flatValue;
        
        if (finalValue === null || finalValue === undefined) return false;
        return String(finalValue).toLowerCase().includes(searchLower);
      });
    });
  }, [data, search, searchKeys]);

  // ✅ Helper to find selected entity by ID
  const getById = useCallback((id: number | null): T | undefined => {
    if (!id) return undefined;
    return data.find((item: any) => item.id === id);
  }, [data]);

  return {
    data,
    loading,
    search,
    setSearch,
    filteredData,
    refetch: fetchData,
    getById,
  };
}
