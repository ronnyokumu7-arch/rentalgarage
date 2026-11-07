// src/components/tasks/EntitySelector.tsx
import { MagnifyingGlass as Search, User, Car, Calendar, CheckCircle as CheckCircle2, } from "@phosphor-icons/react/ssr";
import type { User as UserType, Client, Vehicle, Booking } from "@/lib/types";
import type { TabType, RelatedEntity } from "@/hooks/tasks/useCreateTask";

interface Props {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  activeTab: TabType;
  setActiveTab: (t: TabType) => void;
  users: UserType[];
  clients: Client[];
  vehicles: Vehicle[];
  bookings: Booking[];
  assignedTo: number | null;
  setAssignedTo: (id: number | null) => void;
  relatedEntity: RelatedEntity;
  setRelatedEntity: (e: RelatedEntity) => void;
}

export default function EntitySelector({
  searchQuery, setSearchQuery, activeTab, setActiveTab,
  users, clients, vehicles, bookings,
  assignedTo, setAssignedTo, relatedEntity, setRelatedEntity
}: Props) {
  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="relative mb-3">
        <Search size={14} className="absolute left-3 top-2.5 text-slate-400" aria-hidden="true" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search..."
          className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-lg mb-3">
        {(["users", "clients", "vehicles", "bookings"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`flex-1 px-2 py-1 rounded-md text-[10px] font-bold capitalize transition-all ${
              activeTab === tab ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar max-h-[300px]">
        {activeTab === "users" && users.map((u) => (
          <button
            key={u.id}
            type="button"
            onClick={() => setAssignedTo(u.id)}
            className={`w-full flex items-center gap-2 p-2 rounded-lg border text-left transition-all ${
              assignedTo === u.id ? "bg-indigo-50 border-indigo-300 ring-1 ring-indigo-500" : "bg-white border-slate-200 hover:border-slate-300"
            }`}
          >
            <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600 flex-shrink-0">
              {u.full_name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-900 truncate">{u.full_name}</p>
              <p className="text-[10px] text-slate-500 truncate">{u.job_title || u.role}</p>
            </div>
            {assignedTo === u.id && <CheckCircle2 size={14} className="text-indigo-600 flex-shrink-0" aria-hidden="true" />}
          </button>
        ))}

        {activeTab === "clients" && clients.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setRelatedEntity({ type: "client", id: c.id, label: c.full_name })}
            className={`w-full flex items-center gap-2 p-2 rounded-lg border text-left transition-all ${
              relatedEntity.type === "client" && relatedEntity.id === c.id ? "bg-indigo-50 border-indigo-300 ring-1 ring-indigo-500" : "bg-white border-slate-200 hover:border-slate-300"
            }`}
          >
            <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0"><User size={12} aria-hidden="true" /></div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-900 truncate">{c.full_name}</p>
              <p className="text-[10px] text-slate-500 truncate">{c.phone}</p>
            </div>
            {relatedEntity.type === "client" && relatedEntity.id === c.id && <CheckCircle2 size={14} className="text-indigo-600 flex-shrink-0" aria-hidden="true" />}
          </button>
        ))}

        {activeTab === "vehicles" && vehicles.map((v) => (
          <button
            key={v.id}
            type="button"
            onClick={() => setRelatedEntity({ type: "vehicle", id: v.id, label: v.plate_number })}
            className={`w-full flex items-center gap-2 p-2 rounded-lg border text-left transition-all ${
              relatedEntity.type === "vehicle" && relatedEntity.id === v.id ? "bg-indigo-50 border-indigo-300 ring-1 ring-indigo-500" : "bg-white border-slate-200 hover:border-slate-300"
            }`}
          >
            <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0"><Car size={12} aria-hidden="true" /></div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-900 truncate">{v.plate_number}</p>
              <p className="text-[10px] text-slate-500 truncate">{v.make} {v.model}</p>
            </div>
            {relatedEntity.type === "vehicle" && relatedEntity.id === v.id && <CheckCircle2 size={14} className="text-indigo-600 flex-shrink-0" aria-hidden="true" />}
          </button>
        ))}

        {activeTab === "bookings" && bookings.map((b) => (
          <button
            key={b.id}
            type="button"
            onClick={() => setRelatedEntity({ type: "booking", id: b.id, label: b.booking_number || `#${b.id}` })}
            className={`w-full flex items-center gap-2 p-2 rounded-lg border text-left transition-all ${
              relatedEntity.type === "booking" && relatedEntity.id === b.id ? "bg-indigo-50 border-indigo-300 ring-1 ring-indigo-500" : "bg-white border-slate-200 hover:border-slate-300"
            }`}
          >
            <div className="w-7 h-7 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600 flex-shrink-0"><Calendar size={12} aria-hidden="true" /></div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-900 truncate">{b.booking_number || `#${b.id}`}</p>
              <p className="text-[10px] text-slate-500 truncate">{new Date(b.start_date).toLocaleDateString()}</p>
            </div>
            {relatedEntity.type === "booking" && relatedEntity.id === b.id && <CheckCircle2 size={14} className="text-indigo-600 flex-shrink-0" aria-hidden="true" />}
          </button>
        ))}
      </div>
    </div>
  );
}
