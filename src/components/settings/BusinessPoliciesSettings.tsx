// src/components/settings/BusinessPoliciesSettings.tsx
"use client";

import { useState } from "react";
import {
  ChevronDown, Save, RotateCcw, Power, Plus, Trash2, Loader2,
  ScrollText, Scale, BookOpen, Sparkles,
} from "lucide-react";
import { useTenantPolicies } from "@/hooks/settings/useTenantPolicies";
import { PolicyCategory } from "@/lib/api/policies";
import { MarkdownLitePreview } from "@/lib/markdownLite";
import ClauseBlockEditor from "@/components/settings/ClauseBlockEditor";
import PremiumTabSwitcher from "@/components/ui/PremiumTabSwitcher";

const CATEGORY_TABS = [
  { id: "agency_policies", label: "Agency Policies", icon: ScrollText },
  { id: "statutory_declaration", label: "Statutory Declaration", icon: Scale },
  { id: "general_conditions", label: "General Conditions", icon: BookOpen },
];

export default function BusinessPoliciesSettings() {
  const s = useTenantPolicies();
  const [activeCategory, setActiveCategory] = useState<PolicyCategory>("agency_policies");
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  if (s.loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
      </div>
    );
  }

  const clauses = s.categoryClauses[activeCategory] || [];

  const toggleExpand = (key: string) => {
    setAdding(false);
    setExpandedKey((k) => (k === key ? null : key));
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* ✅ Premium Tab Switcher */}
      <PremiumTabSwitcher
        tabs={CATEGORY_TABS}
        activeTab={activeCategory}
        onTabChange={(tabId) => {
          setActiveCategory(tabId as PolicyCategory);
          setExpandedKey(null);
          setAdding(false);
        }}
      />

      {/* Guidance banner */}
      <div className="flex gap-3 p-3.5 rounded-xl bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/20">
        <Sparkles size={14} className="text-[var(--color-primary)] shrink-0 mt-0.5" />
        <p className="text-[11px] text-[var(--color-ink-muted)] leading-relaxed">
          Clauses you don't customize inherit the platform default. Saved changes apply to contracts generated afterwards.
        </p>
      </div>

      {/* Clauses container */}
      <div className="rounded-2xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] shadow-[var(--shadow-card)] divide-y divide-[var(--color-surface-border)] overflow-hidden">
        {clauses.map((clause, idx) => {
          const key = clause.clauseKey ?? `custom-${clause.override?.id}`;
          const open = expandedKey === key;
          const isStandard = clause.clauseKey !== null;

          return (
            <div key={`${key}-${clause.override?.updated_at ?? ""}`}>
              {/* Row header */}
              <button
                onClick={() => toggleExpand(key)}
                className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-[var(--color-surface-hover)]/40 transition-colors"
              >
                {activeCategory === "general_conditions" && (
                  <span className="w-12 shrink-0 text-[10px] font-mono font-bold uppercase text-[var(--color-ink-subtle)]">
                    Art. {idx + 1}
                  </span>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-[var(--color-ink)] truncate">
                      {clause.effectiveTitle}
                    </h4>
                    {clause.override && !clause.override.is_active && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--color-warning-bg)] text-[var(--color-warning-text)]">
                        Disabled
                      </span>
                    )}
                    {clause.isCustom && clause.override?.is_active && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--color-primary-muted)] text-[var(--color-primary-text)]">
                        Custom
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[var(--color-ink-muted)] mt-0.5 truncate">
                    {clause.effectiveContent}
                  </p>
                </div>
                <ChevronDown
                  className={`w-4 h-4 shrink-0 text-[var(--color-ink-subtle)] transition-transform ${open ? "rotate-180" : ""}`}
                />
              </button>

              {/* Expanded editor + live contract preview */}
              {open && (
                <ClauseEditorPanel
                  initialTitle={clause.override?.title ?? clause.defaultTitle}
                  initialContent={clause.override?.content ?? clause.defaultContent}
                  defaultContent={isStandard ? clause.defaultContent : null}
                  overrideActive={clause.override?.is_active ?? false}
                  saving={s.saving}
                  onSave={(t, c) =>
                    isStandard
                      ? s.saveOverride(activeCategory, clause.clauseKey!, t, c, clause.override?.id ?? null)
                      : s.updateCustomClause(clause.override!.id, t, c)
                  }
                  onToggle={clause.override ? () => s.toggleOverride(clause.override!.id) : undefined}
                  onReset={
                    isStandard && clause.override
                      ? () => {
                          s.resetToDefault(clause.override!.id);
                          setExpandedKey(null);
                        }
                      : undefined
                  }
                  onDelete={
                    !isStandard && clause.override
                      ? () => {
                          s.deleteCustomClause(clause.override!.id);
                          setExpandedKey(null);
                        }
                      : undefined
                  }
                  onClose={() => setExpandedKey(null)}
                />
              )}
            </div>
          );
        })}

        {/* Add custom clause */}
        {adding ? (
          <ClauseEditorPanel
            initialTitle=""
            initialContent=""
            defaultContent={null}
            overrideActive={false}
            saving={s.saving}
            createMode
            onSave={async (t, c) => {
              const ok = await s.addCustomClause(activeCategory, t, c);
              if (ok) setAdding(false);
              return ok;
            }}
            onClose={() => setAdding(false)}
          />
        ) : (
          <button
            onClick={() => {
              setExpandedKey(null);
              setAdding(true);
            }}
            className="w-full flex items-center gap-2 px-5 py-3.5 text-xs font-semibold text-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add custom clause
          </button>
        )}
      </div>
    </div>
  );
}

// ── Editor panel: block editor + live contract preview + actions ────────────
function ClauseEditorPanel({
  initialTitle, initialContent, defaultContent, overrideActive,
  saving, createMode = false, onSave, onReset, onToggle, onDelete, onClose,
}: {
  initialTitle: string;
  initialContent: string;
  defaultContent: string | null;
  overrideActive: boolean;
  saving: boolean;
  createMode?: boolean;
  onSave: (t: string, c: string) => Promise<boolean> | Promise<void> | void;
  onReset?: () => void;
  onToggle?: () => void;
  onDelete?: () => void;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [showDefault, setShowDefault] = useState(false);
  const dirty = title !== initialTitle || content !== initialContent;

  return (
    <div className="px-5 pb-5 pt-1 bg-[var(--color-surface-hover)]/20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pt-3">
        {/* Editor column */}
        <div className="space-y-3">
          <div>
            <span className="label">Clause title</span>
            <input
              className="input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Fuel Policy"
            />
          </div>
          <div>
            <span className="label">Clause content</span>
            <div className="rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] p-2">
              <ClauseBlockEditor value={content} onChange={setContent} />
            </div>
          </div>
          {defaultContent && (
            <div>
              <button
                onClick={() => setShowDefault((v) => !v)}
                className="flex items-center gap-1 text-[11px] font-semibold text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
              >
                <ChevronDown className={`w-3 h-3 transition-transform ${showDefault ? "rotate-180" : ""}`} />
                {showDefault ? "Hide platform default" : "View platform default"}
              </button>
              {showDefault && (
                <div className="mt-2 p-3 rounded-lg bg-[var(--color-surface-hover)]/50 border border-[var(--color-surface-border)] text-xs text-[var(--color-ink-muted)] leading-relaxed whitespace-pre-line">
                  {defaultContent}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Live contract preview column */}
        <div>
          <span className="label">Contract preview</span>
          <div className="rounded-xl border border-[var(--color-surface-border)] bg-white p-4 min-h-[160px]">
            {title.trim() && (
              <p className="text-[9pt] font-bold uppercase tracking-[0.02em] text-[#0f172a] mb-1.5">
                {title}
              </p>
            )}
            <MarkdownLitePreview raw={content} variant="contract" />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-wrap mt-4">
        <button
          disabled={!dirty || saving || !title.trim()}
          onClick={() => onSave(title, content)}
          className="btn btn-primary text-xs"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {createMode ? "Add clause" : "Save changes"}
        </button>
        {onToggle && (
          <button onClick={onToggle} className="btn btn-secondary text-xs">
            <Power className="w-4 h-4" />
            {overrideActive ? "Disable (use default)" : "Enable custom"}
          </button>
        )}
        {onReset && (
          <button onClick={onReset} className="btn btn-secondary text-xs">
            <RotateCcw className="w-4 h-4" /> Reset to default
          </button>
        )}
        {onDelete && (
          <button
            onClick={onDelete}
            className="btn btn-secondary text-xs text-[var(--color-danger-text)] hover:bg-[var(--color-danger-bg)]"
          >
            <Trash2 className="w-4 h-4" /> Delete
          </button>
        )}
        <button onClick={onClose} className="btn btn-secondary text-xs ml-auto">
          Close
        </button>
      </div>
    </div>
  );
}
