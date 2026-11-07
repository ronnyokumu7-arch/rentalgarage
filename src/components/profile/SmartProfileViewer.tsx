// src/components/profile/SmartProfileViewer.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  CircleNotch as Loader2, User, Car, CalendarDots as CalendarDays, FileText, WarningCircle as AlertCircle
} from "@phosphor-icons/react/ssr";
import { clientsApi } from "@/lib/api/clients";
import { vehiclesApi } from "@/lib/api/vehicles";
import { bookingsApi } from "@/lib/api/bookings";
import type { Task, Client, Vehicle, Booking } from "@/lib/types";

// Import the specialized inline viewers (assuming these exist or will be built)
import InlineClientViewer from "./viewers/InlineClientViewer";
import InlineVehicleViewer from "./viewers/InlineVehicleViewer";
import InlineBookingViewer from "./viewers/InlineBookingViewer";

interface SmartProfileViewerProps {
  task: Task;
}

// ✅ BRAND-ALIGNED CONFIGURATION: Uses semantic colors and icons
const TARGET_CONFIG: Record<string, { 
  icon: React.ElementType; 
  label: string; 
  colorClass: string; // Background/Border/Ttext combo
  accentColor: string; // For primary actions/highlights
}> = {
  vehicle: { 
    icon: Car, 
    label: "Vehicle Profile", 
    colorClass: "bg-[var(--color-primary)]/5 border-[var(--color-primary)]/10 text-[var(--color-primary)]",
    accentColor: "text-[var(--color-primary)]"
  },
  client: { 
    icon: User, 
    label: "Client Profile", 
    colorClass: "bg-emerald-500/5 border-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    accentColor: "text-emerald-600 dark:text-emerald-400"
  },
  booking: { 
    icon: CalendarDays, 
    label: "Booking Profile", 
    colorClass: "bg-purple-500/5 border-purple-500/10 text-purple-600 dark:text-purple-400",
    accentColor: "text-purple-600 dark:text-purple-400"
  },
};

export default function SmartProfileViewer({ task }: SmartProfileViewerProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientData, setClientData] = useState<Client | null>(null);
  const [vehicleData, setVehicleData] = useState<Vehicle | null>(null);
  const [bookingData, setBookingData] = useState<Booking | null>(null);

  const config = TARGET_CONFIG[task.target_type || ""] || { 
    icon: FileText, 
    label: "Task Context", 
    colorClass: "bg-slate-500/5 border-slate-500/10 text-slate-600 dark:text-slate-400",
    accentColor: "text-slate-600 dark:text-slate-400"
  };
  
  const Icon = config.icon;

  const fetchData = useCallback(async () => {
    if (!task.target_type || !task.target_id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      if (task.target_type === "client") {
        setClientData(await clientsApi.get(task.target_id));
      } else if (task.target_type === "vehicle") {
        setVehicleData(await vehiclesApi.get(task.target_id));
      } else if (task.target_type === "booking") {
        setBookingData(await bookingsApi.get(task.target_id));
      }
    } catch (error) {
      console.error(error);
      setError("Resource not found or access denied.");
    } finally {
      setLoading(false);
    }
  }, [task.target_type, task.target_id]);

  useEffect(() => { 
    fetchData(); 
  }, [fetchData]);

  // ✅ PREMIUM EMPTY STATE: When no task is selected or target is missing
  if (!task.target_type || !task.target_id) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-[var(--color-surface)] rounded-2xl border border-dashed border-[var(--color-surface-border)]">
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${config.colorClass}`}>
          <Icon size={32} aria-hidden="true" />
        </div>
        <h3 className="text-sm font-bold text-[var(--color-ink)] mb-1">No Resource Linked</h3>
        <p className="text-xs text-[var(--color-ink-muted)] max-w-[200px]">
          Select a task with a valid Client, Vehicle, or Booking link to view its full profile here.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] overflow-hidden">
      
      {/* ✅ UNIFIED HEADER: Shows what we are loading/viewing */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/30">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${config.colorClass}`}>
            <Icon size={20} aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[var(--color-ink)]">{config.label}</h3>
            <p className="text-[11px] text-[var(--color-ink-muted)]">ID: #{task.target_id}</p>
          </div>
        </div>
        {loading && <Loader2 size={16} className="animate-spin text-[var(--color-ink-subtle)]" aria-hidden="true" />}
      </div>

      {/* ✅ CONTENT AREA: Dynamic based on resource type */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
        
        {error ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center mb-3">
              <AlertCircle size={24} className="text-rose-500" aria-hidden="true" />
            </div>
            <p className="text-sm font-semibold text-rose-600 dark:text-rose-400 mb-1">Load Failed</p>
            <p className="text-xs text-[var(--color-ink-muted)] max-w-[240px]">{error}</p>
            <button 
              onClick={fetchData}
              className="mt-4 px-4 py-2 rounded-lg text-xs font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            {/* Render Specialized Viewers with consistent wrapper styling */}
            {task.target_type === "client" && clientData && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <InlineClientViewer client={clientData} taskId={task.id} task={task} onRefresh={fetchData} />
              </div>
            )}
            
            {task.target_type === "vehicle" && vehicleData && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <InlineVehicleViewer vehicle={vehicleData} task={task} onRefresh={fetchData} />
              </div>
            )}
            
            {task.target_type === "booking" && bookingData && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <InlineBookingViewer booking={bookingData} task={task} onRefresh={fetchData} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
