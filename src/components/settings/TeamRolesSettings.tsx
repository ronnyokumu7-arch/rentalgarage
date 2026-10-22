// src/components/settings/TeamRolesSettings.tsx
"use client";

import { useEffect, useState } from "react";
import { confirmAction } from "@/lib/utils/confirmAction";
import {
  ShieldCheck, Loader2, Save, CheckCircle2, Plus, Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";
import { roleTemplatesApi, type RoleTemplate, type PermissionMatrix } from "@/lib/api/role-templates";

export default function TeamRolesSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [matrix, setMatrix] = useState<PermissionMatrix>({});
  const [templates, setTemplates] = useState<RoleTemplate[]>([]);
  
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [activePermissions, setActivePermissions] = useState<Set<string>>(new Set());
  const [hasChanges, setHasChanges] = useState(false);

  // 1. Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [matrixData, templatesData] = await Promise.all([
          roleTemplatesApi.getMatrix(),
          roleTemplatesApi.list(),
        ]);
        setMatrix(matrixData);
        setTemplates(templatesData || []);

        if (templatesData && templatesData.length > 0) {
          setSelectedRoleId(templatesData[0].id);
          setActivePermissions(new Set(templatesData[0].permissions));
        }
      } catch {
        toast.error("Failed to load role settings");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // 2. Handle Role Selection
  const handleSelectRole = (roleId: number) => {
    if (hasChanges) {
      if (!confirmAction("You have unsaved permission changes. Switch roles anyway?")) return;
    }
    setSelectedRoleId(roleId);
    const template = templates.find((t) => t.id === roleId);
    setActivePermissions(new Set(template?.permissions || []));
    setHasChanges(false);
  };

  // 3. Handle Permission Toggles
  const togglePermission = (key: string) => {
    setActivePermissions((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
    setHasChanges(true);
  };

  const toggleCategory = (category: string) => {
    const categoryPerms = matrix[category]?.map(p => p.key) || [];
    const allSelected = categoryPerms.every(k => activePermissions.has(k));
    
    setActivePermissions((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        categoryPerms.forEach(k => next.delete(k));
      } else {
        categoryPerms.forEach(k => next.add(k));
      }
      return next;
    });
    setHasChanges(true);
  };

  // 4. Save Changes
  const handleSave = async () => {
    if (!selectedRoleId) return;
    setSaving(true);
    try {
      await roleTemplatesApi.update(selectedRoleId, { permissions: Array.from(activePermissions) });
      setTemplates((prev) =>
        prev.map((t) => (t.id === selectedRoleId ? { ...t, permissions: Array.from(activePermissions) } : t))
      );
      setHasChanges(false);
      toast.success("Role permissions updated successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to save permissions");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
      </div>
    );
  }

  const currentRoleName = templates.find(t => t.id === selectedRoleId)?.job_title;

  return (
    <div className="flex flex-col lg:flex-row gap-6 animate-in fade-in duration-300">
      
      {/* LEFT PANEL: Role Selector */}
      {/* ✅ On mobile: horizontal pills. On desktop: sidebar list */}
      <div className="w-full lg:w-72 flex-shrink-0">
        <div className="bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-2xl shadow-[var(--shadow-card)] overflow-hidden lg:sticky lg:top-6">
          
          <div className="px-4 py-3 lg:px-5 lg:py-4 border-b border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/50 flex items-center justify-between">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)] flex items-center gap-2">
              <Sparkles size={12} className="text-[var(--color-primary)]" /> Team Roles
            </h3>
            <span className="text-[10px] font-bold text-[var(--color-ink-muted)] lg:hidden bg-[var(--color-surface)] px-2 py-0.5 rounded-full">
              {templates.length}
            </span>
          </div>

          {/* Mobile: Horizontal swipeable pill row */}
          <div className="lg:hidden overflow-x-auto scrollbar-none p-3 flex gap-2">
            {templates.map((template) => {
              const isActive = selectedRoleId === template.id;
              return (
                <button
                  key={template.id}
                  onClick={() => handleSelectRole(template.id)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold transition-all active:scale-95 ${
                    isActive
                      ? "bg-[var(--color-primary)] text-white shadow-md"
                      : "bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] border border-transparent hover:border-[var(--color-surface-border)]"
                  }`}
                >
                  <ShieldCheck size={14} className={isActive ? "text-white" : "text-[var(--color-ink-subtle)]"} />
                  {template.job_title}
                </button>
              );
            })}
          </div>

          {/* Desktop: Vertical list */}
          <div className="hidden lg:block p-2 max-h-[60vh] overflow-y-auto custom-scrollbar">
            {templates.length === 0 ? (
              <div className="p-4 text-center text-sm text-[var(--color-ink-muted)]">No roles created yet.</div>
            ) : (
              <ul className="space-y-1">
                {templates.map((template) => {
                  const isActive = selectedRoleId === template.id;
                  return (
                    <li key={template.id}>
                      <button
                        onClick={() => handleSelectRole(template.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                          isActive
                            ? "bg-[var(--color-primary)]/10 text-[var(--color-primary-text)] border border-[var(--color-primary)]/20"
                            : "text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)] border border-transparent"
                        }`}
                      >
                        <ShieldCheck size={16} className={isActive ? "text-[var(--color-primary)]" : "text-[var(--color-ink-muted)]"} />
                        <span className="text-sm font-medium truncate">{template.job_title}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="p-3 border-t border-[var(--color-surface-border)]">
            <button className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-[var(--color-primary)] bg-[var(--color-primary)]/5 hover:bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 transition-all active:scale-95">
              <Plus size={14} /> Add New Role
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: Permission Matrix */}
      <div className="flex-1 min-w-0 space-y-6">
        {selectedRoleId ? (
          <>
            {/* Header Action Bar */}
            <div className="bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-2xl shadow-[var(--shadow-card)] p-4 lg:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="min-w-0">
                <h3 className="text-base lg:text-lg font-bold text-[var(--color-ink)] truncate">
                  Permissions for {currentRoleName}
                </h3>
                <p className="text-xs lg:text-sm text-[var(--color-ink-muted)] mt-1 line-clamp-2">
                  Control exactly what this role can view, create, edit, and delete across the platform.
                </p>
              </div>
              <button
                onClick={handleSave}
                disabled={!hasChanges || saving}
                className="flex-shrink-0 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs lg:text-sm font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 shadow-[var(--shadow-md)]"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : hasChanges ? <Save className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                {saving ? "Saving..." : hasChanges ? "Save Changes" : "All Saved"}
              </button>
            </div>

            {/* Category Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(matrix).map(([category, permissions]) => {
                const categoryKeys = permissions.map(p => p.key);
                const selectedCount = categoryKeys.filter(k => activePermissions.has(k)).length;
                const allSelected = selectedCount === categoryKeys.length;
                const someSelected = selectedCount > 0 && !allSelected;

                return (
                  <div key={category} className="bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-2xl p-4 lg:p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--color-surface-border)]/50">
                      <h4 className="text-sm font-bold text-[var(--color-ink)]">{category}</h4>
                      <button 
                        onClick={() => toggleCategory(category)}
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md transition-colors ${
                          allSelected 
                            ? "bg-[var(--color-success-bg)] text-[var(--color-success-text)]" 
                            : "bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
                        }`}
                      >
                        {allSelected ? "All Granted" : someSelected ? `${selectedCount}/${categoryKeys.length}` : "None"}
                      </button>
                    </div>
                    <div className="space-y-3">
                      {permissions.map((perm) => {
                        const isOn = activePermissions.has(perm.key);
                        return (
                          <label 
                            key={perm.key} 
                            className="flex items-center justify-between gap-3 cursor-pointer group py-1"
                          >
                            <span className={`text-sm transition-colors ${isOn ? "text-[var(--color-ink)] font-medium" : "text-[var(--color-ink-muted)]"}`}>
                              {perm.label}
                            </span>
                            {/* ✅ Premium Switch */}
                            <div
                              className={`relative inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full transition-colors duration-200 focus-within:ring-2 focus-within:ring-[var(--color-primary)]/20 ${
                                isOn ? "bg-[var(--color-primary)]" : "bg-[var(--color-surface-border)]"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isOn}
                                onChange={() => togglePermission(perm.key)}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                              />
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
                                  isOn ? "translate-x-4.5" : "translate-x-0.5"
                                }`}
                              />
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-2xl shadow-[var(--shadow-card)] p-12 text-center">
            <ShieldCheck className="w-12 h-12 text-[var(--color-ink-subtle)] mx-auto mb-4" />
            <h3 className="text-lg font-bold text-[var(--color-ink)] mb-2">No Role Selected</h3>
            <p className="text-sm text-[var(--color-ink-muted)]">Select a role to edit its permissions.</p>
          </div>
        )}
      </div>
    </div>
  );
}
