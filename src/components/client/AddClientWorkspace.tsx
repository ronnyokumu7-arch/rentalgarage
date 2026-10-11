"use client";

import { useState, useEffect } from "react";
import { 
  Link2, Loader2, Check, Copy, MessageCircle, MessageSquare, 
  Mail, Clock, QrCode, User, Phone
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { clientInvitesApi, ClientInvite } from "@/lib/api/clientInvites";
import { clientsApi } from "@/lib/api/clients";
import NewClientForm from "@/components/client/NewClientForm";
import toast from "react-hot-toast";

type Tab = "invite" | "manual";

interface AddClientWorkspaceProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function AddClientWorkspace({ onSuccess, onCancel }: AddClientWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<Tab>("invite");
  
  // ── Invite State ──
  const [ttl, setTtl] = useState(7);
  const [expectedName, setExpectedName] = useState("");
  const [expectedPhone, setExpectedPhone] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [invite, setInvite] = useState<ClientInvite | null>(null);
  const [copied, setCopied] = useState(false);
  const [liveCount, setLiveCount] = useState<number | null>(null);

  // ── Manual State ──
  const [formData, setFormData] = useState<Record<string, string>>({
    first_name: "", last_name: "", email: "", phone: "",
    id_type: "national_id", id_number: "", dl_number: "",
    dl_expiry: "", dl_issued_date: "", residential_address: "",
    work_address: "", next_of_kin_name: "", next_of_kin_phone: "",
    driving_arrangement: "self_drive",
    driver_full_name: "", driver_phone: "", driver_id_number: "",
    driver_dl_number: "", driver_dl_expiry: "", driver_dl_issued_date: "",
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [idFrontFile, setIdFrontFile] = useState<File | null>(null);
  const [idBackFile, setIdBackFile] = useState<File | null>(null);
  const [dlFrontFile, setDlFrontFile] = useState<File | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [manualLoading, setManualLoading] = useState(false);

  useEffect(() => {
    clientInvitesApi.list(100)
      .then((res) => setLiveCount(res.data.filter((i: any) => i.is_live).length))
      .catch(() => setLiveCount(null));
  }, []);

  const linkFor = (inv: ClientInvite) => `${window.location.origin}/invite/${inv.token}`;

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteLoading(true);
    try {
      const res = await clientInvitesApi.create(ttl, expectedName, expectedPhone);
      setInvite(res.data);
      toast.success("Invite link generated!");
      window.dispatchEvent(new CustomEvent('client:invite:created'));
    } catch {
      toast.error("Failed to generate invite link");
    } finally {
      setInviteLoading(false);
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
    const text = encodeURIComponent(`Hi! Complete your rental onboarding here:\n${linkFor(invite)}\n(Link expires ${new Date(invite.expires_at).toLocaleDateString()})`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const shareSms = () => {
    if (!invite) return;
    const text = encodeURIComponent(`Complete your rental onboarding here: ${linkFor(invite)} (expires ${new Date(invite.expires_at).toLocaleDateString()})`);
    window.location.href = `sms:?body=${text}`;
  };

  const shareEmail = () => {
    if (!invite) return;
    const subject = encodeURIComponent("Your rental onboarding invitation");
    const body = encodeURIComponent(`Hi,\n\nComplete your onboarding here: ${linkFor(invite)}\n\nThis link is single-use and expires on ${new Date(invite.expires_at).toLocaleDateString()}.`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => { const next = { ...prev }; delete next[field]; return next; });
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setManualLoading(true);
    setFieldErrors({});
    try {
      const payload: any = {
        first_name: formData.first_name, last_name: formData.last_name,
        email: formData.email || undefined, phone: formData.phone,
        id_type: formData.id_type, id_number: formData.id_number,
        dl_number: formData.dl_number || undefined, dl_expiry: formData.dl_expiry || undefined,
        dl_issued_date: formData.dl_issued_date || undefined,
        residential_address: formData.residential_address || undefined,
        work_address: formData.work_address || undefined,
        next_of_kin_name: formData.next_of_kin_name || undefined,
        next_of_kin_phone: formData.next_of_kin_phone || undefined,
        driving_arrangement: formData.driving_arrangement,
      };

      if (formData.driving_arrangement === "own_driver") {
        payload.driver = {
          full_name: formData.driver_full_name, phone: formData.driver_phone,
          id_number: formData.driver_id_number, dl_number: formData.driver_dl_number,
          dl_expiry: formData.driver_dl_expiry || undefined, dl_issued_date: formData.driver_dl_issued_date || undefined,
        };
      }

      const client = await clientsApi.create(payload);
      const clientId = client.id;

      const uploadPromises = [];
      if (avatarFile) uploadPromises.push(clientsApi.uploadAvatar(clientId, avatarFile));
      if (idFrontFile) uploadPromises.push(clientsApi.uploadIdFront(clientId, idFrontFile));
      if (idBackFile) uploadPromises.push(clientsApi.uploadIdBack(clientId, idBackFile));
      if (dlFrontFile) uploadPromises.push(clientsApi.uploadDlFront(clientId, dlFrontFile));

      if (uploadPromises.length > 0) await Promise.all(uploadPromises);

      toast.success("Client created successfully!");
      window.dispatchEvent(new CustomEvent('client:created'));
      onSuccess?.();
    } catch (error: any) {
      if (error.response?.data?.field_errors) setFieldErrors(error.response.data.field_errors);
      toast.error(error.response?.data?.message || "Failed to create client");
    } finally {
      setManualLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="flex border-b border-[var(--color-surface-border)]">
        <button
          onClick={() => { setActiveTab("invite"); setInvite(null); }}
          className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 transition-all border-b-2 ${
            activeTab === "invite"
              ? "text-[var(--color-primary)] border-[var(--color-primary)] bg-[var(--color-primary)]/5 rounded-t-lg"
              : "text-[var(--color-ink-muted)] border-transparent hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)] rounded-t-lg"
          }`}
        >
          <Link2 size={16} /> Invite Client
        </button>
        <button
          onClick={() => setActiveTab("manual")}
          className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 transition-all border-b-2 ${
            activeTab === "manual"
              ? "text-[var(--color-primary)] border-[var(--color-primary)] bg-[var(--color-primary)]/5 rounded-t-lg"
              : "text-[var(--color-ink-muted)] border-transparent hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)] rounded-t-lg"
          }`}
        >
          <User size={16} /> Manual Entry
        </button>
      </div>

      {/* Content Area */}
      <div className="min-h-[300px]">
        {activeTab === "invite" ? (
          !invite ? (
            <form onSubmit={handleInviteSubmit} className="space-y-5 max-w-lg mx-auto">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)] shrink-0">
                  <Link2 size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[var(--color-ink)]">Generate Onboarding Link</h3>
                  <p className="text-xs text-[var(--color-ink-muted)] mt-0.5">The client will securely submit their details for your review.</p>
                </div>
              </div>

              {liveCount !== null && liveCount > 0 && (
                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-start gap-2">
                  <Clock size={14} className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <p className="text-xs font-medium text-blue-700 dark:text-blue-300">You have {liveCount} live invite {liveCount === 1 ? "link" : "links"}.</p>
                </div>
              )}

              <div className="p-4 rounded-xl bg-[var(--color-surface-hover)]/50 border border-[var(--color-surface-border)] space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Who are you inviting? <span className="text-[9px] font-normal normal-case">(optional)</span></p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="relative">
                    <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)] pointer-events-none" />
                    <input type="text" value={expectedName} onChange={(e) => setExpectedName(e.target.value)} placeholder="Client name" maxLength={255} className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-surface-border)] text-sm text-[var(--color-ink)] placeholder-[var(--color-ink-subtle)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all" />
                  </div>
                  <div className="relative">
                    <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)] pointer-events-none" />
                    <input type="tel" value={expectedPhone} onChange={(e) => setExpectedPhone(e.target.value)} placeholder="Phone number" maxLength={50} className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-surface-border)] text-sm text-[var(--color-ink)] placeholder-[var(--color-ink-subtle)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--color-ink-muted)] mb-1.5">Link Validity</label>
                <select required className="w-full px-3 py-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-surface-border)] text-sm text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all appearance-none" value={ttl} onChange={(e) => setTtl(Number(e.target.value))}>
                  <option value={1}>1 day</option><option value={7}>7 days</option><option value={14}>14 days</option><option value={30}>30 days</option>
                </select>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button type="button" onClick={onCancel} className="w-full sm:flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-[var(--color-ink)] bg-[var(--color-surface-hover)] hover:bg-[var(--color-surface-hover)]/80 transition-all active:scale-[0.98]">Cancel</button>
                <button type="submit" disabled={inviteLoading} className="w-full sm:flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]">
                  {inviteLoading ? <><Loader2 size={16} className="animate-spin" /> Generating...</> : <><Link2 size={16} /> Generate Link</>}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6 max-w-lg mx-auto">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400 mb-3"><Check size={32} /></div>
                <h3 className="text-lg font-bold text-[var(--color-ink)]">Invite Link Ready!</h3>
                <p className="text-sm text-[var(--color-ink-muted)] mt-1">{invite.expected_name ? `For ${invite.expected_name}` : "Share this link with your client."}</p>
              </div>

              <div className="flex flex-col items-center gap-3 p-4 rounded-xl bg-white border border-[var(--color-surface-border)]">
                <QRCodeSVG value={linkFor(invite)} size={160} bgColor="#ffffff" fgColor="#0f172a" level="M" />
                <p className="text-[10px] font-semibold text-slate-600 flex items-center gap-1.5"><QrCode size={12} /> Walk-in client? Let them scan to onboard.</p>
              </div>

              <div className="p-4 rounded-xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)]">
                <code className="block text-xs text-[var(--color-ink)] break-all text-center font-mono bg-[var(--color-surface)] p-3 rounded-lg border border-[var(--color-surface-border)]">{linkFor(invite)}</code>
                <p className="text-[10px] text-[var(--color-ink-subtle)] mt-3 flex items-center justify-center gap-1.5"><Clock size={10} /> Single-use · expires {new Date(invite.expires_at).toLocaleDateString()}</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button onClick={handleCopy} className="flex flex-col items-center gap-2 p-3 rounded-xl border border-[var(--color-surface-border)] hover:border-[var(--color-primary)]/50 hover:bg-[var(--color-primary)]/5 transition-all active:scale-95">
                  {copied ? <Check size={18} className="text-emerald-500" /> : <Copy size={18} className="text-[var(--color-ink-muted)]" />}
                  <span className="text-[10px] font-bold text-[var(--color-ink)]">Copy</span>
                </button>
                <button onClick={shareWhatsApp} className="flex flex-col items-center gap-2 p-3 rounded-xl border border-[var(--color-surface-border)] hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all active:scale-95">
                  <MessageCircle size={18} className="text-emerald-500" /><span className="text-[10px] font-bold text-[var(--color-ink)]">WhatsApp</span>
                </button>
                <button onClick={shareSms} className="flex flex-col items-center gap-2 p-3 rounded-xl border border-[var(--color-surface-border)] hover:border-amber-500/50 hover:bg-amber-500/5 transition-all active:scale-95">
                  <MessageSquare size={18} className="text-amber-500" /><span className="text-[10px] font-bold text-[var(--color-ink)]">SMS</span>
                </button>
                <button onClick={shareEmail} className="flex flex-col items-center gap-2 p-3 rounded-xl border border-[var(--color-surface-border)] hover:border-blue-500/50 hover:bg-blue-500/5 transition-all active:scale-95">
                  <Mail size={18} className="text-blue-500" /><span className="text-[10px] font-bold text-[var(--color-ink)]">Email</span>
                </button>
              </div>

              <button onClick={() => setInvite(null)} className="w-full px-4 py-2.5 rounded-xl text-sm font-bold text-[var(--color-ink)] bg-[var(--color-surface-hover)] hover:bg-[var(--color-surface-hover)]/80 transition-all active:scale-[0.98]">Generate Another Link</button>
            </div>
          )
        ) : (
          <NewClientForm
            mode="create"
            loading={manualLoading}
            formData={formData}
            avatarFile={avatarFile} setAvatarFile={setAvatarFile}
            idFrontFile={idFrontFile} setIdFrontFile={setIdFrontFile}
            idBackFile={idBackFile} setIdBackFile={setIdBackFile}
            dlFrontFile={dlFrontFile} setDlFrontFile={setDlFrontFile}
            updateField={updateField}
            handleSubmit={handleManualSubmit}
            fieldErrors={fieldErrors}
          />
        )}
      </div>
    </div>
  );
}
