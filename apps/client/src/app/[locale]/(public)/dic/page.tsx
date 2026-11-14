import React from "react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import {
  ArrowRight,
  BadgeCheck,
  BookOpenText,
  Clapperboard,
  Flame,
  Layers,
  Paintbrush,
  Search,
  Compass,
  Tag as TagIcon,
  Tags,
  User,
} from "lucide-react";
import { Footer } from "@/components/layouts/footer";
import { Header } from "@/components/layouts/header";
import Layout from "@/components/layouts/layout";
import { TagCategoryEmblem } from "@/components/tags/tag-category-emblem";
import {
  getTagCategoryI18nKey,
  getTagCategoryToken,
} from "@/components/tags/tag-tokens";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
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

const CATEGORY_ITEMS: {
  key: "all" | TagCategory;
  labelKey: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { key: "all", labelKey: "categoryAll", icon: Compass },
  { key: "copyright", labelKey: "categoryCopyright", icon: Clapperboard },
  { key: "character", labelKey: "categoryCharacter", icon: User },
  { key: "artist", labelKey: "categoryArtist", icon: Paintbrush },
  { key: "general", labelKey: "categoryGeneral", icon: TagIcon },
  { key: "meta", labelKey: "categoryMeta", icon: Layers },
  { key: "system", labelKey: "categorySystem", icon: BadgeCheck },
];

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: `Tag Encyclopedia (dic) — ${locale.toUpperCase()}`,
    description:
      "Browse community-curated encyclopedia (dic) wiki articles, visual headers, and semantic tag definitions.",
  };
}

function DicPagination({
  currentPage,
  totalPages,
  buildUrl,
}: {
  currentPage: number;
  totalPages: number;
  buildUrl: (page: number) => string;
}) {
  if (totalPages <= 1) return null;

  const pages: (number | "ellipsis")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push("ellipsis");
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push("ellipsis");
    pages.push(totalPages);
  }

  return (
    <Pagination className="pt-8">
      <PaginationContent>
        {currentPage > 1 && (
          <PaginationItem>
            <PaginationPrevious href={buildUrl(currentPage - 1)} />
          </PaginationItem>
        )}
        {pages.map((p, idx) =>
          p === "ellipsis" ? (
            <PaginationItem key={`ellipsis-${idx}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={p}>
              <PaginationLink href={buildUrl(p)} isActive={p === currentPage}>
                {p}
              </PaginationLink>
            </PaginationItem>
          )
        )}
        {currentPage < totalPages && (
          <PaginationItem>
            <PaginationNext href={buildUrl(currentPage + 1)} />
          </PaginationItem>
        )}
      </PaginationContent>
    </Pagination>
  );
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

  // Prioritize encyclopedia entries with featured header images
  const sortedEntries = [...directory.data].sort((a, b) => {
    const aHasImg = a.featuredImageUrl ? 1 : 0;
    const bHasImg = b.featuredImageUrl ? 1 : 0;
    if (bHasImg !== aHasImg) return bHasImg - aHasImg;
    return b.usageCount - a.usageCount;
  });

  const buildPageUrl = (pageNumber: number) => {
    const p = new URLSearchParams();
    if (activeCategory && activeCategory !== "all") {
      p.set("category", activeCategory);
    }
    if (searchKeyword) {
      p.set("q", searchKeyword);
    }
    if (pageNumber > 1) {
      p.set("page", String(pageNumber));
    }
    const qs = p.toString();
    return qs ? `/dic?${qs}` : "/dic";
  };

  return (
    <Layout>
      <Header />
      <main className="mx-auto w-full max-w-6xl space-y-10 px-4 py-8 sm:px-6 md:py-12">
        {/* Encyclopedia Hub Header */}
        <section className="border-border/70 from-card via-card/90 to-muted/20 relative z-20 overflow-hidden rounded-3xl border bg-gradient-to-b p-6 shadow-sm sm:p-10">
          <div
            className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl"
            aria-hidden="true"
          >
            <div className="bg-primary/10 absolute top-0 right-1/4 h-80 w-80 -translate-y-1/2 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 left-1/4 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />
          </div>

          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="space-y-3">
              <Badge
                variant="outline"
                className="border-primary/20 bg-primary/5 text-foreground gap-1.5 rounded-full px-3.5 py-1 text-xs font-semibold shadow-2xs"
              >
                <BookOpenText
                  className="text-primary size-3.5"
                  aria-hidden="true"
                />
                {t("dicHubBadge")} · {locale.toUpperCase()}
              </Badge>
              <h1 className="text-foreground text-3xl font-extrabold tracking-tight sm:text-5xl">
                {t("dicHubTitle")}
              </h1>
              <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed text-pretty sm:text-base">
                {t("dicHubDesc")}
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              asChild
              className="shrink-0 rounded-xl font-medium"
            >
              <Link href="/tags">
                <Tags className="size-4" aria-hidden="true" />
                {t("dicBooleanSearchLink")}
              </Link>
            </Button>
          </div>

          <form
            action={`/${locale}/dic`}
            method="get"
            className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:items-center"
          >
            {activeCategory !== "all" && (
              <input type="hidden" name="category" value={activeCategory} />
            )}
            <div className="relative flex-1">
              <Search
                className="text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2"
                aria-hidden="true"
              />
              <Input
                name="q"
                defaultValue={searchKeyword}
                placeholder={t("dicHubSearchPlaceholder")}
                className="h-11 rounded-2xl pl-10 shadow-xs"
              />
            </div>
            <Button
              type="submit"
              className="h-11 shrink-0 rounded-2xl px-6 font-semibold shadow-xs"
            >
              {t("dicHubSearchBtn")}
            </Button>
          </form>

          {/* Semantic Category Navigation Bar */}
          <nav
            aria-label="Filter encyclopedia by semantic category"
            className="border-border/60 mt-6 flex [scrollbar-width:none] items-center gap-1.5 overflow-x-auto border-t pt-4 [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            {CATEGORY_ITEMS.map((cat) => {
              const isActive = activeCategory === cat.key;
              const qs = new URLSearchParams();
              if (cat.key !== "all") qs.set("category", cat.key);
              if (searchKeyword) qs.set("q", searchKeyword);
              const href = qs.toString() ? `/dic?${qs.toString()}` : "/dic";
              const Icon = cat.icon;

              return (
                <Link
                  key={cat.key}
                  href={href}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all duration-150 active:scale-95 ${
                    isActive
                      ? "bg-primary text-primary-foreground border-primary shadow-xs"
                      : "bg-card text-muted-foreground hover:text-foreground border-border/80 hover:bg-muted/60"
                  }`}
                >
                  <Icon className="size-3.5 shrink-0" aria-hidden="true" />
                  <span>{t(cat.labelKey as any)}</span>
                </Link>
              );
            })}
          </nav>
        </section>

        {/* Encyclopedia Cards Grid */}
        {sortedEntries.length === 0 ? (
          <Empty className="border-border/80 rounded-3xl border border-dashed py-12">
            <EmptyMedia variant="icon">
              <BookOpenText className="size-6" />
            </EmptyMedia>
            <EmptyHeader>
              <EmptyTitle className="text-base">{t("noTagsFound")}</EmptyTitle>
              <EmptyDescription className="text-xs">
                No encyclopedia entries found matching your query.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {sortedEntries.map((tag) => {
              const token = getTagCategoryToken(tag.category);
              const display = tag.translatedName?.trim() || tag.name;

              return (
                <div
                  key={tag.id}
                  className="group border-border/70 bg-card hover:border-primary/40 relative flex flex-col justify-between overflow-hidden rounded-2xl border shadow-2xs transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
                >
                  <div>
                    {tag.featuredImageUrl ? (
                      <Link
                        href={`/dic/${tag.slug}`}
                        className="bg-muted/30 border-border/50 relative block aspect-[16/9] w-full overflow-hidden border-b"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={tag.featuredImageUrl}
                          alt={display}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                        <span
                          className={`absolute top-2.5 left-2.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase backdrop-blur-md ${token.badge}`}
                        >
                          {t(getTagCategoryI18nKey(tag.category))}
                        </span>
                        <span className="bg-background/90 text-foreground absolute right-2.5 bottom-2.5 inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-semibold shadow-2xs backdrop-blur-xs">
                          <BookOpenText
                            className="text-primary size-3"
                            aria-hidden="true"
                          />
                          dic
                        </span>
                      </Link>
                    ) : (
                      <Link
                        href={`/dic/${tag.slug}`}
                        className={`border-border/50 relative block aspect-[16/9] w-full overflow-hidden border-b bg-gradient-to-br ${token.gradient} transition-transform duration-300`}
                      >
                        {/* Subtle ambient light */}
                        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_70%)]" />

                        {/* Top Badges */}
                        <div className="absolute top-3 left-3 flex items-center gap-1.5">
                          <span
                            className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase shadow-2xs backdrop-blur-md ${token.badge}`}
                          >
                            {t(getTagCategoryI18nKey(tag.category))}
                          </span>
                        </div>

                        <div className="absolute top-3 right-3">
                          <span className="text-muted-foreground bg-background/80 border-border/40 rounded-md border px-2 py-0.5 font-mono text-xs font-semibold tabular-nums backdrop-blur-xs">
                            {t("worksCount", {
                              count: tag.usageCount.toLocaleString(),
                            })}
                          </span>
                        </div>

                        {/* Center Category Visual Emblem & Micro Identity */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-6 text-center">
                          <div className="bg-background/90 border-border/70 flex size-12 items-center justify-center rounded-2xl border shadow-xs backdrop-blur-md transition-transform duration-300 group-hover:scale-110">
                            <TagCategoryEmblem category={tag.category} />
                          </div>
                          <span className="text-foreground line-clamp-1 max-w-[85%] text-xs font-bold tracking-tight">
                            #{display}
                          </span>
                        </div>

                        {/* Bottom Right dic link pill */}
                        <span className="bg-background/80 text-foreground absolute right-2.5 bottom-2.5 inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-medium shadow-2xs backdrop-blur-xs">
                          <BookOpenText
                            className="text-primary size-3"
                            aria-hidden="true"
                          />
                          dic
                        </span>
                      </Link>
                    )}

                    <div className="space-y-2 p-5 pb-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground font-mono text-xs font-medium tabular-nums">
                          {t("worksCount", {
                            count: tag.usageCount.toLocaleString(),
                          })}
                        </span>
                        {tag.trendingScore > 0 && (
                          <span className="inline-flex items-center gap-1 font-mono text-[11px] font-bold text-amber-600 tabular-nums dark:text-amber-400">
                            <Flame className="size-3" aria-hidden="true" />
                            {tag.trendingScore.toFixed(1)}
                          </span>
                        )}
                      </div>

                      <div className="space-y-1">
                        <Link
                          href={`/dic/${tag.slug}`}
                          className="text-foreground group-hover:text-primary flex items-center gap-1.5 text-lg font-bold tracking-tight transition-colors"
                        >
                          <span className="truncate">#{display}</span>
                          {tag.isOfficial && (
                            <BadgeCheck
                              className="text-primary size-4 shrink-0"
                              aria-hidden="true"
                            />
                          )}
                        </Link>

                        {tag.translatedName &&
                          tag.translatedName.trim() !== tag.name.trim() && (
                            <p className="text-muted-foreground truncate font-mono text-xs">
                              #{tag.name}
                            </p>
                          )}
                      </div>

                      <p className="text-muted-foreground line-clamp-2 min-h-9 text-xs leading-relaxed text-pretty">
                        {tag.shortSummary || t("dicDefaultSummary")}
                      </p>
                    </div>
                  </div>

                  <div className="border-border/60 bg-muted/20 flex items-center justify-between border-t px-5 py-3 text-xs font-medium">
                    <Link
                      href={`/dic/${tag.slug}`}
                      className="text-primary hover:text-primary/80 inline-flex items-center gap-1 font-semibold transition-colors"
                    >
                      <BookOpenText className="size-3.5" aria-hidden="true" />
                      <span>{t("dicReadWiki")}</span>
                      <ArrowRight
                        className="size-3 transition-transform group-hover:translate-x-0.5"
                        aria-hidden="true"
                      />
                    </Link>

                    <Link
                      href={`/tags/${tag.slug}`}
                      className="text-muted-foreground hover:text-foreground font-mono text-[11px] hover:underline"
                    >
                      #{tag.slug}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Directory Pagination */}
        <DicPagination
          currentPage={currentPage}
          totalPages={directory.meta.totalPages}
          buildUrl={buildPageUrl}
        />
      </main>
      <Footer />
    </Layout>
  );
}
