"use client";
import { useRouter } from "next/navigation";
import { Building2, ShieldCheck, Palette, Settings, Users, Globe, Lock } from "lucide-react"; // ✅ Added Settings to imports
import PageHeader from "@/components/ui/PageHeader";
import SectionCard from "@/components/ui/SectionCard";

export default function SettingsHubPage() {
  const router = useRouter();

  const settingsModules = [
    {
      title: "Business Profile",
      description: "Manage your agency details, logo, and contact information.",
      icon: Building2,
      color: "blue",
      href: "/dashboard/settings/business",
      stats: { total: "Active", label: "Agency Status", trend: "Verified" },
      features: ["Company Info", "Logo Upload", "Contact Details", "Billing Address"],
    },
    {
      title: "Team & Roles",
      description: "Invite staff members and manage their access permissions.",
      icon: ShieldCheck,
      color: "emerald",
      href: "/dashboard/settings/roles",
      stats: { total: "3", label: "Active Roles", trend: "2 Admins" },
      features: ["Invite Users", "Role Management", "Access Control", "Activity Logs"],
    },
    {
      title: "Appearance",
      description: "Customize the dashboard theme and regional preferences.",
      icon: Palette,
      color: "purple",
      href: "/dashboard/settings/theme",
      stats: { total: "Light", label: "Current Theme", trend: "System Default" },
      features: ["Light/Dark Mode", "Brand Colors", "Date Formats", "Currency"],
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
        title="Settings"
        subtitle="Configure your agency profile, team access, and preferences"
        icon={Settings} // ✅ Now works because it's imported
        breadcrumb={[{ label: "Dashboard", href: "/dashboard" }, { label: "Settings" }]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {settingsModules.map((module) => {
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
                  <Globe size={14} className="text-blue-600" />
                  <span className="text-xs font-medium text-gray-700">{module.stats.trend}</span>
                </div>

                <div className="space-y-2">
                  {module.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-2 text-xs text-gray-600">
                      <Lock size={12} className="text-gray-400" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <button
                  className={`w-full mt-6 py-2.5 rounded-lg ${colors.bg} ${colors.text} text-sm font-semibold hover:opacity-80 transition-opacity flex items-center justify-center gap-2`}
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(module.href);
                  }}
                >
                  Configure {module.title}
                </button>
              </div>
            </SectionCard>
          );
        })}
      </div>
    </div>
  );
}
