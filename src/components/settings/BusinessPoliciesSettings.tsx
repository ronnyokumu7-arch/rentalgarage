// src/components/settings/BusinessPoliciesSettings.tsx
"use client";

import { useState } from "react";
import {
  ChevronDown, Save, RotateCcw, Power, Plus, Trash2, Loader2,
  ScrollText, Scale, BookOpen, Sparkles, X,
} from "lucide-react";
import { useTenantPolicies } from "@/hooks/settings/useTenantPolicies";
import { PolicyCategory } from "@/lib/api/policies";
import { MarkdownLitePreview } from "@/lib/markdownLite";
import ClauseBlockEditor from "@/components/settings/ClauseBlockEditor";

const CATEGORY_TABS = [
  { id: "agency_policies", label: "Agency Policies", icon: ScrollText },
  { id: "statutory_declaration", label: "Statutory Declaration", icon: Scale },
  { id: "general_conditions", label: "General Conditions", icon: BookOpen },
];

/** Strips markdown markers from a raw clause string for use as a plain preview snippet. */
function toPlainPreview(raw: string): string {
  if (!raw) return "";
  return raw
    // Strip leading list markers: "1. ", "2) ", "- ", "* ", "• "
    .replace(/^\s*\d+[.)]\s+/gm, "")
    .replace(/^\s*[-*•]\s+/gm, "")
    // Strip bold/italic markers
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/_([^_]+)_/g, "$1")
    // Collapse newlines into spaces for a single-line preview
    .replace(/\s*\n\s*/g, " ")
    .trim();
}

export default function BusinessPoliciesSettings() {
  const s = useTenantPolicies();
  const [activeCategory, setActiveCategory] = useState<PolicyCategory>("agency_policies");
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  if (s.loading) {
    return (
      <div className="flex items-center justify-center py-24">
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
    <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-300">
      {/* Category switcher */}
      <div className="overflow-x-auto scrollbar-none -mx-1 px-1">
        <div className="flex items-center gap-1.5 min-w-max p-1 bg-[var(--color-surface-hover)]/60 rounded-xl border border-[var(--color-surface-border)]">
          {CATEGORY_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeCategory === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveCategory(tab.id as PolicyCategory);
                  setExpandedKey(null);
                  setAdding(false);
                }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap active:scale-95 ${
                  isActive
                    ? "bg-[var(--color-surface)] text-[var(--color-ink)] shadow-sm"
                    : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
                }`}
              >
                <Icon size={13} strokeWidth={isActive ? 2.5 : 2} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Guidance banner */}
      <div className="flex gap-3 p-3.5 rounded-xl bg-[var(--color-primary)]/[0.04] border border-[var(--color-primary)]/15">
        <Sparkles size={14} className="text-[var(--color-primary)] shrink-0 mt-0.5" />
        <p className="text-[11px] text-[var(--color-ink-muted)] leading-relaxed">
          Clauses you don't customize inherit the platform default. Saved changes apply to contracts generated afterwards.
        </p>
      </div>

      {/* Clause list container */}
      <div className="rounded-2xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] shadow-[var(--shadow-card)] overflow-hidden">
        {clauses.length === 0 && !adding ? (
          <div className="flex flex-col items-center justify-center py-12 text-center px-6">
            <div className="w-12 h-12 rounded-2xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center mb-3">
              <ScrollText size={20} />
            </div>
            <p className="text-sm font-bold text-[var(--color-ink)] mb-1">No clauses yet</p>
            <p className="text-xs text-[var(--color-ink-muted)] mb-4 max-w-xs">
              Add your first clause to customize what appears on contracts.
            </p>
            <button
              onClick={() => setAdding(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] transition-all active:scale-95 shadow-sm"
            >
              <Plus size={13} /> Add custom clause
            </button>
          </div>
        ) : (
          <>
            {clauses.map((clause, idx) => {
              const key = clause.clauseKey ?? `custom-${clause.override?.id}`;
              const open = expandedKey === key;
              const isStandard = clause.clauseKey !== null;

              return (
                <div
                  key={`${key}-${clause.override?.updated_at ?? ""}`}
                  className={`border-b border-[var(--color-surface-border)]/60 last:border-b-0 transition-colors ${
                    open ? "bg-[var(--color-surface-hover)]/20" : ""
                  }`}
                >
                  {/* Row header */}
                  <button
                    onClick={() => toggleExpand(key)}
                    className="w-full flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3.5 text-left hover:bg-[var(--color-surface-hover)]/40 transition-colors"
                  >
                    {activeCategory === "general_conditions" && (
                      <span className="w-10 sm:w-12 shrink-0 text-[9px] sm:text-[10px] font-mono font-bold uppercase text-[var(--color-ink-subtle)]">
                        Art. {idx + 1}
                      </span>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-semibold text-[var(--color-ink)] truncate">
                          {clause.effectiveTitle}
                        </h4>
                        {clause.override && !clause.override.is_active && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400">
                            Disabled
                          </span>
                        )}
                        {clause.isCustom && clause.override?.is_active && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                            Custom
                          </span>
                        )}
                      </div>
                      {/* ✅ Plain-text preview — no markdown markers */}
                      <p className="text-xs text-[var(--color-ink-muted)] mt-0.5 truncate">
                        {toPlainPreview(clause.effectiveContent)}
                      </p>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 shrink-0 text-[var(--color-ink-subtle)] transition-transform duration-200 ${
                        open ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Expanded editor */}
                  {open && (
                    <ClauseEditorPanel
                      initialTitle={clause.override?.title ?? clause.defaultTitle}
                      initialContent={clause.override?.content ?? clause.defaultContent}
                      defaultContent={isStandard ? clause.defaultContent : null}
                      overrideActive={clause.override?.is_active ?? false}
                      saving={s.saving}
                      onSave={(t, c) =>
                        isStandard
                          ? s.saveOverride(
                              activeCategory,
                              clause.clauseKey!,
                              t,
                              c,
                              clause.override?.id ?? null
                            )
                          : s.updateCustomClause(clause.override!.id, t, c)
                      }
                      onToggle={
                        clause.override
                          ? () => s.toggleOverride(clause.override!.id)
                          : undefined
                      }
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
                className="w-full flex items-center justify-center gap-1.5 px-5 py-3 text-xs font-bold text-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 transition-colors"
              >
                <Plus size={13} /> Add custom clause
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* ─── Editor panel ────────────────────────────────────────────────── */

function ClauseEditorPanel({
  initialTitle,
  initialContent,
  defaultContent,
  overrideActive,
  saving,
  createMode = false,
  onSave,
  onReset,
  onToggle,
  onDelete,
  onClose,
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
    <div className="px-4 sm:px-5 pb-5 pt-2 bg-[var(--color-surface-hover)]/30">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5">
        {/* Editor column */}
        <div className="space-y-3">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-subtle)] mb-1.5">
              Clause Title
            </label>
            <input
              className="w-full h-11 px-3 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-sm text-[var(--color-ink)] placeholder-[var(--color-ink-subtle)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Fuel Policy"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-subtle)] mb-1.5">
              Clause Content
            </label>
            <div className="rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] p-2 overflow-hidden">
              <ClauseBlockEditor value={content} onChange={setContent} />
            </div>
          </div>

          {defaultContent && (
            <div>
              <button
                onClick={() => setShowDefault((v) => !v)}
                className="flex items-center gap-1 text-[11px] font-semibold text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors"
              >
                <ChevronDown
                  className={`w-3 h-3 transition-transform duration-200 ${
                    showDefault ? "rotate-180" : ""
                  }`}
                />
                {showDefault ? "Hide" : "View"} platform default
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
          <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-subtle)] mb-1.5">
            Contract Preview
          </label>
          <div className="rounded-xl border border-[var(--color-surface-border)] bg-white p-4 min-h-[160px] lg:min-h-[200px] shadow-sm">
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
      <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-[var(--color-surface-border)]/60">
        <button
          disabled={!dirty || saving || !title.trim()}
          onClick={() => onSave(title, content)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 shadow-sm shadow-[var(--color-primary)]/20"
        >
          {saving ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Save className="w-3.5 h-3.5" />
          )}
          {createMode ? "Add clause" : "Save changes"}
        </button>

        {onToggle && (
          <button
            onClick={onToggle}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-[var(--color-ink)] bg-[var(--color-surface)] border border-[var(--color-surface-border)] hover:bg-[var(--color-surface-hover)] transition-all active:scale-95"
          >
            <Power className="w-3.5 h-3.5" />
            {overrideActive ? "Disable custom" : "Enable custom"}
          </button>
        )}

        {onReset && (
          <button
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-[var(--color-ink)] bg-[var(--color-surface)] border border-[var(--color-surface-border)] hover:bg-[var(--color-surface-hover)] transition-all active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
        )}

        {onDelete && (
          <button
            onClick={onDelete}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-500 bg-rose-500/5 border border-rose-500/20 hover:bg-rose-500/10 transition-all active:scale-95"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </button>
        )}

        <button
          onClick={onClose}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface)] transition-all ml-auto"
        >
          <X className="w-3.5 h-3.5" /> Close
        </button>
      </div>
    </div>
  );
}
