// src/components/financials/contracts/ContractsTable.tsx
"use client";

import { useRouter } from "next/navigation";
import {
  FileText,
  Download,
  Copy,
  Send,
  Ban,
  RotateCcw,
  CalendarDays,
  User,
  PenLine,
  CheckCircle2,
  ChevronRight,
  ArrowUpRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import DataTable, { RowAction } from "@/components/ui/DataTable";
import CardGrid from "@/components/ui/CardGrid";

export type ContractStatus = "draft" | "sent" | "signed" | "void";

export interface ContractItem {
  id: number;
  contract_number: string;
  booking_id?: number;
  booking_number?: string;
  client_name?: string;
  client_phone?: string;
  status: ContractStatus;
  created_at?: string;
  signed_at?: string;
  pdf_url?: string;
  public_token?: string;
}

interface ContractsTableProps {
  data: ContractItem[];
  allData?: ContractItem[];
  onDownload: (id: number) => void;
  onCopyLink: (id: number) => void;
  onSend: (id: number) => void;
  onVoid: (id: number) => void;
  onGenerate?: (bookingId: number) => void;
}

const statusStyles: Record<ContractStatus, { bg: string; text: string }> = {
  draft: { bg: "bg-amber-500/10", text: "text-amber-600 dark:text-amber-400" },
  sent: { bg: "bg-blue-500/10", text: "text-blue-600 dark:text-blue-400" },
  signed: { bg: "bg-[var(--color-success-bg)]", text: "text-[var(--color-success-text)]" },
  void: { bg: "bg-[var(--color-danger-bg)]", text: "text-[var(--color-danger-text)]" },
};

// ✅ Premium per-status icons for the pill
const statusIcons: Record<ContractStatus, LucideIcon> = {
  draft: PenLine,
  sent: Send,
  signed: CheckCircle2,
  void: Ban,
};

const statusLabels: Record<ContractStatus, string> = {
  draft: "Draft",
  sent: "Sent",
  signed: "Signed",
  void: "Void",
};

const formatDateShort = (dateStr?: string) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "—";
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getFullYear()).slice(-2)}`;
};

export default function ContractsTable({
  data,
  allData,
  onDownload,
  onCopyLink,
  onSend,
  onVoid,
  onGenerate,
}: ContractsTableProps) {
  const router = useRouter();

  const mobileItems = allData || data;

  const getContractActions = (contract: ContractItem): RowAction<ContractItem>[] => {
    const actions: RowAction<ContractItem>[] = [];
    const isVoid = contract.status === "void";

    // ✅ Void contracts: only show "Regenerate Contract"
    if (isVoid) {
      if (onGenerate && contract.booking_id) {
        actions.push({
          label: "Regenerate Contract",
          icon: RotateCcw,
          variant: "primary",
          onClick: () => onGenerate(contract.booking_id!),
        });
      }
      return actions;
    }

    // ✅ Non-void contracts: show normal actions
    actions.push(
      {
        label: "Download PDF",
        icon: Download,
        variant: "default",
        onClick: () => onDownload(contract.id),
      },
      {
        label: "Copy Sign Link",
        icon: Copy,
        variant: "default",
        onClick: () => onCopyLink(contract.id),
      }
    );

    if (contract.status !== "signed") {
      actions.push({
        label: "Send Contract",
        icon: Send,
        variant: "primary",
        separator: true,
        onClick: () => onSend(contract.id),
      });
    }

    actions.push({
      label: "Void Contract",
      icon: Ban,
      variant: "danger",
      separator: true,
      onClick: () => onVoid(contract.id),
    });

    return actions;
  };

  // ✅ Helper to get the Primary Action Button based on status
  const getPrimaryAction = (contract: ContractItem) => {
    if (contract.status === "draft") {
      return {
        label: "Send Contract",
        icon: Send,
        onClick: () => onSend(contract.id),
      };
    }
    if (contract.status === "sent") {
      return {
        label: "Download PDF",
        icon: Download,
        onClick: () => onDownload(contract.id),
      };
    }
    if (contract.status === "void") {
      return null;
    }
    // Signed
    return {
      label: "Download PDF",
      icon: Download,
      onClick: () => onDownload(contract.id),
    };
  };

  return (
    <div className="w-full">
      {/* ✅ MOBILE: Premium Contract CardGrid with Glass Effect */}
      <div className="block md:hidden">
        <CardGrid
          data={mobileItems}
          getCardId={(c) => c.id}
          compact={true}
          showGlassEffect={true}
          cardClassName="!p-3 hover:!border-[var(--color-primary)]/40 hover:shadow-[0_12px_40px_rgba(0,0,0,0.1)] transition-all duration-300"
          containerClassName="px-2 pb-4"
          maxHeight="calc(100vh - 160px)"
          
          renderCardHeader={({ item }) => {
            return (
              <div 
                className="flex items-center justify-between w-full cursor-pointer"
                onClick={() => {
                  if (item.booking_id) {
                    router.push(`/dashboard/bookings/${item.booking_id}`);
                  }
                }}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {/* Premium Icon Container with Glow */}
                  <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-primary)]/20 to-[var(--color-primary)]/5 border border-[var(--color-primary)]/20 flex items-center justify-center shadow-md">
                      <FileText size={16} className="text-[var(--color-primary)]" />
                    </div>
                    {/* Live Status Indicator */}
                    <div className="absolute -top-0.5 -right-0.5">
                      <div className={`w-3 h-3 rounded-full ${
                        item.status === 'signed' ? 'bg-emerald-500' :
                        item.status === 'sent' ? 'bg-blue-500' :
                        item.status === 'draft' ? 'bg-amber-500' :
                        'bg-red-500'
                      } ring-2 ring-[var(--color-surface)] shadow-sm`} />
                    </div>
                  </div>
                  
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-[var(--color-ink)] truncate tracking-tight">
                        {item.contract_number || `C20260${item.id}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <User size={10} className="text-[var(--color-ink-subtle)] flex-shrink-0" />
                      <span className="text-[10px] text-[var(--color-ink-muted)] truncate">
                        {item.client_name || "Unassigned Client"}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-1 flex-shrink-0">
                  <ChevronRight size={16} className="text-[var(--color-ink-subtle)]" />
                </div>
              </div>
            );
          }}
          
          renderCardBody={({ item }) => {
            const primaryAction = getPrimaryAction(item);
            
            return (
              <div className="mt-3 pt-3 border-t border-[var(--color-surface-border)]/60">
                
                {/* Key Details Section */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="text-[9px] font-semibold text-[var(--color-ink-subtle)] uppercase tracking-wider mb-0.5">
                      Booking Ref
                    </span>
                    <p className="text-xs font-bold text-[var(--color-ink)] truncate font-mono">
                      {item.booking_number ? `#${item.booking_number}` : "—"}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 min-w-0">
                    <CalendarDays size={11} className="text-[var(--color-ink-subtle)] flex-shrink-0" />
                    <span className="text-[10px] font-semibold text-[var(--color-ink-muted)]">
                      {item.signed_at ? formatDateShort(item.signed_at) : formatDateShort(item.created_at)}
                    </span>
                    <span className="text-[8px] text-[var(--color-ink-subtle)]">
                      ({item.signed_at ? 'Signed' : 'Created'})
                    </span>
                  </div>
                </div>

                {/* Status Pill */}
                <div className="flex items-center justify-between mb-3">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wide ${
                    item.status === 'signed' ? 'bg-[var(--color-success-bg)] text-[var(--color-success-text)]' :
                    item.status === 'sent' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' :
                    item.status === 'draft' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' :
                    'bg-[var(--color-danger-bg)] text-[var(--color-danger-text)]'
                  } shadow-sm`}>
                    {item.status === 'signed' && <CheckCircle2 size={9} className="flex-shrink-0 opacity-90" />}
                    {item.status === 'sent' && <Send size={9} className="flex-shrink-0 opacity-90" />}
                    {item.status === 'draft' && <PenLine size={9} className="flex-shrink-0 opacity-90" />}
                    {item.status === 'void' && <Ban size={9} className="flex-shrink-0 opacity-90" />}
                    {statusLabels[item.status]}
                  </span>
                </div>

                {/* Premium Primary Action Button */}
                {primaryAction && (
                  <button
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      primaryAction.onClick(); 
                    }}
                    className="w-full mt-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[var(--color-primary)]/10 hover:bg-[var(--color-primary)]/20 border border-[var(--color-primary)]/20 text-[var(--color-primary-text)] transition-all active:scale-[0.98] text-[11px] font-bold"
                  >
                    {primaryAction.icon && <primaryAction.icon size={13} />}
                    {primaryAction.label}
                    <ArrowUpRight size={13} className="opacity-70" />
                  </button>
                )}
              </div>
            );
          }}
          
          rowActions={getContractActions}
        />
      </div>

      {/* ✅ DESKTOP: Reusable DataTable */}
      <div className="hidden md:block">
        <DataTable
          data={data}
          columns={[
            {
              header: "Contract",
              accessorKey: "contract_number",
              cell: ({ row }) => {
                const c = row.original;
                return (
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] flex items-center justify-center text-[var(--color-ink-subtle)] shrink-0">
                      <FileText size={16} />
                    </div>
                    <div className="min-w-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (c.booking_id) {
                            router.push(`/dashboard/bookings/${c.booking_id}`);
                          }
                        }}
                        className="text-sm font-semibold text-[var(--color-ink)] truncate hover:text-[var(--color-primary)] transition-colors text-left"
                      >
                        {c.contract_number || `C20260${c.id}`}
                      </button>
                    </div>
                  </div>
                );
              },
            },
            {
              header: "Booking Ref",
              accessorKey: "booking_number",
              cell: ({ row }) => (
                <span className="text-sm font-medium text-[var(--color-ink)] font-mono">
                  {row.original.booking_number ? `#${row.original.booking_number}` : "—"}
                </span>
              ),
            },
            {
              header: "Client",
              accessorKey: "client_name",
              cell: ({ row }) => (
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[var(--color-ink)] truncate">
                    {row.original.client_name || "Unassigned Client"}
                  </p>
                </div>
              ),
            },
            {
              header: "Status",
              accessorKey: "status",
              cell: ({ row }) => {
                const c = row.original;
                const style = statusStyles[c.status] || statusStyles.draft;
                const StatusIcon = statusIcons[c.status] || FileText;
                return (
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${style.bg} ${style.text}`}>
                    <StatusIcon size={10} className="flex-shrink-0" />
                    {statusLabels[c.status] || c.status}
                  </span>
                );
              },
            },
            {
              header: "Date Signed",
              accessorKey: "signed_at",
              cell: ({ row }) => {
                const c = row.original;
                return (
                  <p className="text-sm font-medium text-[var(--color-ink-muted)] truncate whitespace-nowrap">
                    {formatDateShort(c.signed_at || c.created_at)}
                  </p>
                );
              },
            },
          ]}
          rowActions={getContractActions}
          getRowId={(c) => c.id}
          onRowClick={(c) => {
            if (c.booking_id) {
              router.push(`/dashboard/bookings/${c.booking_id}`);
            }
          }}
          loading={false}
          emptyMessage="No contracts found"
          currentPage={1}
          totalPages={1}
          totalItems={data.length}
          pageSize={7}
          onPageChange={() => {}}
          viewMode="desktop"
        />
      </div>
    </div>
  );
}
