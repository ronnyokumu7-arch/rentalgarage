"use client";
import { HardHat as Construction } from "@phosphor-icons/react/ssr";

interface PlaceholderPageProps {
  title: string;
  description?: string;
}

export default function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5 bg-accent-bg">
        <Construction size={28} className="text-accent-dark" weight="light" aria-hidden="true" />
      </div>
      <h1 className="text-2xl font-bold text-ink mb-2">{title}</h1>
      <p className="text-ink-muted text-sm max-w-sm">
        {description || "This page is under construction. Check back soon as we build it out."}
      </p>
    </div>
  );
}
