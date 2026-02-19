import { type VariantProps, cva } from "class-variance-authority";
import { type ComponentPropsWithRef, forwardRef } from "react";

import { cn } from "../utils/cn";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground",
        outline: "text-foreground",
        success:
          "border-transparent bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
        warning:
          "border-transparent bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100",
        // Color palette
        slate:
          "border-transparent bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-100",
        red:
          "border-transparent bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
        orange:
          "border-transparent bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100",
        amber:
          "border-transparent bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100",
        yellow:
          "border-transparent bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100",
        lime:
          "border-transparent bg-lime-100 text-lime-800 dark:bg-lime-900 dark:text-lime-100",
        green:
          "border-transparent bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
        emerald:
          "border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100",
        teal:
          "border-transparent bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-100",
        cyan:
          "border-transparent bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-100",
        sky:
          "border-transparent bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-100",
        blue:
          "border-transparent bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
        indigo:
          "border-transparent bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-100",
        violet:
          "border-transparent bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-100",
        purple:
          "border-transparent bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100",
        fuchsia:
          "border-transparent bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900 dark:text-fuchsia-100",
        pink:
          "border-transparent bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-100",
        rose:
          "border-transparent bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-100",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export type BadgeVariants = VariantProps<typeof badgeVariants>;

export interface BadgeProps
  extends ComponentPropsWithRef<"span">,
    BadgeVariants {}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, ...rest }, ref) => (
    <span
      ref={ref}
      className={cn(badgeVariants({ variant }), className)}
      {...rest}
    />
  ),
);

Badge.displayName = "Badge";

export { badgeVariants };
