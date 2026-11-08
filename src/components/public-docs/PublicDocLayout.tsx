import React from "react";

interface PublicDocLayoutProps {
  children: React.ReactNode;
  footerText?: string;
}

export default function PublicDocLayout({
  children,
  footerText,
}: PublicDocLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 py-12 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {children}
        <div className="text-center pt-8 pb-4">
          <p className="text-xs text-slate-400">
            {footerText || "© 2024 Rental Manager. Secure Document Portal."}
          </p>
        </div>
      </div>
    </div>
  );
}
