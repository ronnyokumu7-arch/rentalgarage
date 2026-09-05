// src/components/client/AddClientModal.tsx
import { useState, useEffect } from "react";
import { Link2, Loader2, Check, Copy, MessageCircle, MessageSquare, Mail, Clock, QrCode, User, Phone } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { clientInvitesApi, ClientInvite } from "@/lib/api/clientInvites";
import toast from "react-hot-toast";

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddClientModal({ isOpen, onClose }: AddClientModalProps) {
  const [ttl, setTtl] = useState(7);
  const [expectedName, setExpectedName] = useState("");
  const [expectedPhone, setExpectedPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [invite, setInvite] = useState<ClientInvite | null>(null);
  const [copied, setCopied] = useState(false);
  const [liveCount, setLiveCount] = useState<number | null>(null);

  // Reset when modal opens/closes + fetch live invite count
  useEffect(() => {
    if (!isOpen) {
      setTtl(7);
      setExpectedName("");
      setExpectedPhone("");
      setInvite(null);
      setCopied(false);
      setLiveCount(null);
    } else {
      clientInvitesApi
        .list(100)
        .then((res) => setLiveCount(res.data.filter((i) => i.is_live).length))
        .catch(() => setLiveCount(null));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const linkFor = (inv: ClientInvite) =>
    `${window.location.origin}/invite/${inv.token}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await clientInvitesApi.create(ttl, expectedName, expectedPhone);
      setInvite(res.data);
      toast.success("Invite link generated!");

      // ✅ AUTO-REFRESH: notify clients list to refetch (new pending invite appears instantly)
      window.dispatchEvent(new CustomEvent('client:invite:created'));
    } catch {
      toast.error("Failed to generate invite link");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!invite) return;
    await navigator.clipboard.writeText(linkFor(invite));
    setCopied(true);
    toast.success("Link copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const shareWhatsApp = () => {
    if (!invite) return;
    const text = encodeURIComponent(
      `Hi! Complete your rental onboarding here:\n${linkFor(invite)}\n(The link is single-use and expires ${new Date(invite.expires_at).toLocaleDateString()}.)`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const shareSms = () => {
    if (!invite) return;
    const text = encodeURIComponent(
      `Complete your rental onboarding here: ${linkFor(invite)} (single-use, expires ${new Date(invite.expires_at).toLocaleDateString()})`
    );
    window.location.href = `sms:?body=${text}`;
  };

  const shareEmail = () => {
    if (!invite) return;
    const subject = encodeURIComponent("Your rental onboarding invitation");
    const body = encodeURIComponent(
      `Hi,\n\nComplete your onboarding here: ${linkFor(invite)}\n\nThis link is single-use and expires on ${new Date(invite.expires_at).toLocaleDateString()}.`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        {!invite ? (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)]">
                <Link2 size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[var(--color-ink)]">Invite Client</h3>
                <p className="text-xs text-[var(--color-ink-muted)]">
                  Generate a single-use onboarding link. The client will submit their details for review.
                </p>
              </div>
            </div>

            {/* ✅ Live invites context chip */}
            {liveCount !== null && liveCount > 0 && (
              <p className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-lg px-3 py-2">
                You currently have {liveCount} live invite {liveCount === 1 ? "link" : "links"}. Manage or revoke them in the Invites tab.
              </p>
            )}

            {/* ✅ EXPECTED CLIENT (optional, informational only) */}
            <div className="p-3 rounded-xl bg-[var(--color-surface-hover)]/50 border border-[var(--color-surface-border)] space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">
                Who are you inviting? <span className="text-[9px] font-normal">(optional)</span>
              </p>
              <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                  <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)] pointer-events-none" />
                  <input
                    type="text"
                    value={expectedName}
                    onChange={(e) => setExpectedName(e.target.value)}
                    placeholder="Client name"
                    maxLength={255}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-surface-border)] text-sm text-[var(--color-ink)] placeholder-[var(--color-ink-subtle)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all"
                  />
                </div>
                <div className="relative">
                  <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)] pointer-events-none" />
                  <input
                    type="tel"
                    value={expectedPhone}
                    onChange={(e) => setExpectedPhone(e.target.value)}
                    placeholder="Phone"
                    maxLength={50}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-surface-border)] text-sm text-[var(--color-ink)] placeholder-[var(--color-ink-subtle)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all"
                  />
                </div>
              </div>
              <p className="text-[9px] text-[var(--color-ink-subtle)] leading-relaxed">
                Helps you track who you're expecting. Won't be shown to the client.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-ink-muted)] mb-1">
                Link Validity
              </label>
              <select
                required
                className="w-full px-3 py-2.5 rounded-xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] text-sm text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all appearance-none"
                value={ttl}
                onChange={(e) => setTtl(Number(e.target.value))}
              >
                <option value={1}>1 day</option>
                <option value={7}>7 days</option>
                <option value={14}>14 days</option>
                <option value={30}>30 days</option>
              </select>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-[var(--color-ink)] bg-[var(--color-surface-hover)] hover:bg-[var(--color-surface-hover)]/80 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Link2 size={16} />
                    Generate Link
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="p-6 space-y-4">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400 mb-3">
                <Check size={32} />
              </div>
              <h3 className="text-lg font-bold text-[var(--color-ink)]">Invite Link Ready!</h3>
              <p className="text-sm text-[var(--color-ink-muted)] mt-1">
                {invite.expected_name
                  ? `For ${invite.expected_name}${invite.expected_phone ? ` (${invite.expected_phone})` : ""}`
                  : "Share this link with your client. They'll submit their details for review."}
              </p>
            </div>

            {/* ✅ QR CODE: walk-in clients scan & onboard on their phone */}
            <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white border border-[var(--color-surface-border)]">
              <QRCodeSVG
                value={linkFor(invite)}
                size={140}
                bgColor="#ffffff"
                fgColor="#0f172a"
                level="M"
              />
              <p className="text-[10px] font-semibold text-slate-600 flex items-center gap-1">
                <QrCode size={11} />
                Walk-in client? Let them scan to onboard.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)]">
              <code className="block text-xs text-[var(--color-ink)] break-all text-center font-mono">
                {linkFor(invite)}
              </code>
              {/* ✅ Sharper microcopy: reinforces the safety model */}
              <p className="text-[10px] text-[var(--color-ink-subtle)] mt-2 flex items-center justify-center gap-1">
                <Clock size={10} />
                Single-use · expires {new Date(invite.expires_at).toLocaleDateString()} · client lands as Pending until you approve
              </p>
            </div>

            {/* ✅ 4 share options: Copy / WhatsApp / SMS / Email */}
            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={handleCopy}
                className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl border border-[var(--color-surface-border)] hover:border-[var(--color-primary)]/50 hover:bg-[var(--color-primary)]/5 transition-all"
              >
                {copied ? (
                  <Check size={16} className="text-emerald-500" />
                ) : (
                  <Copy size={16} className="text-[var(--color-ink-muted)]" />
                )}
                <span className="text-[9px] font-bold text-[var(--color-ink)]">Copy</span>
              </button>
              <button
                onClick={shareWhatsApp}
                className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl border border-[var(--color-surface-border)] hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all"
              >
                <MessageCircle size={16} className="text-emerald-500" />
                <span className="text-[9px] font-bold text-[var(--color-ink)]">WhatsApp</span>
              </button>
              <button
                onClick={shareSms}
                className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl border border-[var(--color-surface-border)] hover:border-amber-500/50 hover:bg-amber-500/5 transition-all"
              >
                <MessageSquare size={16} className="text-amber-500" />
                <span className="text-[9px] font-bold text-[var(--color-ink)]">SMS</span>
              </button>
              <button
                onClick={shareEmail}
                className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl border border-[var(--color-surface-border)] hover:border-blue-500/50 hover:bg-blue-500/5 transition-all"
              >
                <Mail size={16} className="text-blue-500" />
                <span className="text-[9px] font-bold text-[var(--color-ink)]">Email</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-full px-4 py-2.5 rounded-xl text-sm font-bold text-[var(--color-ink)] bg-[var(--color-surface-hover)] hover:bg-[var(--color-surface-hover)]/80 transition-all"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
