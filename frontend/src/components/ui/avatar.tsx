import React, { type FC } from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cn } from "@/lib/utils";

type AvatarRef = React.ComponentRef<typeof AvatarPrimitive.Root>;
interface AvatarProps extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> {
  ref?: AvatarRef;
}

const Avatar: FC<AvatarProps> = (props) => {
  const { className, ref: refProp, ...rest } = props;
  return (
    <AvatarPrimitive.Root
      // @ts-expect-error React 19 ref-as-prop type vs Radix Ref type
      ref={refProp}
      className={cn(
        "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
        className
      )}
      {...rest}
    />
  );
};

type AvatarImageRef = React.ComponentRef<typeof AvatarPrimitive.Image>;
interface AvatarImageProps extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image> {
  ref?: AvatarImageRef;
}

const AvatarImage: FC<AvatarImageProps> = (props) => {
  const { className, ref: refProp, ...rest } = props;
  return (
    <AvatarPrimitive.Image
      // @ts-expect-error React 19 ref-as-prop type vs Radix Ref type
      ref={refProp}
      className={cn("aspect-square h-full w-full", className)}
      {...rest}
    />
  );
};

type AvatarFallbackRef = React.ComponentRef<typeof AvatarPrimitive.Fallback>;
interface AvatarFallbackProps
  extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback> {
  ref?: AvatarFallbackRef;
}

const AvatarFallback: FC<AvatarFallbackProps> = (props) => {
  const { className, ref: refProp, ...rest } = props;
  return (
    <AvatarPrimitive.Fallback
      // @ts-expect-error React 19 ref-as-prop type vs Radix Ref type
      ref={refProp}
      className={cn(
        "flex h-full w-full items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400",
        className
      )}
      {...rest}
    />
  );
};

export { Avatar, AvatarImage, AvatarFallback };
