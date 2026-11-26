"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";

export function ListError({ onRetry }: { onRetry: () => void }) {
  const t = useTranslations("Common");

  return (
    <Empty className="border-border gap-4 rounded-xl border">
      <EmptyHeader>
        <EmptyTitle role="alert">{t("loadError")}</EmptyTitle>
      </EmptyHeader>
      <EmptyContent>
        <Button type="button" variant="outline" onClick={onRetry}>
          {t("retry")}
        </Button>
      </EmptyContent>
    </Empty>
  );
}
