// src/hooks/settings/useTenantPolicies.ts
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  policiesApi,
  PolicyCategory,
  PolicyClauseDTO,
  CategoryLabel,
  TenantPolicyRow,
} from "@/lib/api/policies";

export interface ClauseViewState {
  category: PolicyCategory;
  clauseKey: string | null;
  defaultTitle: string;
  defaultContent: string;
  displayOrder: number;
  /** The tenant's override row (active or inactive), if any. */
  override: TenantPolicyRow | null;
  /** True when an ACTIVE override exists → contracts use the custom text. */
  isCustom: boolean;
  /** The effective title/content (custom if active, else default). */
  effectiveTitle: string;
  effectiveContent: string;
}

export function useTenantPolicies() {
  const [categories, setCategories] = useState<CategoryLabel[]>([]);
  const [defaults, setDefaults] = useState<Record<PolicyCategory, PolicyClauseDTO[]>>({
    agency_policies: [],
    statutory_declaration: [],
    general_conditions: [],
  });
  const [tenantRows, setTenantRows] = useState<TenantPolicyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const [defsResp, rows] = await Promise.all([
        policiesApi.getDefaults(),
        policiesApi.list(),
      ]);
      setCategories(defsResp.categories);
      setDefaults(defsResp.document);
      setTenantRows(rows);
    } catch {
      toast.error("Failed to load business policies.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  /** Build view state for a category: defaults merged with tenant overrides. */
  const buildCategoryClauses = useCallback(
    (category: PolicyCategory): ClauseViewState[] => {
      const defs = defaults[category] || [];
      const overrides = tenantRows.filter(
        (r) => r.category === category && r.clause_key !== null
      );
      const customs = tenantRows
        .filter((r) => r.category === category && r.clause_key === null)
        .sort((a, b) => a.display_order - b.display_order);

      const result: ClauseViewState[] = defs.map((d) => {
        const override = overrides.find((o) => o.clause_key === d.clause_key) ?? null;
        const isCustom = !!override && override.is_active;
        return {
          category,
          clauseKey: d.clause_key,
          defaultTitle: d.title,
          defaultContent: d.content,
          displayOrder: d.display_order,
          override,
          isCustom,
          effectiveTitle: isCustom ? override!.title : d.title,
          effectiveContent: isCustom ? override!.content : d.content,
        };
      });

      // Append custom clauses (clause_key === null)
      for (const r of customs) {
        result.push({
          category,
          clauseKey: null,
          defaultTitle: "",
          defaultContent: "",
          displayOrder: r.display_order,
          override: r,
          isCustom: r.is_active,
          effectiveTitle: r.title,
          effectiveContent: r.content,
        });
      }

      return result;
    },
    [defaults, tenantRows]
  );

  /** All 3 categories with merged clauses. */
  const categoryClauses = useMemo(() => {
    const result: Record<PolicyCategory, ClauseViewState[]> = {
      agency_policies: [],
      statutory_declaration: [],
      general_conditions: [],
    };
    for (const cat of categories) {
      result[cat.value] = buildCategoryClauses(cat.value);
    }
    return result;
  }, [categories, buildCategoryClauses]);

  // ── STANDARD CLAUSE MUTATIONS ───────────────────────────────────────────
  const saveOverride = async (
    category: PolicyCategory,
    clauseKey: string,
    title: string,
    content: string,
    existingId?: number | null
  ): Promise<boolean> => {
    setSaving(true);
    try {
      if (existingId) {
        await policiesApi.update(existingId, { title, content, is_active: true });
      } else {
        await policiesApi.create({ category, clause_key: clauseKey, title, content });
      }
      toast.success("Clause saved — new contracts will use your version.");
      await load();
      return true;
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Failed to save clause.");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const resetToDefault = async (policyId: number) => {
    setSaving(true);
    try {
      await policiesApi.remove(policyId);
      toast.success("Clause reset to platform default.");
      await load();
    } catch {
      toast.error("Failed to reset clause.");
    } finally {
      setSaving(false);
    }
  };

  const toggleOverride = async (policyId: number) => {
    setSaving(true);
    try {
      await policiesApi.toggle(policyId);
      await load();
    } catch {
      toast.error("Failed to toggle clause.");
    } finally {
      setSaving(false);
    }
  };

  // ── CUSTOM CLAUSE (clause_key === null) MUTATIONS ───────────────────────
  const addCustomClause = async (
    category: PolicyCategory,
    title: string,
    content: string
  ): Promise<boolean> => {
    setSaving(true);
    try {
      await policiesApi.create({
        category,
        clause_key: null,
        title,
        content,
        display_order: 999,
      });
      toast.success("Custom clause added.");
      await load();
      return true;
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Failed to add clause.");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const updateCustomClause = async (id: number, title: string, content: string) => {
    setSaving(true);
    try {
      await policiesApi.update(id, { title, content });
      toast.success("Clause updated.");
      await load();
    } catch {
      toast.error("Failed to update clause.");
    } finally {
      setSaving(false);
    }
  };

  const deleteCustomClause = async (id: number) => {
    setSaving(true);
    try {
      await policiesApi.remove(id);
      toast.success("Clause removed.");
      await load();
    } catch {
      toast.error("Failed to delete clause.");
    } finally {
      setSaving(false);
    }
  };

  return {
    categories,
    categoryClauses,
    loading,
    saving,
    saveOverride,
    resetToDefault,
    toggleOverride,
    addCustomClause,
    updateCustomClause,
    deleteCustomClause,
    reload: load,
  };
}
