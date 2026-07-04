import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";

interface NavLinkProps {
  to: string;
  end?: boolean;
  className?: string | ((args: { isActive: boolean }) => string);
  children: ReactNode | ((args: { isActive: boolean }) => ReactNode);
}

export function NavLink({ to, end, className, children }: NavLinkProps) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isActive = end
    ? pathname === to
    : pathname === to || pathname.startsWith(`${to}/`);
  const cls = typeof className === "function" ? className({ isActive }) : className;
  const kids = typeof children === "function" ? children({ isActive }) : children;
  return (
    <Link to={to} className={cls}>
      {kids}
    </Link>
  );
}
