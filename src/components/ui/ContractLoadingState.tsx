// src/components/ui/ContractLoadingState.tsx
"use client";

import { CircleNotch as Loader2 } from "@phosphor-icons/react/ssr";

interface Props {
  message?: string;
}

export default function ContractLoadingState({ message = "Loading contract..." }: Props) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="flex flex-col items-center gap-4 text-center">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" aria-hidden="true" />
        <p className="text-slate-500 font-medium text-sm sm:text-base">{message}</p>
      </div>
    </div>
  );
}
