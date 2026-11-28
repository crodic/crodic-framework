"use client";

import React from "react";
import { Link } from "@/i18n/navigation";
import { GitBranch, FolderTree, Wand2, HelpCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import type { TagGraphResDto, TagSummaryResDto } from "@/services/tags";
import { TagCategoryBadge } from "./tag-category-badge";
import { TagHoverCard } from "./tag-hover-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TagHierarchyTreeProps {
  graph: TagGraphResDto;
  tagName: string;
}

export function TagHierarchyTree({ graph, tagName }: TagHierarchyTreeProps) {
  const t = useTranslations("Tags");

  const hasParents = graph.parents && graph.parents.length > 0;
  const hasChildren = graph.children && graph.children.length > 0;
  const hasRelated = graph.related && graph.related.length > 0;
  const hasDisambiguations =
    graph.disambiguations && graph.disambiguations.length > 0;

  const totalRelations =
    (graph.parents?.length || 0) +
    (graph.children?.length || 0) +
    (graph.related?.length || 0) +
    (graph.disambiguations?.length || 0);

  if (totalRelations === 0) {
    return (
      <div className="border-border/70 text-muted-foreground rounded-2xl border border-dashed p-8 text-center text-xs">
        <GitBranch className="text-muted-foreground/60 mx-auto mb-2 size-6" />
        <p>Chưa có quan hệ phả hệ hoặc liên kết taxonomy nào cho #{tagName}.</p>
      </div>
    );
  }

  const renderChip = (item: TagSummaryResDto) => {
    const slug = item.slug || encodeURIComponent(item.name);
    return (
      <TagHoverCard key={item.id} slugOrName={slug}>
        <Link
          href={`/tags/${slug}`}
          className="group border-border/70 bg-card hover:border-primary/50 hover:bg-primary/5 hover:text-primary inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold shadow-2xs transition-all"
        >
          <span className="text-primary/70 group-hover:text-primary font-bold">
            #
          </span>
          <span className="text-foreground group-hover:text-primary">
            {item.name}
          </span>
          {item.translatedName && item.translatedName !== item.name && (
            <span className="text-muted-foreground text-[11px] font-normal">
              ({item.translatedName})
            </span>
          )}
          <TagCategoryBadge
            category={item.category}
            showIcon={false}
            className="px-1.5 py-0 text-[10px]"
          />
          {item.usageCount > 0 && (
            <span className="text-muted-foreground/70 font-mono text-[10px] tabular-nums">
              {item.usageCount.toLocaleString()}
            </span>
          )}
        </Link>
      </TagHoverCard>
    );
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {/* 1. Parent Franchise / Origin */}
      {hasParents && (
        <Card className="border-border/70 shadow-2xs">
          <CardHeader className="border-border/50 border-b p-4 pb-3">
            <CardTitle className="text-muted-foreground flex items-center gap-2 text-xs font-bold tracking-wider uppercase">
              <FolderTree className="size-4 text-violet-500" />
              <span>{t("parentSeries")}</span>
              <span className="text-foreground ml-auto font-mono text-xs font-bold">
                ({graph.parents.length})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2 p-4">
            {graph.parents.map(renderChip)}
          </CardContent>
        </Card>
      )}

      {/* 2. Child Variants / Sub-concepts */}
      {hasChildren && (
        <Card className="border-border/70 shadow-2xs">
          <CardHeader className="border-border/50 border-b p-4 pb-3">
            <CardTitle className="text-muted-foreground flex items-center gap-2 text-xs font-bold tracking-wider uppercase">
              <GitBranch className="size-4 text-emerald-500" />
              <span>{t("childVariants")}</span>
              <span className="text-foreground ml-auto font-mono text-xs font-bold">
                ({graph.children.length})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2 p-4">
            {graph.children.map(renderChip)}
          </CardContent>
        </Card>
      )}

      {/* 3. Related Tags */}
      {hasRelated && (
        <Card className="border-border/70 shadow-2xs">
          <CardHeader className="border-border/50 border-b p-4 pb-3">
            <CardTitle className="text-muted-foreground flex items-center gap-2 text-xs font-bold tracking-wider uppercase">
              <Wand2 className="size-4 text-amber-500" />
              <span>{t("relatedTags")}</span>
              <span className="text-foreground ml-auto font-mono text-xs font-bold">
                ({graph.related.length})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2 p-4">
            {graph.related.map(renderChip)}
          </CardContent>
        </Card>
      )}

      {/* 4. Disambiguation */}
      {hasDisambiguations && (
        <Card className="border-border/70 shadow-2xs">
          <CardHeader className="border-border/50 border-b p-4 pb-3">
            <CardTitle className="text-muted-foreground flex items-center gap-2 text-xs font-bold tracking-wider uppercase">
              <HelpCircle className="size-4 text-sky-500" />
              <span>Phân biệt nghĩa (Disambiguation)</span>
              <span className="text-foreground ml-auto font-mono text-xs font-bold">
                ({graph.disambiguations.length})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2 p-4">
            {graph.disambiguations.map(renderChip)}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
