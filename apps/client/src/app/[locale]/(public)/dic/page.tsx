import React from "react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import {
  ArrowRight,
  BadgeCheck,
  BookOpenText,
  Search,
  Tags,
} from "lucide-react";
import { Footer } from "@/components/layouts/footer";
import { Header } from "@/components/layouts/header";
import Layout from "@/components/layouts/layout";
import { getTagCategoryToken } from "@/components/tags/tag-tokens";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Link } from "@/i18n/navigation";
import { fetchPublicTagsDirectory, type TagCategory } from "@/services/tags";

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    q?: string;
    category?: string;
    page?: string;
  }>;
};

const CATEGORY_FILTERS: { key: "all" | TagCategory; label: string }[] = [
  { key: "all", label: "All" },
  { key: "copyright", label: "Copyright / Series" },
  { key: "character", label: "Character" },
  { key: "artist", label: "Artist" },
  { key: "general", label: "General" },
  { key: "meta", label: "Meta" },
  { key: "system", label: "System" },
];

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: `Pixiv Encyclopedia (dic) — ${locale.toUpperCase()}`,
    description:
      "Browse community-curated Pixiv Encyclopedia (dic) wiki articles, visual headers, and semantic DAG tag definitions.",
  };
}

export default async function EncyclopediaDirectoryPage({
  params,
  searchParams,
}: PageProps) {
  const { locale } = await params;
  const sp = await searchParams;
  const t = await getTranslations({ locale, namespace: "Tags" });

  const searchKeyword = sp.q?.trim() || "";
  const activeCategory = sp.category || "all";
  const currentPage = Math.max(Number(sp.page) || 1, 1);

  const directory = await fetchPublicTagsDirectory({
    locale,
    search: searchKeyword || undefined,
    category: activeCategory,
    page: currentPage,
    limit: 24,
  });

  // Prioritize encyclopedia entries with featured header images at the top of the current page
  const sortedEntries = [...directory.data].sort((a, b) => {
    const aHasImg = a.featuredImageUrl ? 1 : 0;
    const bHasImg = b.featuredImageUrl ? 1 : 0;
    if (bHasImg !== aHasImg) return bHasImg - aHasImg;
    return b.usageCount - a.usageCount;
  });

  return (
    <Layout>
      <Header />
      <main className="mx-auto w-full max-w-6xl space-y-10 px-4 py-10 sm:px-6 md:py-14">
        {/* Encyclopedia Hub Header */}
        <section className="bg-card space-y-6 rounded-2xl border p-6 shadow-2xs sm:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="space-y-2.5">
              <Badge variant="outline" className="gap-1.5 text-xs">
                <BookOpenText
                  className="text-primary size-3.5"
                  aria-hidden="true"
                />
                Pixiv Encyclopedia (dic) · {locale.toUpperCase()}
              </Badge>
              <h1 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
                Community Tag Encyclopedia
              </h1>
              <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed text-pretty">
                Explore lore summaries, visual header banners, orthographic
                aliases, and parent-child DAG taxonomy trees across canonical
                tags.
              </p>
            </div>

            <Button variant="outline" size="sm" asChild className="shrink-0">
              <Link href="/tags">
                <Tags className="size-4" aria-hidden="true" />
                Boolean Tag Search Hub
              </Link>
            </Button>
          </div>

          <form
            action={`/${locale}/dic`}
            method="get"
            className="flex flex-col gap-2.5 sm:flex-row sm:items-center"
          >
            {activeCategory !== "all" && (
              <input type="hidden" name="category" value={activeCategory} />
            )}
            <div className="relative flex-1">
              <Search
                className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
                aria-hidden="true"
              />
              <Input
                name="q"
                defaultValue={searchKeyword}
                placeholder="Filter encyclopedia articles by tag name or alias..."
                className="pl-9"
              />
            </div>
            <Button type="submit" className="shrink-0">
              Search Encyclopedia
            </Button>
          </form>

          <nav
            aria-label="Filter encyclopedia by semantic category"
            className="flex flex-wrap items-center gap-1.5 border-t pt-4"
          >
            {CATEGORY_FILTERS.map((cat) => {
              const isActive = activeCategory === cat.key;
              const qs = new URLSearchParams();
              if (cat.key !== "all") qs.set("category", cat.key);
              if (searchKeyword) qs.set("q", searchKeyword);
              const href = qs.toString() ? `/dic?${qs.toString()}` : "/dic";
              return (
                <Link
                  key={cat.key}
                  href={href}
                  className={`rounded-full border px-3 py-1 text-xs font-medium whitespace-nowrap transition-colors ${
                    isActive
                      ? "bg-foreground text-background border-foreground"
                      : "bg-background text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {cat.key === "all" ? t("allCategories") : cat.label}
                </Link>
              );
            })}
          </nav>
        </section>

        {/* Encyclopedia Cards Grid */}
        {sortedEntries.length === 0 ? (
          <div className="text-muted-foreground rounded-2xl border border-dashed p-12 text-center text-sm">
            {t("noTagsFound")}
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {sortedEntries.map((tag) => {
              const token = getTagCategoryToken(tag.category);
              const display = tag.translatedName?.trim() || tag.name;

              return (
                <Card
                  key={tag.id}
                  className={`group hover:border-foreground/30 justify-between overflow-hidden shadow-2xs transition-colors ${
                    tag.featuredImageUrl ? "pt-0" : ""
                  }`}
                >
                  <div>
                    {tag.featuredImageUrl && (
                      <Link
                        href={`/dic/${tag.slug}`}
                        className="bg-muted/20 relative block overflow-hidden border-b"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={tag.featuredImageUrl}
                          alt={display}
                          className="aspect-[16/9] h-40 w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                        />
                        <Badge
                          variant="secondary"
                          className="bg-background/90 absolute top-2.5 left-2.5 gap-1.5 text-[11px] backdrop-blur-xs"
                        >
                          <span
                            className={`size-2 rounded-full ${token.dot}`}
                            aria-hidden="true"
                          />
                          {token.label}
                        </Badge>
                      </Link>
                    )}

                    <CardHeader
                      className={`space-y-2 pb-2.5 ${
                        tag.featuredImageUrl ? "pt-4" : ""
                      }`}
                    >
                      {!tag.featuredImageUrl && (
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-muted-foreground inline-flex items-center gap-1.5 text-[11px] font-medium tracking-wider uppercase">
                            <span
                              className={`size-2 rounded-full ${token.dot}`}
                              aria-hidden="true"
                            />
                            {token.label}
                          </span>
                          <span className="text-muted-foreground font-mono text-xs tabular-nums">
                            {t("worksCount", {
                              count: tag.usageCount.toLocaleString(),
                            })}
                          </span>
                        </div>
                      )}

                      <CardTitle className="flex items-center justify-between gap-2 text-base leading-snug">
                        <Link
                          href={`/dic/${tag.slug}`}
                          className="inline-flex min-w-0 items-center gap-1.5 hover:underline"
                        >
                          <span className="truncate">{display}</span>
                          {tag.isOfficial && (
                            <BadgeCheck
                              className="text-primary size-4 shrink-0"
                              aria-hidden="true"
                            />
                          )}
                        </Link>
                        {tag.featuredImageUrl && (
                          <span className="text-muted-foreground shrink-0 font-mono text-xs font-normal tabular-nums">
                            {t("worksCount", {
                              count: tag.usageCount.toLocaleString(),
                            })}
                          </span>
                        )}
                      </CardTitle>

                      {tag.translatedName &&
                        tag.translatedName.trim() !== tag.name.trim() && (
                          <p className="text-muted-foreground truncate font-mono text-xs">
                            #{tag.name}
                          </p>
                        )}
                    </CardHeader>
                  </div>

                  <CardContent className="space-y-3 pt-0">
                    <p className="text-muted-foreground line-clamp-2 min-h-8 text-xs leading-relaxed text-pretty">
                      {tag.shortSummary ||
                        "Read or contribute to the community encyclopedia overview for this canonical tag."}
                    </p>

                    <div className="flex items-center justify-between border-t pt-2.5 text-xs font-medium">
                      <Link
                        href={`/dic/${tag.slug}`}
                        className="text-primary inline-flex items-center gap-1 hover:underline"
                      >
                        <BookOpenText className="size-3.5" aria-hidden="true" />
                        {t("readEncyclopedia")}
                        <ArrowRight className="size-3" aria-hidden="true" />
                      </Link>
                      <Link
                        href={`/tags/${tag.slug}`}
                        className="text-muted-foreground hover:text-foreground hover:underline"
                      >
                        #{tag.slug}
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </Layout>
  );
}
