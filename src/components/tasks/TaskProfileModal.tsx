"use client";

import { useState, useRef, useEffect } from "react";
import { 
  X, FloppyDisk as Save, User, Car, Calendar,
  CaretDown as ChevronDown, CircleNotch as Loader2, Tag, Clock, CalendarDots as CalendarDays, UserPlus, Check, Buildings as Building2, Link
} from "@phosphor-icons/react/ssr";
import { useTaskForm } from "@/hooks/tasks/useTaskForm";
import type { Task } from "@/lib/types";

interface TaskProfileModalProps {
  open: boolean;
  onClose: () => void;
  editingTask?: Task | null;
  onSaveSuccess: () => void;
}

// ✅ STRICTLY LIMITED to the 3 requested categories
const CATEGORIES: { id: string; label: string; icon: any }[] = [
  { id: "fleet", label: "Fleet", icon: Car },
  { id: "clients", label: "Clients", icon: User },
  { id: "bookings", label: "Bookings", icon: Calendar },
];

const PRIORITIES: { id: Task["priority"]; color: string }[] = [
  { id: "low", color: "text-slate-500 bg-slate-500/10 border-slate-500/20" },
  { id: "medium", color: "text-blue-500 bg-blue-500/10 border-blue-500/20" },
  { id: "high", color: "text-amber-500 bg-amber-500/10 border-amber-500/20" },
  { id: "urgent", color: "text-rose-500 bg-rose-500/10 border-rose-500/20" },
];

// ✅ ANTI-GOD PATTERN: Extracted sub-component to keep the main modal clean
function RelationChips({ department, category, relationOption }: { department: string; category: any; relationOption: any }) {
  if (!department && !category && !relationOption) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-3 animate-in fade-in slide-in-from-top-2 duration-200">
      {department && (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/20 text-[var(--color-primary)]">
          <Building2 size={10} aria-hidden="true" />
          <span className="capitalize">{department}</span>
        </div>
      )}
      {category && (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/20 text-[var(--color-primary)]">
          <category.icon size={10} aria-hidden="true" />
          <span>{category.label}</span>
        </div>
      )}
      {relationOption && (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-[var(--color-success)]/5 border border-[var(--color-success)]/20 text-[var(--color-success)]">
          <Link size={10} aria-hidden="true" />
          <span className="truncate max-w-[150px]">{relationOption.label}</span>
        </div>
      )}
    </div>
  );
}

export default function TaskProfileModal({ open, onClose, editingTask, onSaveSuccess }: TaskProfileModalProps) {
  const form = useTaskForm(editingTask || null);
  
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isDepartmentOpen, setIsDepartmentOpen] = useState(false);
  const [isLinkOpen, setIsLinkOpen] = useState(false);
  const [isAssigneeOpen, setIsAssigneeOpen] = useState(false);
  
  const categoryRef = useRef<HTMLDivElement>(null);
  const departmentRef = useRef<HTMLDivElement>(null);
  const linkRef = useRef<HTMLDivElement>(null);
  const assigneeBtnRef = useRef<HTMLButtonElement>(null);

  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const departmentDropdownRef = useRef<HTMLDivElement>(null);
  const linkDropdownRef = useRef<HTMLDivElement>(null);
  const assigneeDropdownRef = useRef<HTMLDivElement>(null);

  const [categoryPos, setCategoryPos] = useState<{ top: number; left: number } | null>(null);
  const [departmentPos, setDepartmentPos] = useState<{ top: number; left: number } | null>(null);
  const [linkPos, setLinkPos] = useState<{ top: number; left: number } | null>(null);
  const [assigneePos, setAssigneePos] = useState<{ top: number; left: number } | null>(null);

  const openDropdown = (type: "category" | "department" | "link" | "assignee") => {
    if (type !== "category") { setIsCategoryOpen(false); setCategoryPos(null); }
    if (type !== "department") { setIsDepartmentOpen(false); setDepartmentPos(null); }
    if (type !== "link") { setIsLinkOpen(false); setLinkPos(null); }
    if (type !== "assignee") { setIsAssigneeOpen(false); setAssigneePos(null); }

    if (type === "category" && categoryRef.current) {
      const rect = categoryRef.current.getBoundingClientRect();
      setCategoryPos({ top: rect.bottom + window.scrollY + 8, left: rect.left + window.scrollX });
      setIsCategoryOpen(!isCategoryOpen);
    } else if (type === "department" && departmentRef.current) {
      const rect = departmentRef.current.getBoundingClientRect();
      setDepartmentPos({ top: rect.bottom + window.scrollY + 8, left: rect.left + window.scrollX });
      setIsDepartmentOpen(!isDepartmentOpen);
    } else if (type === "link" && linkRef.current) {
      const rect = linkRef.current.getBoundingClientRect();
      setLinkPos({ top: rect.bottom + window.scrollY + 8, left: rect.left + window.scrollX });
      setIsLinkOpen(!isLinkOpen);
    } else if (type === "assignee" && assigneeBtnRef.current) {
      const rect = assigneeBtnRef.current.getBoundingClientRect();
      setAssigneePos({ top: rect.top + window.scrollY - 8, left: rect.left + window.scrollX });
      setIsAssigneeOpen(!isAssigneeOpen);
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (categoryRef.current && !categoryRef.current.contains(event.target as Node) && categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) { setIsCategoryOpen(false); setCategoryPos(null); }
      if (departmentRef.current && !departmentRef.current.contains(event.target as Node) && departmentDropdownRef.current && !departmentDropdownRef.current.contains(event.target as Node)) { setIsDepartmentOpen(false); setDepartmentPos(null); }
      if (linkRef.current && !linkRef.current.contains(event.target as Node) && linkDropdownRef.current && !linkDropdownRef.current.contains(event.target as Node)) { setIsLinkOpen(false); setLinkPos(null); }
      if (assigneeBtnRef.current && !assigneeBtnRef.current.contains(event.target as Node) && assigneeDropdownRef.current && !assigneeDropdownRef.current.contains(event.target as Node)) { setIsAssigneeOpen(false); setAssigneePos(null); }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSave = async () => {
    const success = await form.handleSubmit();
    if (success) {
      onSaveSuccess();
      onClose();
    }
  };

  if (!open) return null;

  const selectedRelationOption = form.relationOptions.find(opt => opt.id === form.targetId);
  const selectedCategory = CATEGORIES.find(c => c.id === form.category);
  const selectedUser = form.users.find(u => u.id === form.userId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-[var(--shadow-xl)] overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/50">
          <div>
            <h2 className="text-lg font-bold text-[var(--color-ink)]">
              {editingTask ? "Edit Task Profile" : "Create New Task"}
            </h2>
            <p className="text-xs text-[var(--color-ink-muted)] mt-0.5">
              {editingTask ? "Update details, assignment, and relations." : "Assign work, set priorities, and link to operations."}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-ink)] transition-colors">
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
          
          {/* Section 1: Classification & Relations */}
          <div className="space-y-3">
            <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)] block">Classification & Relations</label>
            
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center flex-wrap">
              
              {/* Priority Selector */}
              <div className="flex-shrink-0">
                <div className="flex items-center gap-1 p-1 bg-[var(--color-surface-hover)] rounded-xl border border-[var(--color-surface-border)]">
                  {PRIORITIES.map((p) => (
                    <button key={p.id} type="button" onClick={() => form.setPriority(p.id)} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${form.priority === p.id ? `${p.color} border shadow-sm` : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"}`}>
                      {p.id}
                    </button>
                  ))}
                </div>
              </div>

              {/* ✅ 1. Department Filter (Moved to First Position) */}
              <div className="relative" ref={departmentRef}>
                <button type="button" onClick={() => openDropdown("department")} title="Filter by department" className={`h-9 w-9 flex items-center justify-center rounded-xl border transition-all ${form.department ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5 text-[var(--color-primary)]" : "border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"}`}>
                  <Building2 size={14} aria-hidden="true" />
                </button>
              </div>

              {/* ✅ 2. Category Filter (Moved to Second Position) */}
              <div className="relative" ref={categoryRef}>
                <button type="button" onClick={() => openDropdown("category")} title="Select category" className={`h-9 w-9 flex items-center justify-center rounded-xl border transition-all ${form.category ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5 text-[var(--color-primary)]" : "border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"}`}>
                  {selectedCategory ? <selectedCategory.icon size={14} aria-hidden="true" /> : <Tag size={14} aria-hidden="true" />}
                </button>
              </div>

              {/* 3. Link To Filter */}
              {form.targetType && (
                <div className="relative" ref={linkRef}>
                  <button type="button" onClick={() => openDropdown("link")} title="Link to operation" className={`h-9 w-9 flex items-center justify-center rounded-xl border transition-all ${form.targetId ? "border-[var(--color-success)] bg-[var(--color-success)]/5 text-[var(--color-success)]" : "border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] animate-in fade-in zoom-in-95"}`}>
                    <Link size={14} aria-hidden="true" />
                  </button>
                </div>
              )}
            </div>

            {/* ✅ 3. Selected Options Display (Placed above the divider) */}
            <RelationChips department={form.department} category={selectedCategory} relationOption={selectedRelationOption} />
          </div>

          {/* Divider Line */}
          <div className="border-t border-[var(--color-surface-border)]" />

          {/* Section 2: Core Details */}
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)] mb-1.5 block">Task Title *</label>
              <input type="text" value={form.title} onChange={(e) => form.setTitle(e.target.value)} placeholder="e.g., Verify client documents..." className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] placeholder-[var(--color-ink-subtle)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all text-sm" />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)] mb-1.5 block">Description</label>
              <textarea value={form.description} onChange={(e) => form.setDescription(e.target.value)} placeholder="Add specific instructions or context..." rows={3} className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] placeholder-[var(--color-ink-subtle)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all text-sm resize-none" />
            </div>
          </div>

          {/* Section 3: Timeline & Assignment */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-[var(--color-surface-border)]">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)] mb-1.5 flex items-center gap-1.5"><CalendarDays size={10} aria-hidden="true" /> Start Date</label>
              <input type="date" value={form.startDate} onChange={(e) => form.setStartDate(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] text-sm focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all" />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)] mb-1.5 flex items-center gap-1.5"><Clock size={10} aria-hidden="true" /> Due Date</label>
              <input type="date" value={form.dueDate} onChange={(e) => form.setDueDate(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] text-sm focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all" />
            </div>
            
            {/* Premium Assignee Dropdown (Renders UPWARDS) */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)] mb-1.5 flex items-center gap-1.5"><UserPlus size={10} aria-hidden="true" /> Assignee</label>
              <button ref={assigneeBtnRef} type="button" onClick={() => openDropdown("assignee")} className={`w-full h-[38px] px-3 flex items-center justify-between gap-2 rounded-xl border transition-all text-left ${form.userId ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5 text-[var(--color-primary)]" : "border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"}`}>
                <div className="flex items-center gap-2 min-w-0">
                  {selectedUser ? (
                    <div className="w-5 h-5 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center text-[9px] font-bold text-[var(--color-primary)] flex-shrink-0">{selectedUser.full_name?.split(" ").map((n: string) => n[0]).join("").substring(0, 2)}</div>
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] flex items-center justify-center flex-shrink-0"><UserPlus size={10} className="text-[var(--color-ink-muted)]" aria-hidden="true" /></div>
                  )}
                  <span className="text-xs font-semibold truncate">{selectedUser ? selectedUser.full_name : "Unassigned"}</span>
                </div>
                <ChevronDown size={12} className={`text-[var(--color-ink-subtle)] transition-transform flex-shrink-0 ${isAssigneeOpen ? "rotate-180" : ""}`} aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/50">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-xs font-bold text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-ink)] transition-all">Cancel</button>
          <button onClick={handleSave} disabled={!form.isValid || form.isSubmitting} className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed">
            {form.isSubmitting ? <Loader2 size={14} className="animate-spin" aria-hidden="true" /> : <Save size={14} aria-hidden="true" />}
            {editingTask ? "Save Changes" : "Create Task"}
          </button>
        </div>
      </div>

      {/* Category Dropdown */}
      {isCategoryOpen && categoryPos && (
        <div ref={categoryDropdownRef} className="fixed z-[9999] w-48 bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-xl shadow-[var(--shadow-xl)] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200" style={{ top: categoryPos.top, left: categoryPos.left }}>
          <div className="p-1 max-h-60 overflow-y-auto custom-scrollbar">
            {CATEGORIES.map((c) => {
              const Icon = c.icon;
              return (
                <button key={c.id} type="button" onClick={() => { form.setCategory(c.id); setIsCategoryOpen(false); setCategoryPos(null); }} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs transition-colors ${form.category === c.id ? "bg-[var(--color-primary)]/5 text-[var(--color-primary)]" : "text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)]"}`}>
                  <Icon size={14} aria-hidden="true" /><span className="font-medium">{c.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Department Dropdown */}
      {isDepartmentOpen && departmentPos && (
        <div ref={departmentDropdownRef} className="fixed z-[9999] w-48 bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-xl shadow-[var(--shadow-xl)] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200" style={{ top: departmentPos.top, left: departmentPos.left }}>
          <div className="p-1 max-h-60 overflow-y-auto custom-scrollbar">
            {form.availableDepartments.length === 0 ? (
              <div className="p-4 text-center text-xs text-[var(--color-ink-muted)]">No departments found.</div>
            ) : (
              form.availableDepartments.map((dept) => (
                <button key={dept} type="button" onClick={() => { form.setDepartment(dept); setIsDepartmentOpen(false); setDepartmentPos(null); }} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs transition-colors ${form.department === dept ? "bg-[var(--color-primary)]/5 text-[var(--color-primary)]" : "text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)]"}`}>
                  <Building2 size={14} aria-hidden="true" /><span className="font-medium capitalize">{dept}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Link To Dropdown */}
      {isLinkOpen && linkPos && (
        <div ref={linkDropdownRef} className="fixed z-[9999] w-64 bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-xl shadow-[var(--shadow-xl)] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 max-h-60 overflow-y-auto custom-scrollbar" style={{ top: linkPos.top, left: linkPos.left }}>
          {form.loadingRelations ? (
            <div className="p-4 flex items-center justify-center gap-2 text-xs text-[var(--color-ink-muted)]"><Loader2 size={12} className="animate-spin" aria-hidden="true" /> Loading...</div>
          ) : form.relationOptions.length === 0 ? (
            <div className="p-4 text-center text-xs text-[var(--color-ink-muted)]">No options found.</div>
          ) : (
            form.relationOptions.map((opt) => (
              <button key={opt.id} type="button" onClick={() => { form.setTargetId(opt.id); setIsLinkOpen(false); setLinkPos(null); }} className={`w-full flex flex-col items-start px-4 py-2.5 text-left transition-colors ${form.targetId === opt.id ? "bg-[var(--color-success)]/5 text-[var(--color-success)]" : "text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)]"}`}>
                <span className="text-xs font-medium">{opt.label}</span>
                {opt.subLabel && <span className="text-[10px] text-[var(--color-ink-muted)]">{opt.subLabel}</span>}
              </button>
            ))
          )}
        </div>
      )}

      {/* Premium Assignee Dropdown (Renders UPWARDS) */}
      {isAssigneeOpen && assigneePos && (
        <div ref={assigneeDropdownRef} className="fixed z-[9999] w-64 bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-xl shadow-[var(--shadow-xl)] overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200 max-h-64 overflow-y-auto custom-scrollbar" style={{ top: assigneePos.top, left: assigneePos.left }}>
          <div className="p-1">
            {form.users.length === 0 ? (
              <div className="p-4 text-center text-xs text-[var(--color-ink-muted)]">No users found in this department.</div>
            ) : (
              <>
                <button type="button" onClick={() => { form.setUserId(null); setIsAssigneeOpen(false); setAssigneePos(null); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs transition-colors ${!form.userId ? "bg-[var(--color-primary)]/5 text-[var(--color-primary)]" : "text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)]"}`}>
                  <div className="w-6 h-6 rounded-full bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] flex items-center justify-center flex-shrink-0"><UserPlus size={12} className="text-[var(--color-ink-muted)]" aria-hidden="true" /></div>
                  <span className="font-medium flex-1 text-left">Unassigned</span>
                  {!form.userId && <Check size={12} className="text-[var(--color-primary)]" aria-hidden="true" />}
                </button>
                {form.users.map((u) => (
                  <button key={u.id} type="button" onClick={() => { form.setUserId(u.id); setIsAssigneeOpen(false); setAssigneePos(null); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs transition-colors ${form.userId === u.id ? "bg-[var(--color-primary)]/5 text-[var(--color-primary)]" : "text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)]"}`}>
                    <div className="w-6 h-6 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center text-[10px] font-bold text-[var(--color-primary)] flex-shrink-0">{u.full_name?.split(" ").map((n: string) => n[0]).join("").substring(0, 2)}</div>
                    <span className="font-medium flex-1 text-left truncate">{u.full_name}</span>
                    {form.userId === u.id && <Check size={12} className="text-[var(--color-primary)]" aria-hidden="true" />}
                  </button>
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
