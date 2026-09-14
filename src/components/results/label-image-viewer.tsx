"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "cn";
import { labelImageSrc } from "@/lib/blob";
import { RotateCcw, ZoomIn, ZoomOut } from "lucide-react";

const MIN_ZOOM = 1;
const MAX_ZOOM = 5;
const ZOOM_STEP = 0.25;

interface LabelImageViewerProps {
  src: string;
  alt?: string;
  /** Stretch to fill a height-constrained parent (analyst/detail card). */
  fill?: boolean;
  hideTitle?: boolean;
}

export function LabelImageViewer({
  src,
  alt = "Analyzed label",
  fill = false,
  hideTitle = false,
}: LabelImageViewerProps) {
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragging = useRef(false);
  const lastPoint = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef(zoom);

  zoomRef.current = zoom;

  const clampZoom = (value: number) =>
    Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.round(value * 100) / 100));

  const setZoomLevel = useCallback((next: number) => {
    const clamped = clampZoom(next);
    setZoom(clamped);
    if (clamped <= MIN_ZOOM) {
      setOffset({ x: 0, y: 0 });
    }
  }, []);

  const zoomIn = () => setZoomLevel(zoom + ZOOM_STEP);
  const zoomOut = () => setZoomLevel(zoom - ZOOM_STEP);
  const reset = () => {
    setZoom(MIN_ZOOM);
    setOffset({ x: 0, y: 0 });
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
      setZoomLevel(zoomRef.current + delta);
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [setZoomLevel]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (zoom <= MIN_ZOOM) return;
    // Don't start pan when clicking controls
    if ((e.target as HTMLElement).closest("[data-zoom-controls]")) return;
    dragging.current = true;
    lastPoint.current = { x: e.clientX, y: e.clientY };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    const dx = e.clientX - lastPoint.current.x;
    const dy = e.clientY - lastPoint.current.y;
    lastPoint.current = { x: e.clientX, y: e.clientY };
    setOffset((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    dragging.current = false;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore if capture already released
    }
  };

  const zoomPercent = Math.round(zoom * 100);

  return (
    <div className={cn("flex flex-col gap-3", fill && "flex-1 min-h-0")}>
      {!hideTitle && (
        <h3 className="text-sm font-medium text-muted-foreground">Label Image</h3>
      )}

      <div
        ref={containerRef}
        data-label-image
        className={cn(
          "relative rounded-lg overflow-hidden border border-border bg-muted/30 select-none",
          fill
            ? "flex-1 min-h-[360px] lg:min-h-0"
            : "h-[min(36rem,70vh)] min-h-[360px]",
          zoom > MIN_ZOOM ? "cursor-grab active:cursor-grabbing" : "cursor-default"
        )}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div
          className="absolute inset-0 flex items-center justify-center p-2"
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
            transformOrigin: "center center",
            transition: dragging.current ? "none" : "transform 75ms ease-out",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={labelImageSrc(src)}
            alt={alt}
            draggable={false}
            className="max-w-full max-h-full object-contain pointer-events-none"
          />
        </div>

        {/* Floating zoom controls on the image */}
        <div
          data-zoom-controls
          className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1 rounded-lg border border-border bg-card/95 p-1 shadow-lg backdrop-blur-sm"
        >
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={zoomOut}
            disabled={zoom <= MIN_ZOOM}
            className="h-8 gap-1.5 px-2.5 text-foreground hover:bg-accent hover:text-foreground disabled:opacity-40"
            title="Zoom out"
          >
            <ZoomOut className="h-4 w-4" />
            <span className="text-xs hidden sm:inline">Zoom out</span>
          </Button>
          <span className="min-w-[3rem] px-1 text-center text-xs tabular-nums font-medium text-foreground">
            {zoomPercent}%
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={zoomIn}
            disabled={zoom >= MAX_ZOOM}
            className="h-8 gap-1.5 px-2.5 text-foreground hover:bg-accent hover:text-foreground disabled:opacity-40"
            title="Zoom in"
          >
            <ZoomIn className="h-4 w-4" />
            <span className="text-xs hidden sm:inline">Zoom in</span>
          </Button>
          <div className="mx-0.5 h-5 w-px bg-border" />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={reset}
            disabled={zoom <= MIN_ZOOM && offset.x === 0 && offset.y === 0}
            className="h-8 w-8 p-0 text-foreground hover:bg-accent hover:text-foreground disabled:opacity-40"
            title="Reset zoom"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
