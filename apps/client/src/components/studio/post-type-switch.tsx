"use client";

import { Film, Images } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

const POST_TYPES = [
  { id: "photoset", label: "photoPostType", icon: Images },
  { id: "video", label: "videoPostType", icon: Film },
] as const;

type PostType = (typeof POST_TYPES)[number]["id"];

export function PostTypeSwitch({
  value,
  onChange,
}: {
  value: PostType;
  onChange: (value: PostType) => void;
}) {
  const t = useTranslations("Studio");

  return (
    <div className="bg-muted flex w-fit max-w-full flex-wrap gap-1 rounded-lg p-1">
      {POST_TYPES.map(({ id, label, icon: Icon }) => (
        <Button
          key={id}
          type="button"
          size="sm"
          variant={value === id ? "default" : "ghost"}
          aria-pressed={value === id}
          onClick={() => onChange(id)}
          className="h-9 shadow-none"
        >
          <Icon aria-hidden="true" />
          {t(label)}
        </Button>
      ))}
    </div>
  );
}
