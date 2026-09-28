"use client";

import { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import SignatureCanvas from "react-signature-canvas";
import { FileText, CheckCircle, AlertCircle, Loader2, PenLine, RotateCcw, Download } from "lucide-react";
import { investorContractsApi } from "@/lib/api/investorContracts";
import toast from "react-hot-toast";

export default function PublicContractSigningPage() {
  const params = useParams();
  const token = params.token as string;

  const sigCanvasRef = useRef<SignatureCanvas>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [contract, setContract] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);
  const [agreed, setAgreed] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 600, height: 200 });

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) setCanvasSize({ width: containerRef.current.offsetWidth, height: 200 });
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  useEffect(() => {
    const fetchContract = async () => {
      try {
        const data = await investorContractsApi.getPublic(token);
        setContract(data);
      } catch (error: any) {
        toast.error(error.response?.data?.detail || "Invalid or expired contract link.");
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchContract();
  }, [token]);

  const handleClear = () => { sigCanvasRef.current?.clear(); setIsEmpty(true); };

  const handleSign = async () => {
    if (isEmpty || !agreed) {
      toast.error("Please draw your signature and agree to the terms.");
      return;
    }
    setSigning(true);
    try {
      const signatureDataUrl = sigCanvasRef.current?.toDataURL("image/png");
      if (!signatureDataUrl) throw new Error("Failed to capture signature");

      await investorContractsApi.signByToken(token, { signature: signatureDataUrl, signer_role: "investor" });
      toast.success("Contract signed successfully!");
      
      const updated = await investorContractsApi.getPublic(token);
      setContract(updated);
      handleClear();
      setAgreed(false);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to sign contract.");
    } finally {
      setSigning(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" /></div>;
  if (!contract) return <div className="min-h-screen flex items-center justify-center p-4 text-center"><AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" /><h1 className="text-xl font-bold mb-2">Invalid or Expired Link</h1></div>;

  if (contract.signed_by_investor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-surface)] p-4">
        <div className="bg-white border border-[var(--color-surface-border)] rounded-2xl shadow-xl p-8 max-w-md w-full text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto"><CheckCircle className="w-8 h-8 text-emerald-500" /></div>
          <div>
            <h1 className="text-xl font-bold mb-2">Contract Fully Executed</h1>
            <p className="text-[var(--color-ink-muted)]">You have successfully signed contract <strong>{contract.contract_number}</strong>.</p>
          </div>
          <div className="flex flex-col gap-3">
            <a href={`${process.env.NEXT_PUBLIC_API_URL}/investor-contracts/${contract.id}/pdf`} target="_blank" className="w-full px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] transition-all flex items-center justify-center gap-2">
              <Download size={16} /> Download Signed PDF
            </a>
            <button onClick={() => window.close()} className="w-full px-4 py-2.5 rounded-xl text-sm font-bold text-[var(--color-ink)] bg-[var(--color-surface-hover)] hover:bg-[var(--color-surface-hover)]/80 transition-all">Close Window</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-surface)] py-8 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-white border border-[var(--color-surface-border)] rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)]"><FileText size={20} /></div>
            <div><h1 className="text-lg font-bold">Lease Agreement</h1><p className="text-xs text-[var(--color-ink-muted)]">Contract #{contract.contract_number}</p></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div><p className="text-xs font-semibold text-[var(--color-ink-muted)] uppercase mb-1">Investor</p><p className="font-medium">{contract.investor_name}</p></div>
            <div><p className="text-xs font-semibold text-[var(--color-ink-muted)] uppercase mb-1">Vehicle</p><p className="font-medium">{contract.vehicle_details}</p></div>
            <div><p className="text-xs font-semibold text-[var(--color-ink-muted)] uppercase mb-1">Lease Rate</p><p className="font-medium">KES {Number(contract.lease_rate).toLocaleString()} / {contract.lease_rate_type}</p></div>
            <div><p className="text-xs font-semibold text-[var(--color-ink-muted)] uppercase mb-1">Duration</p><p className="font-medium">{contract.duration_months ? `${contract.duration_months} Month(s)` : 'Per Active Rental Day'}</p></div>
          </div>
          <a href={`${process.env.NEXT_PUBLIC_API_URL}/investor-contracts/${contract.id}/pdf`} target="_blank" className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--color-primary)] hover:underline transition-colors">
            <Download size={14} /> View / Download Contract PDF
          </a>
        </div>

        <div className="bg-white border border-[var(--color-surface-border)] rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold flex items-center gap-2"><PenLine size={18} className="text-[var(--color-primary)]" /> Investor Signature</h2>
          <div ref={containerRef} className="w-full h-[200px] relative mb-2">
            <SignatureCanvas
              ref={sigCanvasRef} penColor="#0f172a" minWidth={0.5} maxWidth={2.5} dotSize={1} throttle={0} velocityFilterWeight={0.1}
              canvasProps={{
                width: canvasSize.width, height: canvasSize.height,
                className: "w-full h-full border-2 border-dashed border-[var(--color-surface-border)] rounded-xl bg-white cursor-crosshair",
                style: { touchAction: "none" } // ✅ CRITICAL MOBILE FIX
              }}
              onBegin={() => setIsEmpty(false)}
              onEnd={() => { if (sigCanvasRef.current?.isEmpty()) setIsEmpty(true); }}
            />
            <button type="button" onClick={handleClear} className="absolute top-2 right-2 p-1.5 rounded-lg bg-[var(--color-surface-hover)] hover:bg-red-500/10 text-[var(--color-ink-muted)] hover:text-red-500 transition-colors"><RotateCcw size={16} /></button>
          </div>
          {isEmpty && <p className="text-xs text-[var(--color-ink-subtle)] text-center -mt-2">Please draw your signature in the box above.</p>}
          
          <label className="flex items-start gap-3 p-3 rounded-xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] cursor-pointer">
            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 w-4 h-4 rounded border-[var(--color-surface-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]/20" />
            <span className="text-xs text-[var(--color-ink)] leading-relaxed">By checking this box and signing above, I acknowledge that I have read, understood, and agree to be legally bound by the terms of this lease agreement.</span>
          </label>

          <button onClick={handleSign} disabled={signing || isEmpty || !agreed} className="w-full px-4 py-3 rounded-xl text-sm font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
            {signing ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
            {signing ? "Securing Signature..." : "Sign Contract"}
          </button>
        </div>
      </div>
    </div>
  );
}
