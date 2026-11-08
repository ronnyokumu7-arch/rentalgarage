"use client";
import { useState, useEffect } from "react";
import { Calendar, Clock, FileText, CheckCircle2, PlayCircle, Flag } from "lucide-react";
import { bookingsApi } from "@/lib/api/bookings";
import type { Booking } from "@/lib/types";

interface VehicleBookingTimelineProps {
  vehicleId: number;
  currentBookingId?: number;
  currentStatus?: string;
  shareToken?: string | null;
  startDate: string;
  endDate: string;
}

export default function VehicleBookingTimeline({
  vehicleId,
  currentBookingId,
  currentStatus = "pending",
  shareToken,
  startDate,
  endDate,
}: VehicleBookingTimelineProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTimeline = async () => {
      try {
        const data = await bookingsApi.list({ vehicle_id: vehicleId });
        setBookings(data);
      } catch (error) {
        console.error("Failed to load timeline", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTimeline();
  }, [vehicleId]);

  if (loading) return <div className="h-32 bg-slate-100 rounded-xl animate-pulse" />;

  const sortedBookings = [...bookings].sort(
    (a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
  );

  if (sortedBookings.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
          <Calendar size={20} className="text-blue-600" />
          Vehicle Utilization Timeline
        </h3>
        <div className="h-24 bg-slate-50 rounded-xl border border-dashed border-slate-200 flex items-center justify-center text-sm text-gray-500">
          No booking history available for this vehicle.
        </div>
      </div>
    );
  }

  const minTime = Math.min(...sortedBookings.map((b) => new Date(b.start_date).getTime()));
  const maxTime = Math.max(...sortedBookings.map((b) => new Date(b.end_date).getTime()));
  const totalDuration = Math.max(maxTime - minTime, 1000 * 60 * 60 * 24);
  const minDate = new Date(minTime);
  const maxDate = new Date(minTime + totalDuration);

  const getPosition = (dateStr: string) => ((new Date(dateStr).getTime() - minTime) / totalDuration) * 100;
  const getWidth = (start: string, end: string) =>
    Math.max(((new Date(end).getTime() - new Date(start).getTime()) / totalDuration) * 100, 1.5);

  const currentDuration = Math.max(
    1,
    Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))
  );

  // Lifecycle Logic
  const journeySteps = [
    { id: "quotation", label: "Quotation", icon: FileText },
    { id: "confirmed", label: "Confirmed", icon: CheckCircle2 },
    { id: "active", label: "In Progress", icon: PlayCircle },
    { id: "completed", label: "Completed", icon: Flag },
  ];

  const getStepState = (stepId: string): 'completed' | 'current' | 'future' => {
    if (stepId === 'quotation') {
      if (['confirmed', 'active', 'completed'].includes(currentStatus)) return 'completed';
      if (currentStatus === 'pending' && shareToken) return 'current';
      return 'future';
    }
    if (stepId === 'confirmed') {
      if (['confirmed', 'active', 'completed'].includes(currentStatus)) return 'completed';
      if (currentStatus === 'pending' && shareToken) return 'current';
      return 'future';
    }
    if (stepId === 'active') {
      if (['active', 'completed'].includes(currentStatus)) return 'completed';
      if (currentStatus === 'confirmed') return 'current';
      return 'future';
    }
    if (stepId === 'completed') {
      if (currentStatus === 'completed') return 'completed';
      if (currentStatus === 'active') return 'current';
      return 'future';
    }
    return 'future';
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Calendar size={20} className="text-blue-600" />
            Vehicle Utilization Timeline
          </h3>
          <p className="text-sm text-gray-500 mt-1">Visualizing booking density and availability gaps</p>
        </div>
      </div>

      {/* TRACK */}
      <div className="relative h-16 bg-slate-50 rounded-xl border border-slate-100 overflow-hidden mb-4">
        <div className="absolute inset-0 flex justify-between px-2 pointer-events-none">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="w-px h-full bg-slate-200/50" />
          ))}
        </div>
        {sortedBookings.map((booking) => {
          const isCurrent = booking.id === currentBookingId;
          const left = getPosition(booking.start_date);
          const width = getWidth(booking.start_date, booking.end_date);
          let bgClass = "bg-blue-500 hover:bg-blue-600";
          if (isCurrent) bgClass = "bg-gradient-to-r from-amber-500 to-orange-500 ring-2 ring-amber-200 z-20 shadow-lg";
          else if (booking.status === "completed" || booking.status === "cancelled") bgClass = "bg-slate-400 opacity-60 hover:opacity-80";
          
          return (
            <div
              key={booking.id}
              className={`absolute top-3 h-10 rounded-lg flex items-center justify-center text-[10px] font-bold text-white shadow-md transition-all ${bgClass}`}
              style={{ left: `${left}%`, width: `${width}%` }}
              title={`Booking #${booking.id} - ${booking.status}`}
            >
              #{booking.id}
            </div>
          );
        })}
      </div>

      {/* DATES */}
      <div className="relative h-4 text-[10px] font-medium text-gray-400 mb-6 px-1">
        <div className="absolute left-0">{minDate.toLocaleDateString()}</div>
        <div className="absolute left-1/2 -translate-x-1/2">
          {new Date((minDate.getTime() + maxDate.getTime()) / 2).toLocaleDateString()}
        </div>
        <div className="absolute right-0">{maxDate.toLocaleDateString()}</div>
      </div>

      {/* SPLIT BOTTOM ROW */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
        {/* Left: Booking Info */}
        <div className="flex items-start gap-3 flex-shrink-0">
          <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-200 flex-shrink-0">
            <Clock size={16} className="text-amber-600" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-gray-900">Current Booking Window</p>
            <p className="text-xs text-gray-600 mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1">
              <span>
                {new Date(startDate).toLocaleDateString()} → {new Date(endDate).toLocaleDateString()}
              </span>
              <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full font-semibold text-[10px] uppercase tracking-wide">
                {currentDuration} {currentDuration === 1 ? "Day" : "Days"}
              </span>
            </p>
          </div>
        </div>

        {/* Right: Horizontal Progress Nodes */}
        <div className="flex items-center justify-between w-full md:w-auto md:flex-1 md:pl-8 border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:ml-4">
          {journeySteps.map((step, index) => {
            const Icon = step.icon;
            const state = getStepState(step.id);
            const isCompleted = state === 'completed';
            const isCurrent = state === 'current';
            
            return (
              <div key={step.id} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                      isCompleted
                        ? "bg-emerald-500 text-white border-emerald-500"
                        : isCurrent
                        ? "bg-white text-amber-600 border-amber-500 shadow-md"
                        : "bg-white text-gray-300 border-gray-200"
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 size={20} /> : <Icon size={18} />}
                  </div>
                  <p
                    className={`text-[10px] font-bold mt-2 uppercase tracking-wide ${
                      isCompleted || isCurrent ? "text-gray-900" : "text-gray-400"
                    }`}
                  >
                    {step.label}
                  </p>
                </div>
                {index < journeySteps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-3 ${isCompleted ? "bg-emerald-500" : "bg-gray-200"}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
