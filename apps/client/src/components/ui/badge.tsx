import * as React from "react";
import { Slot as SlotPrimitive } from "radix-ui";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border border-transparent px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary:
          "bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive:
          "bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border-border text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        ghost: "[a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        link: "text-primary underline-offset-4 [a&]:hover:underline",
        success:
          "border-transparent bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 [a&]:hover:bg-emerald-500/25",
        warning:
          "border-transparent bg-amber-500/15 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 [a&]:hover:bg-amber-500/25",
        info: "border-transparent bg-sky-500/15 text-sky-700 dark:bg-sky-500/20 dark:text-sky-400 [a&]:hover:bg-sky-500/25",
        purple:
          "border-transparent bg-purple-500/15 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300 [a&]:hover:bg-purple-500/25",
        "outline-success":
          "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 [a&]:hover:bg-emerald-500/20",
        "outline-warning":
          "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400 [a&]:hover:bg-amber-500/20",
        "outline-destructive":
          "border-destructive/30 bg-destructive/10 text-destructive [a&]:hover:bg-destructive/20",
        "outline-info":
          "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-400 [a&]:hover:bg-sky-500/20",
        "solid-success":
          "border-transparent bg-emerald-600 text-white [a&]:hover:bg-emerald-700 dark:bg-emerald-600",
        "solid-warning":
          "border-transparent bg-amber-500 text-white [a&]:hover:bg-amber-600 dark:bg-amber-500",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? SlotPrimitive.Slot : "span";

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
