import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useRouterState } from "@tanstack/react-router";
import { NavLink } from "./NavLink";
import { Menu, UserRound, X } from "lucide-react";
import { NAV } from "@/lib/site-data";
import { ThemeToggle } from "./ThemeToggle";
import { CTAButton } from "./CTAButton";

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-colors duration-300 ${
        scrolled
          ? "border-b border-line/20 bg-bg/85 backdrop-blur-md"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="shell flex h-16 items-center justify-between gap-4">
        <Link to="/" className="focus-ring flex items-center gap-2.5">
          <span className="font-display text-[22px] font-medium tracking-tight leading-none">
            <span className="text-ink">mer</span><span className="text-gold">Q</span><span className="text-ink">ato</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `focus-ring relative py-1 text-[14px] transition-colors ${
                  isActive ? "text-gold" : "text-muted hover:text-ink"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {item.label}
                  {isActive && (
                    <span className="absolute -bottom-0.5 left-0 h-px w-full bg-gold" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2.5">
          <ThemeToggle />
          <div className="hidden sm:block">
            <CTAButton
              to="/mission-control"
              variant="secondary"
              arrow={false}
              icon={<UserRound size={14} />}
              className="!py-2 !text-[11px]"
            >
              Mission Control Login
            </CTAButton>
          </div>
          <button
            type="button"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
            className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gold/30 text-gold lg:hidden"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-line/20 bg-bg/95 backdrop-blur-md lg:hidden">
          <nav className="shell flex flex-col py-3">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `focus-ring rounded-md px-2 py-3 text-[15px] ${
                    isActive ? "text-gold" : "text-muted"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            <Link
              to="/mission-control"
              className="focus-ring mt-2 flex items-center gap-2 rounded-md border border-gold/30 px-3 py-3 text-[13px] text-gold"
            >
              <UserRound size={15} /> Mission Control Login
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
