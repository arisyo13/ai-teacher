import React, { type FC } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Icon, type IconName } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors",
    "cursor-pointer select-none",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
    "active:scale-[0.98]",
    "aria-[invalid=true]:ring-2 aria-[invalid=true]:ring-red-500 dark:aria-[invalid=true]:ring-red-400 aria-[invalid=true]:ring-offset-2",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      variant: {
        default: [
          "bg-slate-900 text-slate-50 shadow-sm",
          "hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200",
          "focus-visible:ring-slate-400 focus-visible:ring-offset-white dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-950",
        ].join(" "),
        secondary: [
          "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100",
          "hover:bg-slate-200/80 dark:hover:bg-slate-700/80",
          "focus-visible:ring-slate-400 focus-visible:ring-offset-white dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-950",
        ].join(" "),
        outline: [
          "border border-slate-200 bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100",
          "hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-100",
          "focus-visible:ring-slate-400 focus-visible:ring-offset-white dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-950",
        ].join(" "),
        ghost: [
          "text-slate-900 dark:text-slate-100",
          "hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-100",
          "focus-visible:ring-slate-400 focus-visible:ring-offset-white dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-950",
        ].join(" "),
        destructive: [
          "bg-red-600 text-white shadow-sm dark:bg-red-700",
          "hover:bg-red-700 dark:hover:bg-red-800",
          "focus-visible:ring-red-500 focus-visible:ring-offset-white dark:focus-visible:ring-red-400 dark:focus-visible:ring-offset-slate-950",
        ].join(" "),
        link: [
          "text-slate-900 underline-offset-4 dark:text-slate-100",
          "hover:underline hover:text-slate-700 dark:hover:text-slate-300",
          "focus-visible:ring-slate-400 focus-visible:ring-offset-white dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-950",
        ].join(" "),
      },
      size: {
        default: "h-10 px-4 py-2 [&_svg]:size-4",
        xs: "h-8 rounded-md px-2.5 text-xs [&_svg]:size-3.5",
        sm: "h-9 rounded-md px-3 [&_svg]:size-4",
        lg: "h-11 rounded-md px-8 text-base [&_svg]:size-5",
        icon: "h-10 w-10 [&_svg]:size-5",
        "icon-xs": "h-8 w-8 rounded-md [&_svg]:size-4",
        "icon-sm": "h-9 w-9 rounded-md [&_svg]:size-4",
        "icon-lg": "h-11 w-11 rounded-md [&_svg]:size-5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  /** Icon name from the icon registry; rendered before or after children. */
  icon?: IconName;
  /** Position of the icon when `icon` is set. Default `left`. */
  iconPosition?: "left" | "right";
  /** Size of the icon in pixels. Default 16 for normal buttons, 18 for icon sizes. */
  iconSize?: number;
  ref?: React.Ref<HTMLButtonElement>;
}

const iconOnlySizes = new Set(["icon", "icon-xs", "icon-sm", "icon-lg"]);

const Button: FC<ButtonProps> = (props) => {
  const {
    className,
    variant,
    size,
    asChild = false,
    icon,
    iconPosition = "left",
    iconSize,
    ref,
    children,
    ...rest
  } = props;

  const isIconOnly = size != null && iconOnlySizes.has(size);
  const resolvedIconSize = iconSize ?? (isIconOnly ? 18 : 16);
  const iconNode = icon ? (
    <Icon name={icon} size={resolvedIconSize} />
  ) : null;
  const content =
    asChild ? (
      children
    ) : icon && iconNode ? (
      iconPosition === "left" ? (
        <>
          {iconNode}
          {children}
        </>
      ) : (
        <>
          {children}
          {iconNode}
        </>
      )
    ) : (
      children
    );

  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      ref={ref}
      className={cn(buttonVariants({ variant, size, className }))}
      {...rest}
    >
      {content}
    </Comp>
  );
};

export { Button, buttonVariants };
