"use client";
import PageHeader from "@/components/ui/PageHeader";
import { ShieldCheck } from "lucide-react";

export default function RolesPage() {
  return (
    <div>
      <PageHeader
        title="Team & Roles"
        subtitle="Manage user access and permissions"
        icon={ShieldCheck}
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Settings", href: "/dashboard/settings" },
          { label: "Roles" },
        ]}
      />
      <div className="p-12 text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
        <ShieldCheck size={32} className="mx-auto text-gray-400 mb-2" />
        <p className="text-sm font-medium text-gray-900">Role Management</p>
        <p className="text-xs text-gray-500 mt-1">Coming soon: Invite staff and assign permissions.</p>
      </div>
    </div>
  );
}
