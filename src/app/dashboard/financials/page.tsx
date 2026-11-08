"use client";
import { useRouter } from "next/navigation";
import { FileText, Receipt, DollarSign, TrendingUp, Clock, CheckCircle, AlertCircle } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import SectionCard from "@/components/ui/SectionCard";

export default function FinancialsPage() {
  const router = useRouter();

  const financialModules = [
    {
      title: "Contracts",
      description: "Manage rental agreements and digital signatures",
      icon: FileText,
      color: "blue",
      href: "/dashboard/financials/contracts",
      stats: { total: "12", label: "Active Contracts", trend: "+2 this month" },
      features: ["Generate contracts", "E-signatures", "Track status", "Download PDFs"],
    },
    {
      title: "Invoices",
      description: "Track billing, payments, and invoice lifecycle",
      icon: Receipt,
      color: "emerald",
      href: "/dashboard/financials/invoices",
      stats: { total: "KES 45.2K", label: "Unpaid Amount", trend: "5 overdue" },
      features: ["Auto-generate", "Send invoices", "Track payments", "Void invoices"],
    },
    {
      title: "Payments",
      description: "Record and manage payment transactions",
      icon: DollarSign,
      color: "purple",
      href: "/dashboard/financials/payments",
      stats: { total: "KES 128.5K", label: "Revenue (This Month)", trend: "+12.5% from last month" },
      features: ["Record payments", "M-Pesa integration", "Payment history", "Receipts"],
    },
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; border: string; text: string; icon: string }> = {
      blue: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-900", icon: "text-blue-600" },
      emerald: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-900", icon: "text-emerald-600" },
      purple: { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-900", icon: "text-purple-600" },
    };
    return colors[color] || colors.blue;
  };

  return (
    <div>
      <PageHeader
        title="Financials"
        subtitle="Manage contracts, invoices, and payments in one place"
        icon={TrendingUp}
        breadcrumb={[{ label: "Dashboard", href: "/dashboard" }, { label: "Financials" }]}
      />

      {/* ✅ Financial Report Stat Cards (No outer container, placed at the top) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
          <p className="text-xs text-emerald-800 font-semibold mb-1">Total Revenue</p>
          <p className="text-xl font-bold text-emerald-900">KES 128.5K</p>
        </div>
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
          <p className="text-xs text-amber-800 font-semibold mb-1">Pending Payments</p>
          <p className="text-xl font-bold text-amber-900">KES 45.2K</p>
        </div>
        <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
          <p className="text-xs text-blue-800 font-semibold mb-1">Active Contracts</p>
          <p className="text-xl font-bold text-blue-900">12</p>
        </div>
        <div className="p-4 rounded-xl bg-purple-50 border border-purple-200">
          <p className="text-xs text-purple-800 font-semibold mb-1">Overdue Invoices</p>
          <p className="text-xl font-bold text-purple-900">5</p>
        </div>
      </div>

      {/* Premium Tiles Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {financialModules.map((module) => {
          const Icon = module.icon;
          const colors = getColorClasses(module.color);

          return (
            <SectionCard
              key={module.title}
              className="!p-0 overflow-hidden cursor-pointer group hover:shadow-lg transition-all duration-300 border-2 hover:border-opacity-50"
              onClick={() => router.push(module.href)}
            >
              <div className={`${colors.bg} ${colors.border} border-b p-6`}>
                <div className="flex items-start justify-between">
                  <div className={`w-12 h-12 rounded-xl ${colors.bg} ${colors.icon} flex items-center justify-center`}>
                    <Icon size={24} />
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl font-bold ${colors.text}`}>{module.stats.total}</p>
                    <p className="text-xs text-gray-600">{module.stats.label}</p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2">{module.title}</h3>
                <p className="text-sm text-gray-600 mb-4">{module.description}</p>

                <div className="flex items-center gap-2 mb-4">
                  {module.stats.trend.includes("+") ? (
                    <TrendingUp size={14} className="text-emerald-600" />
                  ) : module.stats.trend.includes("overdue") ? (
                    <AlertCircle size={14} className="text-amber-600" />
                  ) : (
                    <Clock size={14} className="text-blue-600" />
                  )}
                  <span className="text-xs font-medium text-gray-700">{module.stats.trend}</span>
                </div>

                <div className="space-y-2">
                  {module.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-2 text-xs text-gray-600">
                      <CheckCircle size={12} className="text-gray-400" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                {/* ✅ CTA Button with explicit redirect */}
                <button
                  className={`w-full mt-6 py-2.5 rounded-lg ${colors.bg} ${colors.text} text-sm font-semibold hover:opacity-80 transition-opacity flex items-center justify-center gap-2`}
                  onClick={(e) => {
                    e.stopPropagation(); // Prevents double-navigation since the card is also clickable
                    router.push(module.href);
                  }}
                >
                  Manage {module.title}
                </button>
              </div>
            </SectionCard>
          );
        })}
      </div>
    </div>
  );
}
