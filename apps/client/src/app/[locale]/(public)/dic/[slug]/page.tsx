import React from "react";
import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import type { Article, WithContext } from "schema-dts";
import {
  ArrowLeft,
  ArrowUpRight,
  BadgeCheck,
  BookOpenText,
  Eye,
  GitBranch,
  Link2,
  Split,
  Tags,
} from "lucide-react";
import { Footer } from "@/components/layouts/footer";
import { Header } from "@/components/layouts/header";
import Layout from "@/components/layouts/layout";
import { TagHoverCard } from "@/components/tags/tag-hover-card";
import { getTagCategoryToken } from "@/components/tags/tag-tokens";
import { WikiCommunityEditor } from "@/components/tags/wiki-community-editor";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import {
  fetchTagBySlugSSR,
  fetchTagEncyclopediaBySlugSSR,
} from "@/services/tags";

type PageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const tag = await fetchTagBySlugSSR(decodedSlug, locale);

  if (!tag) {
    return { title: "Encyclopedia Entry Not Found" };
  }

  const canonicalSlug = tag.redirectSlug || tag.slug;
  const wiki = await fetchTagEncyclopediaBySlugSSR(canonicalSlug, locale);
  const displayTitle = tag.translatedName || tag.name;
  const coverImage = wiki?.featuredImageUrl || tag.featuredImageUrl;

  return {
    title: `${displayTitle} (${tag.name}) — Pixiv Encyclopedia (dic)`,
    description:
      wiki?.summary ||
      tag.shortSummary ||
      `Community-curated Pixiv Encyclopedia entry and semantic taxonomy graph for #${displayTitle}.`,
    openGraph: coverImage
      ? {
          images: [{ url: coverImage, alt: displayTitle }],
        }
      : undefined,
    alternates: {
      canonical: `/${locale}/dic/${canonicalSlug}`,
    },
  };
}

export default async function TagEncyclopediaPage({ params }: PageProps) {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "Tags" });
  const decodedSlug = decodeURIComponent(slug);

  const tag = await fetchTagBySlugSSR(decodedSlug, locale);
  if (!tag) {
    notFound();
  }

  // 308 Permanent Redirect for orthographic aliases and merged tags
  if (tag.redirectSlug && tag.redirectSlug !== decodedSlug) {
    permanentRedirect(`/${locale}/dic/${encodeURIComponent(tag.redirectSlug)}`);
  }

  const wiki = await fetchTagEncyclopediaBySlugSSR(tag.slug, locale);
  const displayTitle = tag.translatedName?.trim() || tag.name;
  const categoryToken = getTagCategoryToken(tag.category);
  const featuredImageUrl = wiki?.featuredImageUrl || tag.featuredImageUrl;

  const jsonLd: WithContext<Article> = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${displayTitle} — Pixiv Encyclopedia (dic)`,
    description: wiki?.summary || tag.shortSummary || undefined,
    image: featuredImageUrl || undefined,
    dateModified: wiki?.updatedAt || tag.updatedAt,
    about: {
      "@type": "DefinedTerm",
      name: displayTitle,
      termCode: tag.slug,
    },
  };

  const { parents, children, siblings, related, disambiguations } = tag.graph;

  return (
    <Layout>
      <Header />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="mx-auto w-full max-w-6xl space-y-8 px-4 py-8 sm:px-6 md:py-12">
        {/* Top Breadcrumb Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-medium">
            <Link
              href="/dic"
              className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="size-3.5" aria-hidden="true" />
              Encyclopedia (dic)
            </Link>
            <span className="text-muted-foreground">/</span>
            <Link
              href={`/tags/${tag.slug}`}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              #{displayTitle}
            </Link>
          </div>

          <WikiCommunityEditor
            tagId={tag.id}
            tagName={tag.name}
            locale={locale}
            initialSummary={wiki?.summary || tag.shortSummary || ""}
            initialBody={wiki?.body || ""}
            isEditLocked={Boolean(wiki?.isEditLocked)}
            currentRevision={wiki?.currentRevision ?? 0}
            revisions={wiki?.revisions ?? []}
            contributeLabel={t("contributeWiki")}
            lockedLabel={t("lockedWiki")}
            revisionsLabel={t("revisionHistory")}
          />
        </div>

        {/* Disambiguation Notice (曖昧さ回避) */}
        {disambiguations.length > 0 && (
          <Alert>
            <Split className="size-4 text-amber-500" aria-hidden="true" />
            <AlertTitle>{t("disambiguations")} (曖昧さ回避)</AlertTitle>
            <AlertDescription className="mt-2 flex flex-wrap items-center gap-2">
              <span className="text-xs">
                This term may also refer to distinct canonical concepts:
              </span>
              {disambiguations.map((dis) => (
                <TagHoverCard
                  key={dis.id}
                  locale={locale}
                  slug={dis.slug}
                  name={dis.name}
                  translatedName={dis.translatedName}
                  category={dis.category}
                  showWikiLink
                />
              ))}
            </AlertDescription>
          </Alert>
        )}

        {/* 2-Column Pixiv Encyclopedia Reader + Taxonomy Infobox */}
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
          {/* Left: Encyclopedia Article */}
          <article className="bg-card space-y-6 rounded-2xl border p-6 shadow-xs sm:p-8">
            <header className="space-y-3 border-b pb-5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="gap-1.5 text-xs">
                  <BookOpenText
                    className="text-primary size-3.5"
                    aria-hidden="true"
                  />
                  {t("dicHubBadge")} ({locale.toUpperCase()})
                </Badge>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wider uppercase ${categoryToken.badge}`}
                >
                  <span
                    className={`size-2 rounded-full ${categoryToken.dot}`}
                    aria-hidden="true"
                  />
                  {categoryToken.label}
                </span>
                {tag.isOfficial && (
                  <Badge variant="secondary" className="gap-1 text-xs">
                    <BadgeCheck
                      className="text-primary size-3.5"
                      aria-hidden="true"
                    />
                    {t("officialBadge")}
                  </Badge>
                )}
                {wiki && (
                  <span className="text-muted-foreground inline-flex items-center gap-1 font-mono text-xs tabular-nums">
                    <Eye className="size-3.5" aria-hidden="true" />
                    {t("viewsCount", {
                      count: wiki.viewCount.toLocaleString(),
                    })}
                  </span>
                )}
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-balance">
                {displayTitle}
              </h1>

              {tag.translatedName &&
                tag.translatedName.trim() !== tag.name.trim() && (
                  <p className="text-muted-foreground font-mono text-sm">
                    {t("canonicalPrefix")} #{tag.name}
                  </p>
                )}

              {(wiki?.summary || tag.shortSummary) && (
                <p className="text-foreground/90 bg-muted/40 border-l-primary rounded-lg border-l-4 p-3.5 text-sm leading-relaxed text-pretty">
                  {wiki?.summary || tag.shortSummary}
                </p>
              )}

              {featuredImageUrl && (
                <div className="bg-muted/20 overflow-hidden rounded-xl border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={featuredImageUrl}
                    alt={displayTitle}
                    className="aspect-[21/9] max-h-72 w-full object-cover"
                  />
                </div>
              )}
            </header>

            {wiki?.body ? (
              /* nosemgrep: typescript.react.security.audit.react-dangerouslysetinnerhtml */
              <div
                className="prose dark:prose-invert max-w-none text-pretty"
                dangerouslySetInnerHTML={{ __html: wiki.body }}
              />
            ) : (
              <div className="space-y-3 rounded-xl border border-dashed p-8 text-center">
                <BookOpenText
                  className="text-muted-foreground mx-auto size-8 opacity-60"
                  aria-hidden="true"
                />
                <h2 className="text-base font-semibold">
                  {t("wikiEmptyTitle", { locale: locale.toUpperCase() })}
                </h2>
                <p className="text-muted-foreground mx-auto max-w-md text-xs leading-relaxed text-pretty">
                  {t("wikiEmptyDesc", { name: displayTitle })}
                </p>
              </div>
            )}
          </article>

          {/* Right: Semantic Taxonomy Infobox */}
          <aside className="space-y-4">
            <Card className="shadow-2xs">
              <CardHeader className="border-b pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                  <Tags className="text-primary size-4" aria-hidden="true" />
                  {t("taxonomyInfobox")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-4 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    {t("taggedWorks")}
                  </span>
                  <span className="font-mono font-semibold tabular-nums">
                    {tag.usageCount.toLocaleString()}
                  </span>
                </div>

                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="h-auto w-full min-w-0 justify-center px-3 py-2 text-xs leading-normal"
                >
                  <Link
                    href={`/tags/${tag.slug}`}
                    className="flex min-w-0 items-center justify-center gap-1.5"
                  >
                    <span className="truncate">{t("viewTaggedWorks")}</span>
                    <ArrowUpRight
                      className="size-3.5 shrink-0"
                      aria-hidden="true"
                    />
                  </Link>
                </Button>

                {parents.length > 0 && (
                  <div className="space-y-1.5 border-t pt-3">
                    <p className="text-muted-foreground flex items-center gap-1 font-medium">
                      <GitBranch className="size-3.5" aria-hidden="true" />
                      {t("parents")} (親タグ)
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {parents.map((p) => (
                        <TagHoverCard
                          key={`parent-${p.id}`}
                          locale={locale}
                          slug={p.slug}
                          name={p.name}
                          translatedName={p.translatedName}
                          category={p.category}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {siblings.length > 0 && (
                  <div className="space-y-1.5 border-t pt-3">
                    <p className="text-muted-foreground font-medium">
                      {t("siblings")} (兄弟タグ)
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {siblings.map((s) => (
                        <TagHoverCard
                          key={`sibling-${s.id}`}
                          locale={locale}
                          slug={s.slug}
                          name={s.name}
                          translatedName={s.translatedName}
                          category={s.category}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {children.length > 0 && (
                  <div className="space-y-1.5 border-t pt-3">
                    <p className="text-muted-foreground flex items-center gap-1 font-medium">
                      <GitBranch className="size-3.5" aria-hidden="true" />
                      {t("children")} (子タグ)
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {children.map((c) => (
                        <TagHoverCard
                          key={`child-${c.id}`}
                          locale={locale}
                          slug={c.slug}
                          name={c.name}
                          translatedName={c.translatedName}
                          category={c.category}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {related.length > 0 && (
                  <div className="space-y-1.5 border-t pt-3">
                    <p className="text-muted-foreground flex items-center gap-1 font-medium">
                      <Link2 className="size-3.5" aria-hidden="true" />
                      {t("related")} (関連タグ)
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {related.map((r) => (
                        <TagHoverCard
                          key={`related-${r.id}`}
                          locale={locale}
                          slug={r.slug}
                          name={r.name}
                          translatedName={r.translatedName}
                          category={r.category}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {tag.aliases && tag.aliases.length > 0 && (
                  <div className="space-y-1.5 border-t pt-3">
                    <p className="text-muted-foreground font-medium">
                      {t("aliases")} (表記揺れ)
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {tag.aliases.map((al) => (
                        <Badge
                          key={al.id}
                          variant="secondary"
                          className="text-[11px] font-normal"
                        >
                          {al.aliasName}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </aside>
        </div>
      </main>
      <Footer />
    </Layout>
  );
}
