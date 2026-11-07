import { useState, useRef, useEffect } from "react";
import { DotsThreeVertical as MoreVertical, ShieldCheck, ShieldWarning as ShieldAlert, Archive, Eye } from "@phosphor-icons/react/ssr";
import { useRouter } from "next/navigation";

export function TenantActionsMenu({ tenant, onToggleSubscription, onArchive }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (e: any) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block" ref={menuRef}>
      <button 
        onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
        className="p-2 hover:bg-[var(--color-surface-hover)] rounded-lg transition-colors text-[var(--color-ink-muted)]"
      >
        <MoreVertical size={16} aria-hidden="true" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-xl shadow-lg z-50 overflow-hidden">
          <button 
            onClick={() => { router.push(`/super-admin/agencies/${tenant.id}`); setIsOpen(false); }} 
            className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-[var(--color-surface-hover)] text-[var(--color-ink)]"
          >
            <Eye size={14} aria-hidden="true" /> View Tenant Profile
          </button>
          
          <div className="h-px bg-[var(--color-surface-border)] my-1" />

          {tenant.is_active ? (
            <button onClick={() => { onToggleSubscription(); setIsOpen(false); }} className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-[var(--color-surface-hover)] text-red-600">
              <ShieldAlert size={14} aria-hidden="true" /> Suspend Workspace
            </button>
          ) : (
            <button onClick={() => { onToggleSubscription(); setIsOpen(false); }} className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-[var(--color-surface-hover)] text-emerald-600">
              <ShieldCheck size={14} aria-hidden="true" /> Activate Workspace
            </button>
          )}
          <button onClick={() => { onArchive(); setIsOpen(false); }} className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)]">
            <Archive size={14} aria-hidden="true" /> Move to Vault
          </button>
        </div>
      )}
    </div>
  );
}
