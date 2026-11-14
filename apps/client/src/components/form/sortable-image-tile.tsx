"use client";

import React from "react";
import { Check, GripVertical, Star, XIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { UIImage } from "./types";

export interface SortableImageTileProps {
  item: UIImage;
  index: number;
  isOverlay?: boolean;
  overlaySize?: { width: number; height: number } | null;
  isCover?: boolean;
  canSelectCover?: boolean;
  disabled?: boolean;
  variant?: "default" | "studio";
  onOpenLightbox: (index: number) => void;
  onSelectCover?: (index: number) => void;
  onRemove: (id: string) => void;
}

export function SortableImageTile({
  item,
  index,
  isOverlay = false,
  overlaySize,
  isCover = false,
  canSelectCover = false,
  disabled = false,
  variant = "default",
  onOpenLightbox,
  onSelectCover,
  onRemove,
}: SortableImageTileProps) {
  const isStudio = variant === "studio";

  return (
    <div
      role={isOverlay ? undefined : "button"}
      tabIndex={isOverlay ? undefined : 0}
      className={cn(
        "bg-accent/50 group border-border hover:bg-accent/70 relative flex aspect-square shrink-0 items-center justify-center overflow-hidden rounded-lg border shadow-none transition-all duration-200 hover:z-10 data-[dragging=true]:z-50",
        isOverlay && "ring-primary z-50 scale-105 shadow-xl ring-2",
        isStudio && isCover && "ring-primary border-primary ring-2"
      )}
      style={
        isOverlay && overlaySize
          ? {
              width: overlaySize.width,
              height: overlaySize.height,
            }
          : undefined
      }
      onClick={isOverlay ? undefined : () => onOpenLightbox(index)}
      onKeyDown={
        isOverlay
          ? undefined
          : (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onOpenLightbox(index);
              }
            }
      }
    >
      <img
        src={item.src || "/placeholder.svg"}
        className="pointer-events-none size-full rounded-md object-cover select-none"
        alt={item.alt}
      />

      {isStudio ? (
        <>
          {/* Cover Badge at bottom - Studio Mode */}
          {isCover && (
            <div className="bg-primary/95 text-primary-foreground absolute inset-x-1.5 bottom-1.5 z-10 flex items-center justify-center gap-1 rounded py-0.5 text-center text-[10px] font-semibold shadow-sm backdrop-blur-xs sm:py-1 sm:text-[11px]">
              <Star className="size-3 fill-current" />
              <span>Ảnh bìa</span>
            </div>
          )}

          {/* Top-Right Checkbox: checked when isCover, clicking selects cover */}
          {canSelectCover && !isOverlay && (
            <button
              type="button"
              onPointerDown={(event) => event.stopPropagation()}
              onClick={(event) => {
                event.stopPropagation();
                onSelectCover?.(index);
              }}
              title={isCover ? "Ảnh bìa hiện tại" : "Chọn làm ảnh bìa"}
              className={cn(
                "absolute top-1.5 right-1.5 z-10 flex size-5.5 cursor-pointer items-center justify-center rounded transition-all sm:top-2 sm:right-2",
                isCover
                  ? "bg-primary text-primary-foreground ring-primary-foreground/30 shadow-xs ring-1"
                  : "border border-white/50 bg-black/40 text-transparent hover:border-white hover:text-white/70"
              )}
            >
              <Check
                className={cn(
                  "size-3.5 stroke-[3]",
                  isCover ? "opacity-100" : "opacity-0 hover:opacity-50"
                )}
              />
            </button>
          )}

          {/* Top-Left: Drag handle and Delete button */}
          <div className="pointer-events-none absolute top-1.5 left-1.5 z-10 flex size-5.5 items-center justify-center rounded bg-black/60 text-white/90 opacity-0 shadow-sm transition-opacity group-hover:opacity-100 sm:top-2 sm:left-2">
            <GripVertical className="size-3.5" />
          </div>

          {!disabled && !isOverlay && (
            <button
              type="button"
              onPointerDown={(event) => event.stopPropagation()}
              onClick={(event) => {
                event.stopPropagation();
                onRemove(item.id);
              }}
              title="Xóa ảnh này"
              className="hover:bg-destructive absolute bottom-1.5 left-1.5 z-10 flex size-5.5 cursor-pointer items-center justify-center rounded bg-black/60 text-white/80 opacity-0 transition-opacity group-hover:opacity-100 hover:text-white"
            >
              <XIcon className="size-3" />
            </button>
          )}
        </>
      ) : (
        <>
          {/* Source indicator badge */}
          <span
            className={cn(
              "absolute start-2 bottom-2 rounded-sm px-1.5 py-0.5 text-[10px] font-medium",
              item.source === "existing"
                ? "bg-background/80 text-foreground"
                : "bg-primary/80 text-primary-foreground"
            )}
          >
            {item.source === "existing" ? "Saved" : "New"}
          </span>

          <div className="bg-background/80 text-muted-foreground pointer-events-none absolute start-2 top-2 flex size-8 items-center justify-center rounded-full opacity-100 shadow-sm sm:size-6 sm:opacity-0 sm:group-hover:opacity-100">
            <GripVertical className="size-4 sm:size-3.5" />
          </div>

          {canSelectCover && !isOverlay && (
            <Button
              onPointerDown={(event) => event.stopPropagation()}
              onClick={(event) => {
                event.stopPropagation();
                onSelectCover?.(index);
              }}
              variant={isCover ? "default" : "outline"}
              size="icon"
              type="button"
              disabled={disabled}
              aria-label={
                isCover ? "Current cover image" : "Set as cover image"
              }
              className={cn(
                "absolute end-2 top-2 size-8 rounded-full shadow-sm sm:size-6",
                !isCover &&
                  "bg-background/80 opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
              )}
            >
              <Star
                className={cn("size-4 sm:size-3.5", isCover && "fill-current")}
              />
            </Button>
          )}

          {/* Remove Button */}
          {!disabled && !isOverlay && (
            <Button
              onPointerDown={(event) => event.stopPropagation()}
              onClick={(event) => {
                event.stopPropagation();
                onRemove(item.id);
              }}
              variant="outline"
              size="icon"
              type="button"
              aria-label="Remove image"
              className={cn(
                "bg-background/80 absolute size-8 rounded-full opacity-100 shadow-sm sm:size-6 sm:opacity-0 sm:group-hover:opacity-100",
                canSelectCover ? "end-2 bottom-2" : "end-2 top-2"
              )}
            >
              <XIcon className="size-4 sm:size-3.5" />
            </Button>
          )}
        </>
      )}
    </div>
  );
}
