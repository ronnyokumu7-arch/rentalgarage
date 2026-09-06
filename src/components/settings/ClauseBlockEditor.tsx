// src/components/settings/ClauseBlockEditor.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import {
  Type, List, ListOrdered, Trash2, ChevronUp, ChevronDown, Plus,
} from "lucide-react";
import { Block, BlockType, parseBlocks, serializeBlocks } from "@/lib/markdownLite";

// ── Auto-growing single-block textarea (no raw box, wraps naturally) ────────
function AutoGrow({
  value, onChange, placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = `${el.scrollHeight}px`;
    }
  }, [value]);
  return (
    <textarea
      ref={ref}
      rows={1}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="flex-1 bg-transparent border-none outline-none resize-none overflow-hidden text-sm leading-relaxed text-[var(--color-ink)] placeholder:text-[var(--color-ink-subtle)] py-1"
    />
  );
}

const TYPE_ORDER: BlockType[] = ["paragraph", "bullet", "numbered"];

export default function ClauseBlockEditor({
  value, onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [blocks, setBlocks] = useState<Block[]>(() => {
    const b = parseBlocks(value);
    return b.length ? b : [{ type: "paragraph", text: "" }];
  });

  const commit = (next: Block[]) => {
    setBlocks(next);
    onChange(serializeBlocks(next));
  };
  const update = (i: number, patch: Partial<Block>) =>
    commit(blocks.map((b, idx) => (idx === i ? { ...b, ...patch } : b)));
  const remove = (i: number) => {
    const next = blocks.filter((_, idx) => idx !== i);
    commit(next.length ? next : [{ type: "paragraph", text: "" }]);
  };
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= blocks.length) return;
    const next = [...blocks];
    [next[i], next[j]] = [next[j], next[i]];
    commit(next);
  };
  const cycleType = (i: number) => {
    const cur = TYPE_ORDER.indexOf(blocks[i].type);
    update(i, { type: TYPE_ORDER[(cur + 1) % TYPE_ORDER.length] });
  };
  const addBelow = (i: number) => {
    const next = [...blocks];
    next.splice(i + 1, 0, { type: "paragraph", text: "" });
    commit(next);
  };

  return (
    <div className="space-y-1">
      {blocks.map((b, i) => (
        <div
          key={i}
          className="group flex items-start gap-2 rounded-lg border border-transparent px-2 py-1 transition-colors hover:border-[var(--color-surface-border)] hover:bg-[var(--color-surface-hover)]/40"
        >
          <button
            onClick={() => cycleType(i)}
            title="Cycle: Paragraph → Bullet → Numbered"
            className="mt-1 shrink-0 rounded p-1 text-[var(--color-ink-subtle)] transition-colors hover:bg-[var(--color-primary)]/10 hover:text-[var(--color-primary)]"
          >
            {b.type === "bullet" ? (
              <List className="h-3.5 w-3.5" />
            ) : b.type === "numbered" ? (
              <ListOrdered className="h-3.5 w-3.5" />
            ) : (
              <Type className="h-3.5 w-3.5" />
            )}
          </button>

          <AutoGrow
            value={b.text}
            onChange={(v) => update(i, { text: v })}
            placeholder={b.type === "paragraph" ? "Write a sentence…" : "List item…"}
          />

          <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
            <button onClick={() => move(i, -1)} className="rounded p-1 text-[var(--color-ink-subtle)] hover:bg-[var(--color-surface-hover)]">
              <ChevronUp className="h-3.5 w-3.5" />
            </button>
            <button onClick={() => move(i, 1)} className="rounded p-1 text-[var(--color-ink-subtle)] hover:bg-[var(--color-surface-hover)]">
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
            <button onClick={() => addBelow(i)} className="rounded p-1 text-[var(--color-ink-subtle)] hover:bg-[var(--color-surface-hover)]">
              <Plus className="h-3.5 w-3.5" />
            </button>
            <button onClick={() => remove(i)} className="rounded p-1 text-[var(--color-danger-text)] hover:bg-[var(--color-danger-bg)]">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ))}

      <button
        onClick={() => commit([...blocks, { type: "paragraph", text: "" }])}
        className="flex items-center gap-1 px-2 text-xs font-semibold text-[var(--color-primary)] hover:underline"
      >
        <Plus className="h-3.5 w-3.5" /> Add block
      </button>

      <p className="px-2 text-[11px] leading-relaxed text-[var(--color-ink-subtle)]">
        Click the icon left of a line to switch Paragraph → Bullet → Numbered.
        Wrap words in **double asterisks** for <strong>bold</strong>.
      </p>
    </div>
  );
}
