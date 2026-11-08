// src/components/client/InviteLinksModal.tsx
"use client";

import { useEffect, useState } from "react";
import {
  Copy, Check, Trash as Trash2, ArrowSquareOut as ExternalLink, LinkSimple as Link2, CircleNotch as Loader2, WarningCircle as AlertCircle, Clock,
} from "@phosphor-icons/react/ssr";
import toast from "react-hot-toast";
import { clientInvitesApi, ClientInvite } from "@/lib/api/clientInvites";
import { getApiErrorMessage } from "@/lib/api-error";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Modal from "@/components/ui/Modal";

interface InviteLinksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InviteLinksModal({ isOpen, onClose }: InviteLinksModalProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [invites, setInvites] = useState<ClientInvite[]>([]);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [revokingId, setRevokingId] = useState<number | null>(null);
  const [inviteToRevoke, setInviteToRevoke] = useState<ClientInvite | null>(null);

  // Fetch active invites when modal opens
  useEffect(() => {
    if (!isOpen) {
      setInviteToRevoke(null);
      return;
    }
    let cancelled = false;

    setLoading(true);
    setError(null);

    clientInvitesApi
      .list(100)
      .then((res) => {
        if (cancelled) return;
        // Only show LIVE invites — backend already computes is_live
        const active = (res.data || [])
          .filter((inv) => inv.is_live)
          .sort(
            (a, b) =>
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
          );
        setInvites(active);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("Failed to load invites:", err);
        setError("Failed to load invite links");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  const linkFor = (inv: ClientInvite) =>
    `${window.location.origin}/invite/${inv.token}`;

  const handleCopy = async (invite: ClientInvite) => {
    try {
      await navigator.clipboard.writeText(linkFor(invite));
      setCopiedId(invite.id);
      toast.success("Link copied");
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handleRevoke = async (invite: ClientInvite) => {
    setRevokingId(invite.id);
    try {
      await clientInvitesApi.revoke(invite.id);
      setInvites((prev) => prev.filter((i) => i.id !== invite.id));
      toast.success("Invite revoked");
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "Failed to revoke invite"));
    } finally {
      setRevokingId(null);
    }
  };

  const confirmRevoke = async () => {
    if (!inviteToRevoke) return;
    await handleRevoke(inviteToRevoke);
    setInviteToRevoke(null);
  };

  const formatExpiry = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHrs / 24);

    if (diffHrs < 1) return "Expires in < 1 hour";
    if (diffHrs < 24) return `Expires in ${diffHrs}h`;
    if (diffDays === 1) return "Expires tomorrow";
    return `Expires in ${diffDays} days`;
  };

  if (!isOpen) return null;

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      size="md"
      ariaLabel="Live Invite Links"
      bodyClassName="p-0"
      header={
        <div className="flex min-w-0 items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center">
              <Link2 size={16} aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-bold text-[var(--color-ink)]">
                Live Invite Links
              </h2>
              <p className="text-[10px] text-[var(--color-ink-muted)]">
                {invites.length} {invites.length === 1 ? "active link" : "active links"}
              </p>
            </div>
        </div>
      }
    >
        <div className="p-4">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-[var(--color-ink-muted)]">
              <Loader2 size={18} className="animate-spin" aria-hidden="true" />
              <span className="text-sm">Loading invites...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <AlertCircle size={24} className="text-[var(--color-danger)]" aria-hidden="true" />
              <p className="text-sm text-[var(--color-ink-muted)]">{error}</p>
            </div>
          ) : invites.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <div className="w-14 h-14 rounded-2xl bg-[var(--color-surface-hover)] flex items-center justify-center">
                <Link2 size={22} className="text-[var(--color-ink-subtle)]" aria-hidden="true" />
              </div>
              <p className="text-sm font-semibold text-[var(--color-ink)]">
                No active invites
              </p>
              <p className="text-xs text-[var(--color-ink-muted)] max-w-xs">
                Generate a link to invite a new client to onboard themselves.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {invites.map((invite) => {
                const isCopied = copiedId === invite.id;
                const isRevoking = revokingId === invite.id;
                const url = linkFor(invite);

                return (
                  <div
                    key={invite.id}
                    className="bg-[var(--color-surface-hover)]/40 border border-[var(--color-surface-border)] rounded-xl p-3"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-[var(--color-ink)] truncate">
                          {invite.expected_name || "Unnamed invite"}
                        </p>
                        {invite.expected_phone && (
                          <p className="text-[11px] text-[var(--color-ink-muted)] font-mono truncate">
                            {invite.expected_phone}
                          </p>
                        )}
                      </div>
                      <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-600 dark:text-amber-400 flex-shrink-0">
                        <Clock size={10} aria-hidden="true" />
                        {formatExpiry(invite.expires_at)}
                      </span>
                    </div>

                    <code className="block text-[10px] text-[var(--color-ink-muted)] font-mono bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-lg px-2 py-1.5 truncate mb-2">
                      {url}
                    </code>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopy(invite)}
                        className={`flex-1 flex items-center justify-center gap-1.5 h-8 rounded-lg text-[11px] font-bold transition-colors ${
                          isCopied
                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                            : "bg-[var(--color-primary)]/10 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/20"
                        }`}
                      >
                        {isCopied ? <Check size={12} aria-hidden="true" /> : <Copy size={12} aria-hidden="true" />}
                        {isCopied ? "Copied" : "Copy link"}
                      </button>

                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--color-ink-muted)] bg-[var(--color-surface)] border border-[var(--color-surface-border)] hover:bg-[var(--color-surface-hover)] transition-colors"
                        aria-label="Open link"
                      >
                        <ExternalLink size={12} aria-hidden="true" />
                      </a>

                      <button
                        onClick={() => setInviteToRevoke(invite)}
                        disabled={isRevoking}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--color-danger)] bg-[var(--color-danger-bg)] hover:bg-[var(--color-danger)]/15 transition-colors disabled:opacity-50"
                        aria-label="Revoke invite"
                      >
                        {isRevoking ? (
                          <Loader2 size={12} className="animate-spin" aria-hidden="true" />
                        ) : (
                          <Trash2 size={12} aria-hidden="true" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <ConfirmDialog
          open={Boolean(inviteToRevoke)}
          onClose={() => setInviteToRevoke(null)}
          onConfirm={confirmRevoke}
          loading={revokingId === inviteToRevoke?.id}
          title="Revoke invite link?"
          message={`Revoke the invite link${inviteToRevoke?.expected_name ? ` for ${inviteToRevoke.expected_name}` : ""}? The client won't be able to use it.`}
          confirmLabel="Revoke link"
        />
    </Modal>
  );
}
