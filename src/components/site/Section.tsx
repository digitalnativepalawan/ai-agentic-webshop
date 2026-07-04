import type { ReactNode } from "react";

export function Section({
  children,
  className = "",
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={`shell py-14 sm:py-16 ${className}`}>
      {children}
    </section>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="eyebrow mb-6">{children}</p>;
}

/** Decorative gold particle sweep for hero corners. */
export function HeroBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="aurora absolute inset-0" />
      <div className="hero-sweep absolute right-0 top-0 h-[520px] w-[70%]" />
    </div>
  );
}
