import { ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";

interface Props {
  children: ReactNode;
  to?: string;
  href?: string;
  onClick?: () => void;
  variant?: Variant;
  arrow?: boolean;
  full?: boolean;
  icon?: ReactNode;
  className?: string;
}

const base =
  "focus-ring inline-flex items-center justify-center gap-2 rounded-lg px-5 py-3 font-mono text-[12px] uppercase tracking-[0.14em] transition-all duration-300";

const variants: Record<Variant, string> = {
  primary:
    "bg-gold text-[#0b0b0b] hover:bg-gold-soft hover:shadow-glow font-medium",
  secondary:
    "border border-gold/40 text-gold hover:border-gold hover:bg-gold/10",
  ghost: "text-gold hover:text-gold-soft",
};

export function CTAButton({
  children,
  to,
  href,
  onClick,
  variant = "primary",
  arrow = true,
  full = false,
  icon,
  className = "",
}: Props) {
  const cls = `${base} ${variants[variant]} ${full ? "w-full" : ""} ${className}`;
  const inner = (
    <>
      {icon}
      <span>{children}</span>
      {arrow && <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={`group ${cls}`} onClick={onClick}>
        {inner}
      </Link>
    );
  }
  if (href) {
    return (
      <a href={href} className={`group ${cls}`} target="_blank" rel="noreferrer">
        {inner}
      </a>
    );
  }
  return (
    <button type="button" onClick={onClick} className={`group ${cls}`}>
      {inner}
    </button>
  );
}
