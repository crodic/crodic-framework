"use client";

import React, { useEffect, useRef, useState } from "react";
import { Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TagChipsInputProps {
  value?: string[];
  onChange?: (value: string[]) => void;
  placeholder?: string;
  addLabel?: string;
  maxItems?: number;
  className?: string;
  disabled?: boolean;
}

const normalizeItems = (items: string[]) =>
  items.map((item) => item.trim()).filter(Boolean);

export function TagChipsInput({
  value = [],
  onChange,
  placeholder = "",
  addLabel = "Add",
  maxItems = 30,
  className,
  disabled = false,
}: TagChipsInputProps) {
  const normalizedValue = Array.isArray(value) ? normalizeItems(value) : [];
  const valueKey = JSON.stringify(normalizedValue);

  const [rows, setRows] = useState<string[]>(normalizedValue);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const pendingFocusIndexRef = useRef<number | null>(null);

  useEffect(() => {
    const incoming = JSON.parse(valueKey) as string[];
    setRows((prev) => {
      if (JSON.stringify(normalizeItems(prev)) === valueKey) {
        return prev;
      }
      return incoming;
    });
  }, [valueKey]);

  useEffect(() => {
    if (pendingFocusIndexRef.current !== null) {
      const targetInput = inputRefs.current[pendingFocusIndexRef.current];
      pendingFocusIndexRef.current = null;
      targetInput?.focus();
    }
  }, [rows.length]);

  const commitRows = (nextRows: string[]) => {
    setRows(nextRows);
    onChange?.(normalizeItems(nextRows));
  };

  const handleUpdateRow = (index: number, nextValue: string) => {
    const nextRows = [...rows];
    nextRows[index] = nextValue;
    commitRows(nextRows);
  };

  const handleRemoveRow = (index: number) => {
    const nextRows = rows.filter((_, idx) => idx !== index);
    commitRows(nextRows);
  };

  const handleAddRow = () => {
    if (disabled || rows.length >= maxItems) return;
    const nextIndex = rows.length;
    pendingFocusIndexRef.current = nextIndex;
    setRows((prev) => [...prev, ""]);
  };

  return (
    <div className={cn("flex flex-col gap-2.5", className)}>
      {rows.map((row, index) => (
        <div key={index} className="flex items-center gap-2">
          <Input
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            value={row}
            onChange={(e) => handleUpdateRow(index, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (row.trim() && rows.length < maxItems) {
                  handleAddRow();
                }
              }
            }}
            placeholder={placeholder}
            disabled={disabled}
            className="border-input/70 bg-background/60 h-10 flex-1 rounded-xl px-3 text-sm"
          />
          {!disabled && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => handleRemoveRow(index)}
              className="border-input/70 text-muted-foreground hover:text-destructive hover:border-destructive/50 hover:bg-destructive/10 size-10 shrink-0 cursor-pointer rounded-xl transition-colors"
              aria-label={`Remove item ${index + 1}`}
            >
              <X className="size-4" />
            </Button>
          )}
        </div>
      ))}

      {!disabled && rows.length < maxItems && (
        <Button
          type="button"
          variant="outline"
          onClick={handleAddRow}
          className="border-input/70 text-muted-foreground hover:text-foreground hover:border-primary/50 hover:bg-muted/40 h-10 w-full cursor-pointer justify-center gap-1.5 rounded-xl border-dashed text-xs font-semibold transition-colors"
        >
          <Plus className="size-4" />
          <span>{addLabel}</span>
        </Button>
      )}
    </div>
  );
}
