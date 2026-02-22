import * as React from "react";
import { cn } from "@/lib/utils";

const InputGroup = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex h-10 w-full items-center overflow-hidden rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950",
        className
      )}
      {...props}
    />
  )
);
InputGroup.displayName = "InputGroup";

const InputGroupInput = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type = "text", ...props }, ref) => (
    <input
      type={type}
      ref={ref}
      data-slot="input-group-control"
      className={cn(
        "flex h-full min-w-0 flex-1 bg-transparent px-3 py-2 text-base text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      {...props}
    />
  )
);
InputGroupInput.displayName = "InputGroupInput";

type InputGroupAddonAlign = "inline-start" | "inline-end";

interface InputGroupAddonProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: InputGroupAddonAlign;
}

const InputGroupAddon = React.forwardRef<HTMLDivElement, InputGroupAddonProps>(
  ({ className, align = "inline-start", ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex h-full shrink-0 items-center justify-center border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400",
        align === "inline-start" && "order-first border-r px-3",
        align === "inline-end" && "order-last border-l px-3",
        className
      )}
      {...props}
    />
  )
);
InputGroupAddon.displayName = "InputGroupAddon";

export { InputGroup, InputGroupInput, InputGroupAddon };
