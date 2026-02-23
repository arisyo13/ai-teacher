import React, { type FC } from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
);

type LabelRef = React.ComponentRef<typeof LabelPrimitive.Root>;
interface LabelProps
  extends React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>,
    VariantProps<typeof labelVariants> {
  ref?: LabelRef;
}

const Label: FC<LabelProps> = (props) => {
  const { className, ref: refProp, ...rest } = props;
  return (
    <LabelPrimitive.Root
      // @ts-expect-error React 19 ref-as-prop type vs Radix Ref type
      ref={refProp}
      className={cn(labelVariants(), className)}
      {...rest}
    />
  );
};

export { Label };
