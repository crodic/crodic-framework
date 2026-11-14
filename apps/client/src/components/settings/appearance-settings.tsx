"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Check, Globe, Moon, Palette, Sun, Monitor } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function AppearanceSettings() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="space-y-6">
      {/* 1. Theme Selection matching Mockup 1 */}
      <Card className="border-border/70 bg-card/60 rounded-2xl shadow-xs">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-bold">
            <Palette className="text-primary size-4" />
            <span>Giao diện Sáng / Tối</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Tùy chỉnh tông màu giao diện phù hợp với sở thích và môi trường của
            bạn.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {/* Light Mode Card */}
            <button
              type="button"
              onClick={() => setTheme("light")}
              className={cn(
                "group bg-card hover:border-primary/50 relative flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 p-4 text-center transition-all",
                mounted && theme === "light"
                  ? "border-primary ring-primary/30 shadow-primary/10 shadow-md ring-2"
                  : "border-border/60 opacity-80 hover:opacity-100"
              )}
            >
              <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 transition-transform group-hover:scale-110">
                <Sun className="size-5" />
              </div>
              <span className="text-foreground text-xs font-bold">
                Sáng (Light)
              </span>
              {mounted && theme === "light" && (
                <span className="bg-primary text-primary-foreground absolute top-2 right-2 flex size-4 items-center justify-center rounded-full">
                  <Check className="size-2.5" />
                </span>
              )}
            </button>

            {/* Dark Mode Card */}
            <button
              type="button"
              onClick={() => setTheme("dark")}
              className={cn(
                "group bg-card hover:border-primary/50 relative flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 p-4 text-center transition-all",
                mounted && theme === "dark"
                  ? "border-primary ring-primary/30 shadow-primary/10 shadow-md ring-2"
                  : "border-border/60 opacity-80 hover:opacity-100"
              )}
            >
              <div className="bg-primary/15 text-primary flex size-10 items-center justify-center rounded-xl transition-transform group-hover:scale-110">
                <Moon className="size-5" />
              </div>
              <span className="text-foreground text-xs font-bold">
                Tối (Dark)
              </span>
              {mounted && theme === "dark" && (
                <span className="bg-primary text-primary-foreground absolute top-2 right-2 flex size-4 items-center justify-center rounded-full">
                  <Check className="size-2.5" />
                </span>
              )}
            </button>

            {/* System Mode Card */}
            <button
              type="button"
              onClick={() => setTheme("system")}
              className={cn(
                "group bg-card hover:border-primary/50 relative col-span-2 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 p-4 text-center transition-all sm:col-span-1",
                mounted && theme === "system"
                  ? "border-primary ring-primary/30 shadow-primary/10 shadow-md ring-2"
                  : "border-border/60 opacity-80 hover:opacity-100"
              )}
            >
              <div className="bg-muted text-muted-foreground flex size-10 items-center justify-center rounded-xl transition-transform group-hover:scale-110">
                <Monitor className="size-5" />
              </div>
              <span className="text-foreground text-xs font-bold">
                Theo hệ thống
              </span>
              {mounted && theme === "system" && (
                <span className="bg-primary text-primary-foreground absolute top-2 right-2 flex size-4 items-center justify-center rounded-full">
                  <Check className="size-2.5" />
                </span>
              )}
            </button>
          </div>
        </CardContent>
      </Card>

      {/* 2. Language Selection */}
      <Card className="border-border/70 bg-card/60 rounded-2xl shadow-xs">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-bold">
            <Globe className="text-primary size-4" />
            <span>Ngôn ngữ hiển thị</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Chọn ngôn ngữ ưu tiên trên toàn bộ nền tảng Kosume.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2.5">
            <button
              type="button"
              className="bg-primary text-primary-foreground cursor-pointer rounded-xl px-4 py-2 text-xs font-bold shadow-xs"
            >
              Tiếng Việt (Mặc định)
            </button>
            <button
              type="button"
              className="border-border/70 bg-card hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer rounded-xl border px-4 py-2 text-xs font-medium"
            >
              English
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
