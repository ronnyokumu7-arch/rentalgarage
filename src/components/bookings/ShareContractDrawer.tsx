"use client";
import { X, Mail, MessageCircle } from "lucide-react";
import type { Client } from "@/lib/types";

interface ShareContractDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client;
  onShare: (method: 'email' | 'whatsapp') => void;
}

export default function ShareContractDrawer({ isOpen, onClose, client, onShare }: ShareContractDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      {/* Drawer Panel */}
      <div className="relative w-full max-w-sm bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900">Share Contract</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded transition-colors">
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 space-y-3">
          <p className="text-xs text-slate-500 mb-4">
            Send the contract to <span className="font-semibold text-slate-900">{client.full_name}</span> via:
          </p>
          
          <button
            onClick={() => onShare('email')}
            className="w-full flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all group"
          >
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
              <Mail size={16} className="text-blue-600" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-slate-900">Email</p>
              <p className="text-xs text-slate-500">{client.email || "No email on file"}</p>
            </div>
          </button>

          <button
            onClick={() => onShare('whatsapp')}
            className="w-full flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-green-300 hover:bg-green-50 transition-all group"
          >
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center group-hover:bg-green-200 transition-colors">
              <MessageCircle size={16} className="text-green-600" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-slate-900">WhatsApp</p>
              <p className="text-xs text-slate-500">{client.phone || "No phone on file"}</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
