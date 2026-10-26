// src/components/fleet/CollectionsModal.tsx
"use client";

import { useState, useEffect } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import {
  getCollections,
  createCollection,
  updateCollection,
  deleteCollection,
} from "@/lib/collections";
import type { Vehicle } from "@/lib/types";

interface CollectionsModalProps {
  open: boolean;
  onClose: () => void;
  vehicles: Vehicle[];
  initialVehicleIds?: number[];
  editingCollectionId?: string | null;
}

export default function CollectionsModal({
  open,
  onClose,
  vehicles,
  initialVehicleIds = [],
  editingCollectionId = null,
}: CollectionsModalProps) {
  const [name, setName] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>(initialVehicleIds);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  useEffect(() => {
    if (!open) return;
    const list = getCollections();
    if (editingCollectionId) {
      const existing = list.find((c) => c.id === editingCollectionId);
      if (existing) {
        setName(existing.name);
        setSelectedIds(existing.vehicleIds);
        setIsEditing(true);
      }
    } else {
      setName("");
      setSelectedIds(initialVehicleIds);
      setIsEditing(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editingCollectionId]);

  if (!open) return null;

  const toggleVehicle = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  };

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) return;

    if (isEditing && editingCollectionId) {
      updateCollection(editingCollectionId, {
        name: trimmed,
        vehicleIds: selectedIds,
      });
    } else {
      createCollection(trimmed, selectedIds);
    }

    onClose();
  };

  const handleDelete = () => {
    if (editingCollectionId) {
      deleteCollection(editingCollectionId);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full sm:max-w-md max-h-[90vh] flex flex-col bg-[var(--color-surface)] rounded-t-3xl sm:rounded-2xl shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-surface-border)]">
          <h2 className="text-sm font-bold text-[var(--color-ink)]">
            {isEditing ? "Edit Collection" : "New Collection"}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)]"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-3 flex-1 overflow-y-auto">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">
              Collection Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. 4x4 SUVs, Economy Cars"
              className="mt-1 w-full h-10 px-3 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface-hover)] text-sm text-[var(--color-ink)] outline-none focus:border-[var(--color-primary)]"
              autoFocus
            />
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">
              Vehicles ({selectedIds.length})
            </label>
            <div className="mt-1 max-h-64 overflow-y-auto rounded-xl border border-[var(--color-surface-border)]">
              {vehicles.length === 0 && (
                <p className="p-4 text-xs text-[var(--color-ink-muted)] italic">
                  No vehicles available.
                </p>
              )}
              {vehicles.map((v) => {
                const checked = selectedIds.includes(v.id);
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => toggleVehicle(v.id)}
                    className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-left border-b border-[var(--color-surface-border)]/50 last:border-b-0 transition-colors ${
                      checked
                        ? "bg-[var(--color-primary)]/5"
                        : "hover:bg-[var(--color-surface-hover)]"
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[var(--color-ink)] truncate">
                        {v.make} {v.model}
                      </p>
                      <p className="text-[10px] font-mono text-[var(--color-ink-muted)]">
                        {v.plate_number?.toUpperCase()}
                      </p>
                    </div>
                    <span
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        checked
                          ? "border-[var(--color-primary)] bg-[var(--color-primary)]"
                          : "border-[var(--color-surface-border)]"
                      }`}
                    >
                      {checked && (
                        <svg
                          viewBox="0 0 12 12"
                          className="w-2.5 h-2.5 text-white"
                          fill="none"
                        >
                          <path
                            d="M2 6l3 3 5-6"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[var(--color-surface-border)] flex items-center gap-2">
          {isEditing && (
            <button
              onClick={handleDelete}
              className="h-10 px-3 rounded-xl text-xs font-bold text-rose-600 bg-rose-500/10 hover:bg-rose-500/20 flex items-center gap-1.5"
            >
              <Trash2 size={14} />
              Delete
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 h-10 rounded-xl text-xs font-bold text-[var(--color-ink-muted)] bg-[var(--color-surface-hover)] hover:bg-[var(--color-surface-border)]"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="flex-1 h-10 rounded-xl text-xs font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            <Plus size={14} />
            {isEditing ? "Save" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}
