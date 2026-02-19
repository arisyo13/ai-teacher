import React, { type FC } from "react";
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  ref?: React.Ref<HTMLDivElement>;
}

const Card: FC<CardProps> = (props) => {
  const { className, ref, ...rest } = props;
  return (
    <div
      ref={ref}
      className={cn(
        "rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow",
        className
      )}
      {...rest}
    />
  );
};

const CardHeader: FC<CardProps> = (props) => {
  const { className, ref, ...rest } = props;
  return <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...rest} />;
};

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  ref?: React.Ref<HTMLParagraphElement>;
}

const CardTitle: FC<CardTitleProps> = (props) => {
  const { className, ref, ...rest } = props;
  return (
    <h3
      ref={ref}
      className={cn("text-2xl font-semibold leading-none tracking-tight", className)}
      {...rest}
    />
  );
};

interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  ref?: React.Ref<HTMLParagraphElement>;
}

const CardDescription: FC<CardDescriptionProps> = (props) => {
  const { className, ref, ...rest } = props;
  return (
    <p ref={ref} className={cn("text-sm text-slate-500 dark:text-slate-400", className)} {...rest} />
  );
};

const CardContent: FC<CardProps> = (props) => {
  const { className, ref, ...rest } = props;
  return <div ref={ref} className={cn("p-6 pt-0", className)} {...rest} />;
};

const CardFooter: FC<CardProps> = (props) => {
  const { className, ref, ...rest } = props;
  return <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...rest} />;
};

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
