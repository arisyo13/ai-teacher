import React, { type FC } from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { cn } from "@/lib/utils";

const DropdownMenu = DropdownMenuPrimitive.Root;
const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
const DropdownMenuGroup = DropdownMenuPrimitive.Group;
const DropdownMenuPortal = DropdownMenuPrimitive.Portal;
const DropdownMenuSub = DropdownMenuPrimitive.Sub;
const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;

type DropdownMenuSubTriggerRef = React.ComponentRef<typeof DropdownMenuPrimitive.SubTrigger>;
interface DropdownMenuSubTriggerProps
  extends React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger> {
  inset?: boolean;
  ref?: DropdownMenuSubTriggerRef;
}

const DropdownMenuSubTrigger: FC<DropdownMenuSubTriggerProps> = (props) => {
  const { className, inset, children, ref: refProp, ...rest } = props;
  return (
    <DropdownMenuPrimitive.SubTrigger
      // @ts-expect-error React 19 ref-as-prop type vs Radix Ref type
      ref={refProp}
      className={cn(
        "flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-slate-100 focus:text-slate-900 data-[state=open]:bg-slate-100 dark:focus:bg-slate-800 dark:focus:text-slate-100 dark:data-[state=open]:bg-slate-800 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
        inset && "pl-8",
        className
      )}
      {...rest}
    >
      {children}
    </DropdownMenuPrimitive.SubTrigger>
  );
};

type DropdownMenuSubContentRef = React.ComponentRef<typeof DropdownMenuPrimitive.SubContent>;
interface DropdownMenuSubContentProps
  extends React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent> {
  ref?: DropdownMenuSubContentRef;
}

const DropdownMenuSubContent: FC<DropdownMenuSubContentProps> = (props) => {
  const { className, ref: refProp, ...rest } = props;
  return (
    <DropdownMenuPrimitive.SubContent
      // @ts-expect-error React 19 ref-as-prop type vs Radix Ref type
      ref={refProp}
      className={cn(
        "z-50 min-w-[8rem] overflow-hidden rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-1 text-slate-900 dark:text-slate-100 shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className
      )}
      {...rest}
    />
  );
};

type DropdownMenuContentRef = React.ComponentRef<typeof DropdownMenuPrimitive.Content>;
interface DropdownMenuContentProps
  extends React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content> {
  ref?: DropdownMenuContentRef;
}

const DropdownMenuContent: FC<DropdownMenuContentProps> = (props) => {
  const { className, sideOffset = 4, ref: refProp, ...rest } = props;
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        // @ts-expect-error React 19 ref-as-prop type vs Radix Ref type
        ref={refProp}
        sideOffset={sideOffset}
        className={cn(
          "z-50 min-w-[8rem] overflow-hidden rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-1 text-slate-900 dark:text-slate-100 shadow-md",
          "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          className
        )}
        {...rest}
      />
    </DropdownMenuPrimitive.Portal>
  );
};

type DropdownMenuItemRef = React.ComponentRef<typeof DropdownMenuPrimitive.Item>;
interface DropdownMenuItemProps
  extends React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> {
  inset?: boolean;
  ref?: DropdownMenuItemRef;
}

const DropdownMenuItem: FC<DropdownMenuItemProps> = (props) => {
  const { className, inset, ref: refProp, ...rest } = props;
  return (
    <DropdownMenuPrimitive.Item
      // @ts-expect-error React 19 ref-as-prop type vs Radix Ref type
      ref={refProp}
      className={cn(
        "relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-slate-100 focus:text-slate-900 dark:focus:bg-slate-800 dark:focus:text-slate-100 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
        inset && "pl-8",
        className
      )}
      {...rest}
    />
  );
};

type DropdownMenuCheckboxItemRef = React.ComponentRef<typeof DropdownMenuPrimitive.CheckboxItem>;
interface DropdownMenuCheckboxItemProps
  extends React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem> {
  ref?: DropdownMenuCheckboxItemRef;
}

const DropdownMenuCheckboxItem: FC<DropdownMenuCheckboxItemProps> = (props) => {
  const { className, children, checked, ref: refProp, ...rest } = props;
  return (
    <DropdownMenuPrimitive.CheckboxItem
      // @ts-expect-error React 19 ref-as-prop type vs Radix Ref type
      ref={refProp}
      className={cn(
        "relative flex cursor-default select-none items-center gap-2 rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-slate-100 focus:text-slate-900 dark:focus:bg-slate-800 dark:focus:text-slate-100 data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
      checked={checked}
      {...rest}
    >
      {children}
    </DropdownMenuPrimitive.CheckboxItem>
  );
};

type DropdownMenuRadioItemRef = React.ComponentRef<typeof DropdownMenuPrimitive.RadioItem>;
interface DropdownMenuRadioItemProps
  extends React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem> {
  ref?: DropdownMenuRadioItemRef;
}

const DropdownMenuRadioItem: FC<DropdownMenuRadioItemProps> = (props) => {
  const { className, children, ref: refProp, ...rest } = props;
  return (
    <DropdownMenuPrimitive.RadioItem
      // @ts-expect-error React 19 ref-as-prop type vs Radix Ref type
      ref={refProp}
      className={cn(
        "relative flex cursor-default select-none items-center gap-2 rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-slate-100 focus:text-slate-900 dark:focus:bg-slate-800 dark:focus:text-slate-100 data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
      {...rest}
    >
      {children}
    </DropdownMenuPrimitive.RadioItem>
  );
};

type DropdownMenuLabelRef = React.ComponentRef<typeof DropdownMenuPrimitive.Label>;
interface DropdownMenuLabelProps
  extends React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label> {
  inset?: boolean;
  ref?: DropdownMenuLabelRef;
}

const DropdownMenuLabel: FC<DropdownMenuLabelProps> = (props) => {
  const { className, inset, ref: refProp, ...rest } = props;
  return (
    <DropdownMenuPrimitive.Label
      // @ts-expect-error React 19 ref-as-prop type vs Radix Ref type
      ref={refProp}
      className={cn(
        "px-2 py-1.5 text-sm font-semibold",
        inset && "pl-8",
        className
      )}
      {...rest}
    />
  );
};

type DropdownMenuSeparatorRef = React.ComponentRef<typeof DropdownMenuPrimitive.Separator>;
interface DropdownMenuSeparatorProps
  extends React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator> {
  ref?: DropdownMenuSeparatorRef;
}

const DropdownMenuSeparator: FC<DropdownMenuSeparatorProps> = (props) => {
  const { className, ref: refProp, ...rest } = props;
  return (
    <DropdownMenuPrimitive.Separator
      // @ts-expect-error React 19 ref-as-prop type vs Radix Ref type
      ref={refProp}
      className={cn("-mx-1 my-1 h-px bg-slate-100 dark:bg-slate-800", className)}
      {...rest}
    />
  );
};

const DropdownMenuShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => (
  <span
    className={cn("ml-auto text-xs tracking-widest opacity-60", className)}
    {...props}
  />
);

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuCheckboxItem,
};
