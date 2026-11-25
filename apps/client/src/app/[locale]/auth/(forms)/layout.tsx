import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { cn, decodeToken } from "@/lib/utils";
import { Award, Briefcase, Camera } from "lucide-react";
import Image from "next/image";
import React from "react";
import { WhiteLabelLogo } from "@/lib/white-label";

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
    <section className="bg-background min-h-dvh w-full overflow-x-hidden">
      <div className="grid min-h-dvh w-full max-w-full overflow-x-hidden lg:grid-cols-2">
        {/* ===== Left Side: Immersive Kosume Cinematic Showcase (Visible on lg+) ===== */}
        <div className="relative hidden flex-col justify-between overflow-hidden bg-slate-950 p-10 text-white lg:flex xl:p-14 dark:bg-[#07090e]">
          {/* Backdrop Visual Artwork */}
          <div
            className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-30 mix-blend-luminosity filter transition-opacity duration-700"
            style={{ backgroundImage: "url('/landing/art-acheron.jpg')" }}
          />

          {/* Deep Dark Vignette Mask */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#07090e] via-[#07090e]/85 to-[#07090e]/70" />

          {/* Top Branding Bar */}
          <div className="relative z-10 flex items-center justify-between">
            <Link
              href="/"
              className="group flex items-center gap-3 transition-opacity hover:opacity-90"
            >
              <WhiteLabelLogo
                width={200}
                height={48}
                className="h-11 w-auto object-contain brightness-0 invert"
                textClassName="text-white text-xl"
              />
            </Link>

            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300">
              <span className="size-1.5 rounded-full bg-emerald-400" />
              <span>{t("operational")}</span>
            </div>
          </div>

          {/* Middle: Value Proposition & Feature Highlights */}
          <div className="relative z-10 my-auto space-y-8 py-8 xl:py-12">
            <div className="max-w-xl space-y-3">
              <h1 className="text-3xl font-extrabold tracking-tight text-balance text-white xl:text-4xl">
                {t("tagline")}
              </h1>
              <p className="text-sm leading-relaxed text-pretty text-slate-300 xl:text-base">
                {t("description")}
              </p>
            </div>

            {/* Feature Highlight Cards */}
            <div className="grid max-w-lg gap-3.5">
              <div className="flex items-start gap-3.5 rounded-xl border border-white/10 bg-white/[0.03] p-3.5 transition-colors hover:border-white/20 hover:bg-white/[0.06]">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white">
                  <Camera className="size-5" />
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

              <div className="flex items-start gap-3.5 rounded-xl border border-white/10 bg-white/[0.03] p-3.5 transition-colors hover:border-white/20 hover:bg-white/[0.06]">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white">
                  <Briefcase className="size-5" />
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

              <div className="flex items-start gap-3.5 rounded-xl border border-white/10 bg-white/[0.03] p-3.5 transition-colors hover:border-white/20 hover:bg-white/[0.06]">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white">
                  <Award className="size-5" />
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

            {/* Social Proof Avatars */}
            <div className="flex items-center gap-3 pt-2">
              <div className="flex -space-x-2">
                <img
                  src="/landing/avatar-acheron.jpg"
                  alt="Acheron"
                  className="size-8 rounded-full border-2 border-slate-900 object-cover"
                />
                <img
                  src="/landing/avatar-kiriko.jpg"
                  alt="Kiriko"
                  className="size-8 rounded-full border-2 border-slate-900 object-cover"
                />
                <img
                  src="/landing/avatar-soriko.jpg"
                  alt="Soriko"
                  className="size-8 rounded-full border-2 border-slate-900 object-cover"
                />
                <img
                  src="/landing/avatar-kafka.jpg"
                  alt="Kafka"
                  className="size-8 rounded-full border-2 border-slate-900 object-cover"
                />
              </div>
              <div className="text-xs text-slate-400">
                <span className="font-semibold text-white tabular-nums">
                  {t("creatorsJoined", { count: "50,000+" })}
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Bar: Stats Strip & Copyright */}
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs text-slate-500">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 font-medium text-slate-300">
                <span className="size-1.5 rounded-full bg-emerald-400" />
                {t("statUptime")}
              </span>
              <span>•</span>
              <span className="font-medium text-slate-300">
                {t("statLatency")}
              </span>
              <span>•</span>
              <span className="font-medium text-slate-300">
                {t("statScale")}
              </span>
            </div>
            <p>{t("copyright", { year: String(new Date().getFullYear()) })}</p>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="relative flex w-full max-w-full min-w-0 items-center justify-center overflow-x-hidden p-3 sm:p-6 lg:p-8">
          <div className="relative z-10 w-full max-w-full min-w-0">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}
