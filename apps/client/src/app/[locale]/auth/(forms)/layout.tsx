import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { decodeToken } from "@/lib/utils";
import { Award, Briefcase, Camera } from "lucide-react";
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

  const features = [
    { icon: Camera, title: t("feature1Title"), description: t("feature1Desc") },
    {
      icon: Briefcase,
      title: t("feature2Title"),
      description: t("feature2Desc"),
    },
    { icon: Award, title: t("feature3Title"), description: t("feature3Desc") },
  ];

  return (
    <div className="bg-background grid min-h-dvh lg:grid-cols-2">
      <aside className="relative hidden min-w-0 flex-col overflow-hidden bg-slate-950 p-10 text-white lg:flex xl:p-14">
        <div
          className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-40"
          style={{ backgroundImage: "url('/landing/art-acheron.jpg')" }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-0 bg-linear-to-r from-slate-950/95 to-slate-950/65"
          aria-hidden="true"
        />

        <div className="relative flex flex-1 flex-col">
          <Link href="/" className="w-fit rounded-md">
            <WhiteLabelLogo
              width={200}
              height={48}
              className="h-10 w-auto object-contain brightness-0 invert"
              textClassName="text-white text-xl"
            />
          </Link>

          <div className="my-auto max-w-xl space-y-8 py-12">
            <div className="space-y-3">
              <p className="text-3xl font-bold tracking-tight text-balance xl:text-4xl">
                {t("tagline")}
              </p>
              <p className="text-sm leading-relaxed text-pretty text-slate-200 xl:text-base">
                {t("description")}
              </p>
            </div>

            <ul className="divide-y divide-white/15 border-y border-white/15">
              {features.map(({ icon: Icon, title, description }) => (
                <li key={title} className="flex gap-3 py-4">
                  <Icon
                    className="mt-0.5 size-5 shrink-0 text-slate-200"
                    aria-hidden="true"
                  />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold">{title}</p>
                    <p className="text-sm leading-relaxed text-slate-200">
                      {description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <p className="text-xs text-slate-300">
            {t("copyright", { year: String(new Date().getFullYear()) })}
          </p>
        </div>
      </aside>

      <main className="flex min-w-0 items-center justify-center px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {children}
      </main>
    </div>
  );
}
