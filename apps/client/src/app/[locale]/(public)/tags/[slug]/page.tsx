import React from "react";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound, permanentRedirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import type { DefinedTerm, WithContext } from "schema-dts";
import {
  ArrowLeft,
  BadgeCheck,
  BookOpenText,
  Flame,
  GitBranch,
  Link2,
  Split,
} from "lucide-react";
import { Footer } from "@/components/layouts/footer";
import { Header } from "@/components/layouts/header";
import Layout from "@/components/layouts/layout";
import { MuteTagButton } from "@/components/tags/mute-tag-button";
import { TagHoverCard } from "@/components/tags/tag-hover-card";
import { getTagCategoryToken } from "@/components/tags/tag-tokens";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { fetchBooleanTagSearchSSR, fetchTagBySlugSSR } from "@/services/tags";

type PageProps = {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{ expand?: string; page?: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const tag = await fetchTagBySlugSSR(slug, locale);

  if (!tag) {
    return { title: "Tag Not Found" };
  }

  const canonicalSlug = tag.redirectSlug || tag.slug;
  const displayTitle = tag.translatedName || tag.name;

  return {
    title: `#${displayTitle} (${tag.name}) — Tags & Taxonomy`,
    description:
      tag.shortSummary ||
      `Explore works, parent-child DAG hierarchy, and encyclopedia entry for #${displayTitle}.`,
    alternates: {
      canonical: `/${locale}/tags/${canonicalSlug}`,
    },
  };
}

export default async function TagDetailLandingPage({
  params,
  searchParams,
}: PageProps) {
  const { locale, slug } = await params;
  const sp = await searchParams;
  const t = await getTranslations({ locale, namespace: "Tags" });

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  const decodedSlug = decodeURIComponent(slug);
  const tag = await fetchTagBySlugSSR(decodedSlug, locale, accessToken);

  if (!tag) {
    notFound();
  }

  // Pixiv SEO Canonicalization: 308 Permanent Redirect when accessed via alias or merged slug
  if (tag.redirectSlug && tag.redirectSlug !== decodedSlug) {
    permanentRedirect(
      `/${locale}/tags/${encodeURIComponent(tag.redirectSlug)}`
    );
  }

  const expandHierarchy = sp.expand !== "false";
  const currentPage = Math.max(Number(sp.page) || 1, 1);

  const taggedResults = await fetchBooleanTagSearchSSR({
    tagQuery: tag.slug,
    locale,
    expandHierarchy,
    page: currentPage,
    limit: 12,
    accessToken,
  });

  const displayTitle = tag.translatedName?.trim() || tag.name;
  const categoryToken = getTagCategoryToken(tag.category);

  const jsonLd: WithContext<DefinedTerm> = {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: displayTitle,
    alternateName: tag.aliases?.map((a) => a.aliasName),
    description:
      tag.shortSummary ||
      `Canonical tag #${tag.name} in semantic category ${tag.category}.`,
    termCode: tag.slug,
  };

  const { parents, children, siblings, related, disambiguations } = tag.graph;
  const associativeTags = Array.from(
    new Map([...siblings, ...related].map((node) => [node.id, node])).values()
  );

  return (
    <Layout>
      <Header />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="mx-auto w-full max-w-6xl space-y-8 px-4 py-8 sm:px-6 md:py-12">
        <div>
          <Link
            href="/tags"
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-xs font-medium transition-colors"
          >
            <ArrowLeft className="size-3.5" aria-hidden="true" />
            All Canonical Tags
          </Link>
        </div>

        {/* Canonical Tag Hero Card */}
        <section className="bg-card space-y-5 rounded-2xl border p-6 shadow-xs sm:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0 flex-1 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="gap-1.5 text-xs">
                  <span
                    className={`size-2 rounded-full ${categoryToken.dot}`}
                    aria-hidden="true"
                  />
                  {categoryToken.label}
                </Badge>
                {tag.isOfficial && (
                  <Badge variant="secondary" className="gap-1 text-xs">
                    <BadgeCheck
                      className="text-primary size-3.5"
                      aria-hidden="true"
                    />
                    Official
                  </Badge>
                )}
                <span className="text-muted-foreground font-mono text-xs tabular-nums">
                  {t("worksCount", { count: tag.usageCount.toLocaleString() })}
                </span>
                {tag.trendingScore > 0 && (
                  <span className="inline-flex items-center gap-1 font-mono text-xs text-amber-600 tabular-nums dark:text-amber-400">
                    <Flame className="size-3.5" aria-hidden="true" />
                    {tag.trendingScore.toFixed(1)}
                  </span>
                )}
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-balance sm:text-3xl">
                #{displayTitle}
              </h1>

              {tag.translatedName &&
                tag.translatedName.trim() !== tag.name.trim() && (
                  <p className="text-muted-foreground font-mono text-sm">
                    Canonical: #{tag.name}
                  </p>
                )}

              {tag.shortSummary && (
                <p className="text-muted-foreground max-w-3xl text-sm leading-relaxed text-pretty">
                  {tag.shortSummary}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <Button asChild size="sm" className="gap-1.5">
                  <Link href={`/dic/${tag.slug}`}>
                    <BookOpenText className="size-4" aria-hidden="true" />
                    {t("readEncyclopedia")}
                  </Link>
                </Button>
                <MuteTagButton
                  tagId={tag.id}
                  tagName={tag.name}
                  initialMuted={Boolean(tag.isMutedByCurrentUser)}
                  muteLabel={t("muteTag")}
                  unmuteLabel={t("unmuteTag")}
                />
              </div>
            </div>

            {tag.featuredImageUrl && (
              <Link
                href={`/dic/${tag.slug}`}
                className="bg-muted/20 group relative block w-full shrink-0 overflow-hidden rounded-xl border md:w-64"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={tag.featuredImageUrl}
                  alt={displayTitle}
                  className="aspect-[16/10] w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                />
                <span className="bg-background/90 text-foreground absolute right-2.5 bottom-2.5 inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-medium shadow-2xs backdrop-blur-xs">
                  <BookOpenText
                    className="text-primary size-3"
                    aria-hidden="true"
                  />
                  dic
                </span>
              </Link>
            )}
          </div>

          {tag.aliases && tag.aliases.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 border-t pt-4 text-xs">
              <span className="text-muted-foreground mr-1 font-medium">
                {t("aliases")}:
              </span>
              {tag.aliases.map((al) => (
                <Badge
                  key={al.id}
                  variant="secondary"
                  className="font-normal whitespace-nowrap"
                >
                  {al.aliasName}
                </Badge>
              ))}
            </div>
          )}
        </section>

        {/* Semantic DAG Explorer */}
        <section
          aria-label="Semantic DAG tag relationships"
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
        >
          <Card className="shadow-2xs">
            <CardHeader className="pb-2.5">
              <CardTitle className="flex items-center gap-1.5 text-sm font-semibold">
                <GitBranch className="text-primary size-4" aria-hidden="true" />
                {t("parents")} (親タグ)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {parents.length === 0 ? (
                <p className="text-muted-foreground text-xs italic">
                  Root concept — no broader parent tags.
                </p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {parents.map((p) => (
                    <TagHoverCard
                      key={p.id}
                      locale={locale}
                      slug={p.slug}
                      name={p.name}
                      translatedName={p.translatedName}
                      category={p.category}
                      usageCount={p.usageCount}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-2xs">
            <CardHeader className="pb-2.5">
              <CardTitle className="flex items-center gap-1.5 text-sm font-semibold">
                <GitBranch className="text-primary size-4" aria-hidden="true" />
                {t("children")} (子タグ)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {children.length === 0 ? (
                <p className="text-muted-foreground text-xs italic">
                  Leaf tag — no narrower child sub-tags.
                </p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {children.map((c) => (
                    <TagHoverCard
                      key={c.id}
                      locale={locale}
                      slug={c.slug}
                      name={c.name}
                      translatedName={c.translatedName}
                      category={c.category}
                      usageCount={c.usageCount}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-2xs">
            <CardHeader className="pb-2.5">
              <CardTitle className="flex items-center gap-1.5 text-sm font-semibold">
                <Link2 className="text-primary size-4" aria-hidden="true" />
                {t("siblings")} &amp; {t("related")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {associativeTags.length === 0 && disambiguations.length === 0 ? (
                <p className="text-muted-foreground text-xs italic">
                  No sibling or associative links yet.
                </p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {associativeTags.map((node) => (
                    <TagHoverCard
                      key={node.id}
                      locale={locale}
                      slug={node.slug}
                      name={node.name}
                      translatedName={node.translatedName}
                      category={node.category}
                    />
                  ))}
                  {disambiguations.map((dis) => (
                    <Badge
                      key={dis.id}
                      variant="outline"
                      className="gap-1 text-xs"
                    >
                      <Split
                        className="size-3 text-amber-500"
                        aria-hidden="true"
                      />
                      <Link
                        href={`/tags/${dis.slug}`}
                        className="hover:underline"
                      >
                        #{dis.translatedName || dis.name}
                      </Link>
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Tagged Items Feed with Closure Hierarchy Toggle */}
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-bold tracking-tight">
              {t("viewTaggedWorks")} ({taggedResults.meta.total})
            </h2>
            <Button variant="outline" size="sm" asChild>
              <Link
                href={`/tags/${encodeURIComponent(tag.slug)}?expand=${
                  expandHierarchy ? "false" : "true"
                }`}
              >
                {expandHierarchy
                  ? "Showing Tag + Sub-Tags (Click for Exact)"
                  : t("expandHierarchy")}
              </Link>
            </Button>
          </div>

          {taggedResults.data.length === 0 ? (
            <div className="text-muted-foreground rounded-2xl border border-dashed p-10 text-center text-sm">
              {t("noContentFound")}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {taggedResults.data.map((entry) => (
                <Card
                  key={`${entry.entityType}-${entry.entityId}`}
                  className="shadow-2xs"
                >
                  <CardContent className="space-y-3 p-4">
                    <div className="flex items-center justify-between">
                      <Badge
                        variant="outline"
                        className="font-mono text-[10px] uppercase"
                      >
                        {entry.entityType}
                      </Badge>
                      <span className="text-muted-foreground font-mono text-xs tabular-nums">
                        ID #{entry.entityId}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {entry.tags.map((et) => (
                        <TagHoverCard
                          key={et.id}
                          locale={locale}
                          slug={et.slug}
                          name={et.name}
                          translatedName={et.translatedName}
                          category={et.category}
                          isAuthorTag={et.isAuthorTag}
                          locked={et.locked}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </Layout>
  );
}
