// src/components/public-docs/SignaturePad.tsx
"use client";
import { useRef, useState, useEffect, forwardRef, useImperativeHandle, useCallback } from 'react';

export interface SignaturePadRef {
  getSignature: () => string | null;
  clear: () => void;
  isEmpty: () => boolean;
}

interface Point { x: number; y: number; pressure: number; }

const mid = (a: Point, b: Point): Point => ({
  x: (a.x + b.x) / 2,
  y: (a.y + b.y) / 2,
  pressure: (a.pressure + b.pressure) / 2,
});

const SignaturePad = forwardRef<SignaturePadRef>((_, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasDrawn, setHasDrawn] = useState(false);
  const drawingRef = useRef(false);
  const strokeRef = useRef<Point[]>([]);

  const isEmpty = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return true;
    const ctx = canvas.getContext('2d');
    if (!ctx) return true;
    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
    for (let i = 3; i < data.length; i += 4) if (data[i] > 0) return false;
    return true;
  }, []);

  const clear = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    strokeRef.current = [];
    setHasDrawn(false);
  }, []);

  useImperativeHandle(ref, () => ({
    getSignature: () => (isEmpty() ? null : canvasRef.current?.toDataURL('image/png') ?? null),
    clear,
    isEmpty,
  }));

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#1C1917';
    ctx.fillStyle = '#1C1917';
  }, []);

  const getPoint = (e: React.PointerEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height),
      pressure: e.pressure > 0 ? e.pressure : 0.5,
    };
  };

  // ✅ Pen-like variable width from pressure
  const widthFor = (p: number) => 2 + p * 2.5;

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    // ✅ Capture: strokes survive fast movement past edges; up always fires here
    canvas.setPointerCapture(e.pointerId);
    drawingRef.current = true;
    strokeRef.current = [getPoint(e)];
    setHasDrawn(true);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    e.preventDefault();
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    const point = getPoint(e);
    const pts = strokeRef.current;
    const last = pts[pts.length - 1];

    // Jitter gate: ignore micro-movements < 2px
    if (Math.hypot(point.x - last.x, point.y - last.y) < 2) return;

    pts.push(point);

    if (pts.length === 2) {
      // First segment: p0 → mid(p0,p1)
      const m = mid(pts[0], pts[1]);
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      ctx.lineTo(m.x, m.y);
      ctx.lineWidth = widthFor(pts[1].pressure);
      ctx.stroke();
    } else if (pts.length >= 3) {
      // ✅ CONTINUOUS midpoint smoothing: mid(a,b) → quad(b) → mid(b,c)
      // Each segment starts EXACTLY where the previous one ended → no dashes
      const [a, b, c] = pts.slice(-3);
      const m1 = mid(a, b);
      const m2 = mid(b, c);
      ctx.beginPath();
      ctx.moveTo(m1.x, m1.y);
      ctx.quadraticCurveTo(b.x, b.y, m2.x, m2.y);
      ctx.lineWidth = widthFor(b.pressure);
      ctx.stroke();
    }
  };

  const onPointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    e.preventDefault();
    drawingRef.current = false;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    const pts = strokeRef.current;

    if (pts.length === 1) {
      // ✅ DOT: tap with no movement → one perfect filled dot
      const p = pts[0];
      ctx.beginPath();
      ctx.arc(p.x, p.y, 1.5 + p.pressure * 2, 0, Math.PI * 2);
      ctx.fill();
    } else if (pts.length >= 2) {
      // ✅ TAIL: complete the stroke to the final pointer position
      const a = pts[pts.length - 2];
      const b = pts[pts.length - 1];
      const m = mid(a, b);
      ctx.beginPath();
      ctx.moveTo(m.x, m.y);
      ctx.lineTo(b.x, b.y);
      ctx.lineWidth = widthFor(b.pressure);
      ctx.stroke();
    }

    strokeRef.current = [];
    canvas?.releasePointerCapture(e.pointerId);
  };

  return (
    <div className="relative w-full">
      <canvas
        ref={canvasRef}
        width={800}
        height={250}
        className="w-full h-48 rounded-xl cursor-crosshair touch-none"
        style={{
          backgroundColor: '#FFFFFF',
          display: 'block',
          border: '2px dashed rgba(28, 25, 23, 0.18)',
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      />
      {!hasDrawn && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span 
            className="text-sm font-medium tracking-wide uppercase"
            style={{ color: '#78716C' }}
          >
            Sign Here
          </span>
        </div>
      )}
    </div>
  );
});

SignaturePad.displayName = 'SignaturePad';
export default SignaturePad;
