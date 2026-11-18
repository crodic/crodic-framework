import Image from "next/image";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  avatarUrl?: string | null;
  name: string;
  sizes?: string;
  className?: string;
  fallbackClassName?: string;
}

export function UserAvatar({
  avatarUrl,
  name,
  sizes = "36px",
  className,
  fallbackClassName,
}: UserAvatarProps) {
  if (avatarUrl) {
    return (
      <Image
        src={avatarUrl}
        alt={name}
        fill
        sizes={sizes}
        className={cn("object-cover", className)}
      />
    );
  }

  const initial = (name || "?").trim().slice(0, 1).toUpperCase();

  return (
    <div
      className={cn(
        "bg-primary/10 text-primary flex size-full items-center justify-center font-bold select-none",
        fallbackClassName
      )}
    >
      {initial}
    </div>
  );
}
