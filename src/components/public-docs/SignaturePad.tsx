// src/components/public-docs/SignaturePad.tsx
"use client";
import { useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react';

export interface SignaturePadRef {
  getSignature: () => string | null;
  clear: () => void;
  isEmpty: () => boolean;
}

const SignaturePad = forwardRef<SignaturePadRef>((_, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  const isEmpty = () => {
    const canvas = canvasRef.current;
    if (!canvas) return true;
    const blank = document.createElement('canvas');
    blank.width = canvas.width;
    blank.height = canvas.height;
    return canvas.toDataURL() === blank.toDataURL();
  };

  useImperativeHandle(ref, () => ({
    getSignature: () => {
      if (isEmpty()) return null;
      return canvasRef.current?.toDataURL('image/png') || null;
    },
    clear: () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (ctx && canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setHasDrawn(false);
      }
    },
    isEmpty: isEmpty
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // ✅ CRITICAL: Clear the canvas to make it transparent
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#09090b';
  }, []);

  // ✅ NEW: Ensure canvas is transparent on resize or any re-render
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Make sure canvas stays transparent
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Redraw existing signature if needed
    // This prevents white background from appearing
  }, []);

  const getCoords = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ('touches' in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    const { x, y } = getCoords(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    const { x, y } = getCoords(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => setIsDrawing(false);

  return (
    <div className="relative w-full">
      <canvas
        ref={canvasRef}
        width={800}
        height={250}
        className="w-full h-48 border-2 border-dashed border-surface-border-strong rounded-xl cursor-crosshair touch-none"
        style={{ 
          background: 'transparent !important',
          backgroundColor: 'transparent !important',
          display: 'block',
        }}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
      />
      {!hasDrawn && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-ink-subtle text-sm font-medium tracking-wide uppercase">Sign Here</span>
        </div>
      )}
    </div>
  );
});

SignaturePad.displayName = 'SignaturePad';
export default SignaturePad;
