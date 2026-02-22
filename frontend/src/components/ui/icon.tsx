import type { IconType } from "react-icons";
import {
  MdDashboard,
  MdLogout,
  MdDarkMode,
  MdLightMode,
  MdPerson,
  MdSchool,
  MdMenuBook,
  MdPeople,
  MdSearch,
  MdClose,
} from "react-icons/md";
import { FiSidebar } from "react-icons/fi";
import { cn } from "@/lib/utils";

const ICON_REGISTRY = {
  "layout-dashboard": MdDashboard,
  "log-out": MdLogout,
  moon: MdDarkMode,
  sun: MdLightMode,
  user: MdPerson,
  school: MdSchool,
  "menu-book": MdMenuBook,
  people: MdPeople,
  search: MdSearch,
  close: MdClose,
  "panel-left": FiSidebar,
} as const satisfies Record<string, IconType>;

export type IconName = keyof typeof ICON_REGISTRY;

export interface IconProps extends React.SVGAttributes<SVGElement> {
  name: IconName;
  size?: number;
  className?: string;
}

export const Icon = ({ name, size = 24, className, ...props }: IconProps) => {
  const Component = ICON_REGISTRY[name];
  return (
    <Component
      size={size}
      className={cn("shrink-0", className)}
      aria-hidden
      {...props}
    />
  );
};
