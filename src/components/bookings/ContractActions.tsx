"use client";
import { useState } from "react";
import { Copy, CheckCircle2, Eye, Download, Share2 } from "lucide-react";
import toast from "react-hot-toast";
import type { Contract } from "@/lib/types";

interface ContractActionsProps {
  contract: Contract;
  onView: () => void;
  onDownload: () => void;
  onShare: () => void;
}

export default function ContractActions({ contract, onView, onDownload, onShare }: ContractActionsProps) {
  const [isCopied, setIsCopied] = useState(false);

  // Points to the public contract page we built
  const url = `${window.location.origin}/contract/${contract.share_token}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setIsCopied(true);
      toast.success("Link copied to clipboard");
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={handleCopy}
        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
        title="Copy Link"
      >
        {isCopied ? <CheckCircle2 size={16} className="text-emerald-500" /> : <Copy size={16} />}
      </button>
      <button
        onClick={onView}
        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
        title="View Contract"
      >
        <Eye size={16} />
      </button>
      <button
        onClick={onDownload}
        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
        title="Download PDF"
      >
        <Download size={16} />
      </button>
      <button
        onClick={onShare}
        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
        title="Share Contract"
      >
        <Share2 size={16} />
      </button>
    </div>
  );
}
