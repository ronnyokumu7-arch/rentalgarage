// src/components/ui/ContractErrorState.tsx
"use client";

import { WarningCircle as AlertCircle } from "@phosphor-icons/react/ssr";

interface Props {
  message?: string;
}

export default function ContractErrorState({ message = "Contract not found or expired." }: Props) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 sm:p-6">
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-slate-200 p-6 sm:p-8 text-center">
        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="h-7 w-7 sm:h-8 sm:w-8 text-red-500" aria-hidden="true" />
        </div>
        <h1 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Contract Unavailable</h1>
        <p className="text-gray-500 text-xs sm:text-sm mb-6">{message}</p>
        <p className="text-xs text-gray-400">Please contact the rental agency for a new link.</p>
      </div>
    </div>
  );
}
