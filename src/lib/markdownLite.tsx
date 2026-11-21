import React from "react";
import { brand } from "@/lib/brand";

export type BlockType = "paragraph" | "bullet" | "numbered";
export interface Block {
  type: BlockType;
  text: string;
}

export function parseBlocks(raw: string): Block[] {
  return raw
    .split("\n")
    .map((line) => {
      const t = line.trimEnd();
      const bullet = /^[-*]\s+(.*)$/.exec(t);
      if (bullet) return { type: "bullet" as BlockType, text: bullet[1] };
      
      const num = /^\d+[.)]\s+(.*)$/.exec(t);
      if (num) {
        // ✅ FIX: Check if the text after the number has a bold label (e.g. **Label:**)
        // If yes -> it's a real list item. If no -> it's a paragraph (like item 7).
        const hasBoldLabel = /\*\*[^*]+:\*\*/.test(num[1]);
        if (hasBoldLabel) return { type: "numbered" as BlockType, text: num[1] };
        return { type: "paragraph" as BlockType, text: t };
      }
      
      return { type: "paragraph" as BlockType, text: t };
    });
}

export function serializeBlocks(blocks: Block[]): string {
  return blocks
    .map((b) => {
      if (b.type === "bullet") return `- ${b.text}`;
      if (b.type === "numbered") return `1. ${b.text}`;
      return b.text;
    })
    .join("\n");
}

const INK = () => (brand.colors?.ink?.primary) || "#0f172a";
const ACCENT = () => (brand.colors?.warning?.main) || "#B45309";

const M_PARA = "0 0 5px 0";
const M_HEAD = "9px 0 4px 0";
const M_LIST = "4px 0 6px 0";
const M_ITEM = "0 0 4px 0";
const M_SUBHEAD = "8px 0 4px 0";

const NUM_LEAD_BOLD = /^\*\*(\d+[.)])\s+([^*]+?:)\*\*\s+([\s\S]+)$/;
const NUM_LEAD_PLAIN = /^(\d+[.)])\s+\*\*([^*]+?:)\*\*\s+([\s\S]+)$/;
const NUM_PLAIN = /^(\d+[.)])\s+([\s\S]+)$/;
const NUM_SUBHEAD = /^\*\*\d+[.)]\s+([^*]+?)\*\*:?\s*$/;
const FULL_HEAD_RE = /^\*\*([^*]+)\*\*$/;
const LEAD_RE = /^\*\*([^*]+?:)\*\*\s+([\s\S]+)$/;

function renderInline(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) => {
    if (p.startsWith("**") && p.endsWith("**") && p.length > 4) {
      return (
        <strong key={`s-${i}`} style={{ color: INK(), fontWeight: 700, letterSpacing: "0.01em" }}>
          {p.slice(2, -2)}
        </strong>
      );
    }
    return <React.Fragment key={`t-${i}`}>{p}</React.Fragment>;
  });
}

function leadLabel(text: string, key: string): React.ReactNode {
  return (
    <span key={key} style={{ color: INK(), fontWeight: 800, letterSpacing: "0.015em" }}>
      {text}
    </span>
  );
}

function renderRich(text: string): React.ReactNode {
  const m = LEAD_RE.exec(text);
  if (m) {
    return (
      <>
        {leadLabel(m[1], "lbl")} {renderInline(m[2])}
      </>
    );
  }
  return renderInline(text);
}

function HangRow({
  marker,
  bullet,
  children,
  margin = M_ITEM,
  indent = false,
}: {
  marker: string;
  bullet?: boolean;
  children: React.ReactNode;
  margin?: string;
  indent?: boolean;
}) {
  // ✅ FIX: Bullets get pushed right (1.5rem) to align with the TEXT of the parent number,
  // not the number itself.
  const paddingLeft = indent ? "1.5rem" : "0";
  
  return (
    <div style={{ display: "flex", gap: "6px", margin, paddingLeft }}>
      <span
        style={{
          flex: "0 0 auto",
          minWidth: "1.1em",
          fontWeight: bullet ? 400 : 800,
          color: INK(),
        }}
      >
        {marker}
      </span>
      <span style={{ flex: "1 1 auto", lineHeight: 1.5 }}>{children}</span>
    </div>
  );
}

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

  const isContract = variant === "contract";
  const headSize = isContract ? "9.5pt" : "0.82rem";
  const subheadIndent = "1.25rem";

  const flush = (key: string) => {
    if (!list.length) return;
    const items = list.map((b, i) => (
      <HangRow
        key={`${key}-li-${i}`}
        marker={listType === "bullet" ? "•" : `${i + 1}.`}
        bullet={listType === "bullet"}
        indent={listType === "bullet"} // ✅ Bullets indented
      >
        {renderRich(b.text)}
      </HangRow>
    ));
    nodes.push(
      <div key={key} style={{ margin: M_LIST }}>
        {items}
      </div>
    );
    list = [];
    listType = null;
  };

  blocks.forEach((b, i) => {
    if (b.type === "paragraph") {
      flush(`l-${i}`);
      const t = b.text.trim();
      if (!t) return;

      const nb = NUM_LEAD_BOLD.exec(t);
      const np = nb ? null : NUM_LEAD_PLAIN.exec(t);
      if (nb || np) {
        const m = (nb || np)!;
        nodes.push(
          <HangRow key={`nl-${i}`} marker={m[1]} margin={M_PARA}>
            {leadLabel(m[2], "lbl")} {renderInline(m[3])}
          </HangRow>
        );
        return;
      }

      // ✅ FIX: Catches "7. Please do not..." -> strips number, renders as paragraph.
      const npl = NUM_PLAIN.exec(t);
      if (npl) {
        nodes.push(
          <p key={`npl-${i}`} style={{ margin: M_PARA, lineHeight: 1.5 }}>
            {renderRich(npl[2])}
          </p>
        );
        return;
      }

      const ns = NUM_SUBHEAD.exec(t);
      if (ns) {
        nodes.push(
          <div key={`ns-${i}`} style={{ margin: M_SUBHEAD, paddingLeft: subheadIndent, fontWeight: 800, color: INK(), fontSize: headSize, letterSpacing: "0.01em" }}>
            {renderInline(ns[1])}
          </div>
        );
        return;
      }

      const fh = FULL_HEAD_RE.exec(t);
      if (fh) {
        nodes.push(
          <p key={`h-${i}`} style={{ margin: M_HEAD, paddingLeft: "8px", borderLeft: `2px solid ${ACCENT()}`, color: INK(), fontWeight: 800, fontSize: headSize, letterSpacing: "0.02em", lineHeight: 1.4 }}>
            {renderInline(fh[1].replace(/:$/, ""))}
          </p>
        );
        return;
      }

      const ld = LEAD_RE.exec(t);
      if (ld) {
        nodes.push(
          <p key={`p-${i}`} style={{ margin: M_PARA, lineHeight: 1.5 }}>
            {leadLabel(ld[1], "lbl")} {renderInline(ld[2])}
          </p>
        );
        return;
      }

      nodes.push(
        <p key={`p-${i}`} style={{ margin: M_PARA, lineHeight: 1.5 }}>
          {renderRich(t)}
        </p>
      );
    } else {
      if (listType && listType !== b.type) flush(`l-${i}`);
      listType = b.type;
      list.push(b);
    }
  });
  flush("l-end");

  const wrapperClass = isContract
    ? "text-[9.5pt] leading-relaxed font-medium text-[#475569]"
    : "text-sm leading-relaxed text-[var(--color-ink)]";

  return (
    <div className={wrapperClass}>
      {nodes.length ? nodes : <p className="italic text-[var(--color-ink-subtle)]">Empty clause.</p>}
    </div>
  );
}
