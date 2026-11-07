// src/components/users/AddMemberChoiceModal.tsx
import { useRouter } from "next/navigation";
import { X, UserPlus, Link } from "@phosphor-icons/react/ssr";

interface AddMemberChoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: () => void;
}

export default function AddMemberChoiceModal({ isOpen, onClose, onInvite }: AddMemberChoiceModalProps) {
  const router = useRouter();
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-[var(--color-ink)]">Add New Member</h3>
            <button onClick={onClose} className="text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors">
              <X size={20} aria-hidden="true" />
            </button>
          </div>
          
          <p className="text-sm text-[var(--color-ink-muted)] mb-6">
            How would you like to add this team member?
          </p>

          <div className="space-y-3">
            <button
              onClick={() => { router.push("/dashboard/users/new"); onClose(); }}
              className="w-full flex items-center gap-4 p-4 rounded-xl border border-[var(--color-surface-border)] hover:bg-[var(--color-surface-hover)] hover:border-[var(--color-primary)]/30 transition-all text-left group"
            >
              <div className="w-10 h-10 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)] group-hover:scale-110 transition-transform">
                <UserPlus size={20} aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-bold text-[var(--color-ink)]">Manual Entry</p>
                <p className="text-xs text-[var(--color-ink-muted)]">Fill out the details and create the account directly.</p>
              </div>
            </button>

            <button
              onClick={() => { onInvite(); onClose(); }}
              className="w-full flex items-center gap-4 p-4 rounded-xl border border-[var(--color-surface-border)] hover:bg-[var(--color-surface-hover)] hover:border-[var(--color-primary)]/30 transition-all text-left group"
            >
              <div className="w-10 h-10 rounded-lg bg-[var(--color-success-bg)] flex items-center justify-center text-[var(--color-success-text)] group-hover:scale-110 transition-transform">
                <Link size={20} aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-bold text-[var(--color-ink)]">Send Invite Link</p>
                <p className="text-xs text-[var(--color-ink-muted)]">Generate a secure link to share via SMS or WhatsApp.</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
