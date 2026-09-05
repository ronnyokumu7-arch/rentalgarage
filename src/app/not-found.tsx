// src/app/not-found.tsx
import Link from "next/link";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)] mb-5">
        <Compass size={28} />
      </div>
      <h1 className="text-4xl font-extrabold text-[var(--color-ink)] mb-2">Page not found</h1>
      <p className="text-sm text-[var(--color-ink-muted)] mb-8 max-w-sm">
        The page you're looking for doesn't exist or may have been moved.
      </p>
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className="px-6 py-3 rounded-xl bg-[var(--color-primary)] text-white text-sm font-bold hover:bg-[var(--color-primary-hover)] transition-all"
        >
          Go to Dashboard
        </Link>
        <Link
          href="/login"
          className="px-6 py-3 rounded-xl border border-[var(--color-surface-border)] text-[var(--color-ink)] text-sm font-semibold hover:bg-[var(--color-surface-hover)] transition-all"
        >
          Sign In
        </Link>
      </div>
    </div>
  );
}
