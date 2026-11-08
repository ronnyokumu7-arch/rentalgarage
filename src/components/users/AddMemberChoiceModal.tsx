// src/components/users/AddMemberChoiceModal.tsx
import { useRouter } from "next/navigation";
import { UserPlus, Link } from "@phosphor-icons/react/ssr";
import Modal from "@/components/ui/Modal";

interface AddMemberChoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: () => void;
}

export default function AddMemberChoiceModal({ isOpen, onClose, onInvite }: AddMemberChoiceModalProps) {
  const router = useRouter();
  
  if (!isOpen) return null;

  return (
    <Modal open={isOpen} onClose={onClose} title="Add New Member" size="md">
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
    </Modal>
  );
}
