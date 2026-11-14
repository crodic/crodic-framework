import React from "react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export function CtaBanner() {
  return (
    <section className="py-12 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Glow callout card container */}
        <div className="border-primary/50 from-primary/15 via-card/70 to-card/95 relative overflow-hidden rounded-3xl border bg-gradient-to-b p-8 text-center shadow-[0_0_60px_-15px_var(--color-primary)] backdrop-blur-md sm:p-14 lg:p-16">
          {/* Ambient lighting ball */}
          <div
            className="bg-primary/25 pointer-events-none absolute -top-24 left-1/2 h-64 w-96 -translate-x-1/2 rounded-full blur-[90px]"
            aria-hidden="true"
          />

          <div className="relative z-10 mx-auto max-w-2xl">
            <h2 className="text-foreground text-2xl leading-tight font-black tracking-tight sm:text-3xl lg:text-4xl">
              Bạn đã sẵn sàng tham gia thế giới Kosume?
            </h2>

            <p className="text-muted-foreground mt-3.5 text-sm leading-relaxed sm:mt-4 sm:text-base">
              Bạn đã sẵn sàng tham gia thế giới Kosume? Vũ kịch mở ngàn kích
              thích thị giác. Nơi từng khung hình là một tuyệt tác nghệ thuật.
            </p>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Button
                asChild
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/30 h-12 cursor-pointer rounded-lg px-8 text-sm font-semibold shadow-xl transition-all hover:scale-[1.02] sm:text-base"
              >
                <Link href="/auth/sign-up">Tham gia ngay (Đăng ký)</Link>
              </Button>

              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-border/80 bg-background/50 hover:bg-muted text-foreground h-12 cursor-pointer rounded-lg px-8 text-sm font-medium transition-all hover:scale-[1.02] sm:text-base"
              >
                <a href="#albums">Xem các tác phẩm</a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
