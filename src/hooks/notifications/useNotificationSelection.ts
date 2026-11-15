import { useState, useCallback } from "react";

export function useNotificationSelection() {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const toggle = useCallback((id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const selectAll = useCallback((ids: number[]) => {
    setSelectedIds(new Set(ids));
  }, []);

  const clearAll = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const isSelected = useCallback((id: number) => selectedIds.has(id), [selectedIds]);

  const isSelectionMode = selectedIds.size > 0;

  return {
    selectedIds,
    toggle,
    selectAll,
    clearAll,
    isSelected,
    isSelectionMode,
    count: selectedIds.size,
  };
}
