// src/lib/markdownLite.tsx
import React from "react";

export type BlockType = "paragraph" | "bullet" | "numbered";
export interface Block {
  type: BlockType;
  text: string;
}

/** Parse stored plain text into typed blocks. */
export function parseBlocks(raw: string): Block[] {
  return raw
    .split("\n")
    .map((line) => {
      const t = line.trimEnd();
      const bullet = /^[-*]\s+(.*)$/.exec(t);
      if (bullet) return { type: "bullet" as BlockType, text: bullet[1] };
      const num = /^\d+[.)]\s+(.*)$/.exec(t);
      if (num) return { type: "numbered" as BlockType, text: num[1] };
      return { type: "paragraph" as BlockType, text: t };
    });
}

/** Serialize blocks back to the stored plain-text format. */
export function serializeBlocks(blocks: Block[]): string {
  return blocks
    .map((b) => {
      if (b.type === "bullet") return `- ${b.text}`;
      if (b.type === "numbered") return `1. ${b.text}`; // renumbered at render
      return b.text;
    })
    .join("\n");
}

/** Render **bold** inline markers into <strong>, escaping everything else. */
function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) => {
    if (p.startsWith("**") && p.endsWith("**") && p.length > 4) {
      return <strong key={`${keyPrefix}-${i}`}>{p.slice(2, -2)}</strong>;
    }
    return <React.Fragment key={`${keyPrefix}-${i}`}>{p}</React.Fragment>;
  });
}

/**
 * Live preview renderer. Groups consecutive bullet/numbered blocks into
 * real <ul>/<ol> lists; paragraphs become <p>. Safe (no raw HTML).
 */
export function MarkdownLitePreview({
  raw,
  variant = "editor",
}: {
  raw: string;
  variant?: "editor" | "contract";
}) {
  const blocks = parseBlocks(raw);
  const nodes: React.ReactNode[] = [];
  let list: Block[] = [];
  let listType: BlockType | null = null;

  const flush = (key: string) => {
    if (!list.length) return;
    const items = list.map((b, i) => (
      <li key={`${key}-li-${i}`}>{renderInline(b.text, `${key}-li-${i}`)}</li>
    ));
    nodes.push(
      listType === "bullet" ? (
        <ul key={key} className="ml-4 list-disc space-y-0.5">{items}</ul>
      ) : (
        <ol key={key} className="ml-4 list-decimal space-y-0.5">{items}</ol>
      )
    );
    list = [];
    listType = null;
  };

  blocks.forEach((b, i) => {
    if (b.type === "paragraph") {
      flush(`l-${i}`);
      if (b.text.trim()) nodes.push(<p key={`p-${i}`}>{renderInline(b.text, `p-${i}`)}</p>);
    } else {
      if (listType && listType !== b.type) flush(`l-${i}`);
      listType = b.type;
      list.push(b);
    }
  });
  flush("l-end");

  return (
    <div
      className={
        variant === "contract"
          ? "space-y-2 text-[9.5pt] leading-relaxed font-medium text-[#475569]"
          : "space-y-2 text-sm leading-relaxed text-[var(--color-ink)]"
      }
    >
      {nodes.length ? nodes : <p className="italic text-[var(--color-ink-subtle)]">Empty clause.</p>}
    </div>
  );
}
