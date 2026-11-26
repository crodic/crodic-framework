import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { WhiteLabelLogo } from "@/lib/white-label";

export function AuthFormPanel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("w-full max-w-md min-w-0 space-y-6", className)}>
      <Link
        href="/"
        className="mx-auto flex min-h-11 w-fit items-center rounded-md lg:hidden"
      >
        <WhiteLabelLogo className="h-10 w-auto object-contain" />
      </Link>
      {children}
    </div>
  );
}
