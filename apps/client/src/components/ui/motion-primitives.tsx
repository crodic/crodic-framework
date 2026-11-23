"use client";

import React from "react";
import { motion, type HTMLMotionProps, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * Stagger container that coordinates the smooth entrance of children items
 */
export function StaggerContainer({
  children,
  className,
  delay = 0,
  stagger = 0.06,
  ...props
}: HTMLMotionProps<"div"> & {
  delay?: number;
  stagger?: number;
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: stagger,
            delayChildren: delay,
          },
        },
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/**
 * Item inside a StaggerContainer with subtle fade & lift
 */
export function StaggerItem({
  children,
  className,
  yOffset = 20,
  ...props
}: HTMLMotionProps<"div"> & { yOffset?: number }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: yOffset },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.45,
            ease: [0.21, 0.47, 0.32, 0.98],
          },
        },
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/**
 * Card with smooth spring hover lift and optional shadow glow
 */
export function HoverLiftCard({
  children,
  className,
  yOffset = -6,
  ...props
}: HTMLMotionProps<"div"> & { yOffset?: number }) {
  return (
    <motion.div
      whileHover={{
        y: yOffset,
        transition: { type: "spring", stiffness: 350, damping: 25 },
      }}
      whileTap={{ scale: 0.98 }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/**
 * Animated heart like button with spring pop
 */
export function AnimatedHeartButton({
  isLiked,
  onClick,
  children,
  className,
  ariaLabel,
}: {
  isLiked: boolean;
  onClick: (e: React.MouseEvent) => void;
  children: React.ReactNode;
  className?: string;
  ariaLabel?: string;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.85 }}
      animate={isLiked ? { scale: [1, 1.28, 1] } : { scale: 1 }}
      transition={{
        duration: 0.3,
        type: "spring",
        stiffness: 400,
        damping: 15,
      }}
      className={className}
      aria-label={ariaLabel}
    >
      {children}
    </motion.button>
  );
}

/**
 * Smooth tab indicator with layoutId animation
 */
export function TabIndicator({
  layoutId = "activeTabIndicator",
  className,
}: {
  layoutId?: string;
  className?: string;
}) {
  return (
    <motion.span
      layoutId={layoutId}
      transition={{ type: "spring", stiffness: 380, damping: 30 }}
      className={cn(
        "bg-primary absolute inset-0 -z-10 rounded-full shadow-xs",
        className
      )}
      aria-hidden="true"
    />
  );
}

export { AnimatePresence, motion };
