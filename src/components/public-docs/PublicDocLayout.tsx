// src/components/public-docs/PublicDocLayout.tsx
import React from "react";

interface PublicDocLayoutProps {
  children: React.ReactNode;
  footerText?: string;
}

export default function PublicDocLayout({ children, footerText }: PublicDocLayoutProps) {
  return (
    <div 
      className="min-h-screen py-12 px-4 sm:px-6"
      style={{
        background: 'linear-gradient(160deg, #FAF9F7 0%, #FFFFFF 50%, #F5F3F0 100%)',
      }}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        {children}
        
        {/* Footer */}
        <div className="text-center pt-8 pb-4">
          <p 
            className="text-xs"
            style={{ color: '#78716C' }}
          >
            {footerText || "© 2024 Rental Garage. Secure Document Portal."}
          </p>
        </div>
      </div>
    </div>
  );
}
