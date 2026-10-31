"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import AddClientWorkspace from "@/components/client/AddClientWorkspace";

export default function NewClientPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push("/dashboard/clients");
  };

  const handleCancel = () => {
    router.push("/dashboard/clients");
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Page Header */}
      <div className="sticky top-0 z-30 bg-[var(--color-bg)]/80 backdrop-blur-md border-b border-[var(--color-surface-border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={handleCancel}
                className="p-2 rounded-lg hover:bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-all active:scale-95"
                aria-label="Go back"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-lg font-bold text-[var(--color-ink)]">New Client</h1>
                <p className="text-xs text-[var(--color-ink-muted)] hidden sm:block">Invite a client via secure link or add them manually</p>
              </div>
            </div>
          and a clean, spacious layout.
          </div>
        </div>
      </div>

      {/* Page Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-sm p-4 sm:p-6 lg:p-8">
          <AddClientWorkspace onSuccess={handleSuccess} onCancel={handleCancel} />
        </div>
      </main>
    </div>
  );
}
