import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { cn, decodeToken } from "@/lib/utils";
import { WhiteLabelLogo } from "@/lib/white-label";
import { Layers, ShieldCheck, Sparkles, Workflow } from "lucide-react";
import React from "react";

interface AuthFormsLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function AuthLayout({
  children,
  params,
}: AuthFormsLayoutProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Guard for guest routes: If user is authenticated with a valid token, redirect to profile
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refreshToken")?.value;

  if (refreshToken) {
    const payload = decodeToken(refreshToken);
    if (payload?.exp && payload.exp * 1000 > Date.now()) {
      redirect(`/${locale}/profile`);
    }
  }

  const t = await getTranslations({ locale, namespace: "Auth.layout" });

  return (
    <section className={cn("min-h-dvh w-full")}>
      <div className="grid min-h-dvh lg:grid-cols-2">
        {/* ===== Left Side: Immersive Enterprise Showcase (Visible on lg+) ===== */}
        <div
          className={cn(
            "relative hidden flex-col justify-between overflow-hidden bg-slate-950 p-10 text-white lg:flex xl:p-14 dark:bg-black"
          )}
        >
          {/* Ambient Glows */}
          <div className="pointer-events-none absolute -top-40 -left-40 size-[32rem] rounded-full bg-blue-600/20 blur-3xl" />
          <div className="pointer-events-none absolute top-1/2 -right-40 size-[28rem] -translate-y-1/2 rounded-full bg-indigo-600/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-40 left-1/4 size-[24rem] rounded-full bg-emerald-600/10 blur-3xl" />

          {/* Subtle Decorative Grid Pattern */}
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_75%_75%_at_50%_50%,#000_60%,transparent_100%)] bg-[size:4rem_4rem]" />

          {/* Top Branding Bar */}
          <div className="relative z-10 flex items-center justify-between">
            <Link
              href="/"
              className="group flex items-center gap-3.5 transition-opacity hover:opacity-90"
            >
              <div className="flex h-12 max-w-[180px] min-w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 shadow-inner backdrop-blur-md transition-colors group-hover:border-white/20">
                <WhiteLabelLogo
                  fallback={
                    <div className="flex items-center gap-2.5">
                      <div className="flex size-7 items-center justify-center rounded-lg bg-linear-to-br from-blue-500 to-indigo-600 text-sm font-bold text-white shadow-md">
                        C
                      </div>
                      <span className="text-base font-bold tracking-tight text-white">
                        Crodic
                      </span>
                    </div>
                  }
                />
              </div>
              <div>
                <span className="text-base font-bold tracking-tight text-white">
                  Crodic Framework
                </span>
                <p className="text-xs text-slate-400">Enterprise Platform</p>
              </div>
            </Link>

            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-medium text-emerald-400 backdrop-blur-md">
              <span className="size-1.5 animate-pulse rounded-full bg-emerald-400" />
              <span>{t("operational")}</span>
            </div>
          </div>

          {/* Middle: Value Proposition & Feature Highlights */}
          <div className="relative z-10 my-auto space-y-8 py-8 xl:py-12">
            <div className="max-w-xl space-y-4">
              <div className="inline-flex items-center gap-2 rounded-lg border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold tracking-wider text-blue-400 uppercase">
                <Sparkles className="size-3.5" />
                <span>{t("welcome")}</span>
              </div>
              <h1 className="bg-linear-to-br from-white via-slate-100 to-slate-300 bg-clip-text text-3xl font-extrabold tracking-tight text-balance text-transparent xl:text-4xl">
                {t("tagline")}
              </h1>
              <p className="text-sm leading-relaxed text-pretty text-slate-400 xl:text-base">
                {t("description")}
              </p>
            </div>

            {/* Feature Highlight Cards */}
            <div className="grid max-w-lg gap-3.5">
              <div className="flex items-start gap-3.5 rounded-xl border border-white/10 bg-white/[0.04] p-3.5 backdrop-blur-md transition-colors hover:border-white/20 hover:bg-white/[0.07]">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">
                  <ShieldCheck className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white">
                    {t("feature1Title")}
                  </p>
                  <p className="mt-0.5 text-xs leading-relaxed text-slate-400">
                    {t("feature1Desc")}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 rounded-xl border border-white/10 bg-white/[0.04] p-3.5 backdrop-blur-md transition-colors hover:border-white/20 hover:bg-white/[0.07]">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/15 text-blue-400">
                  <Workflow className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white">
                    {t("feature2Title")}
                  </p>
                  <p className="mt-0.5 text-xs leading-relaxed text-slate-400">
                    {t("feature2Desc")}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 rounded-xl border border-white/10 bg-white/[0.04] p-3.5 backdrop-blur-md transition-colors hover:border-white/20 hover:bg-white/[0.07]">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-purple-500/15 text-purple-400">
                  <Layers className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white">
                    {t("feature3Title")}
                  </p>
                  <p className="mt-0.5 text-xs leading-relaxed text-slate-400">
                    {t("feature3Desc")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar: Stats Strip & Copyright */}
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs text-slate-500">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 font-medium text-slate-400">
                <span className="size-1.5 rounded-full bg-emerald-400" />
                {t("statUptime")}
              </span>
              <span>•</span>
              <span className="font-medium text-slate-400">
                {t("statLatency")}
              </span>
              <span>•</span>
              <span className="font-medium text-slate-400">
                {t("statScale")}
              </span>
            </div>
            <p>© {new Date().getFullYear()} Crodic Framework.</p>
          </div>
        </div>

        {/* Right Side - Form */}
        {children}
      </div>
    </section>
  );
}
