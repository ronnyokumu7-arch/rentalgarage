"use client";
import PageHeader from "@/components/ui/PageHeader";
import { Palette } from "lucide-react";

export default function ThemePage() {
  return (
    <div>
      <PageHeader
        title="Appearance"
        subtitle="Customize your dashboard look and feel"
        icon={Palette}
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Settings", href: "/dashboard/settings" },
          { label: "Theme" },
        ]}
      />
      <div className="p-12 text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
        <Palette size={32} className="mx-auto text-gray-400 mb-2" />
        <p className="text-sm font-medium text-gray-900">Theme Settings</p>
        <p className="text-xs text-gray-500 mt-1">Coming soon: Light/Dark mode and brand colors.</p>
      </div>
    </div>
  );
}
