import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { ThemeProvider } from "../context/ThemeContext";
import { Header } from "../components/site/Header";
import { Footer } from "../components/site/Footer";

const SITE_TITLE = "Merqato — Agentic Commerce for Hospitality";
const SITE_DESC =
  "AI operators, nomad stays, and Palawan-native ecosystem — booked by agents, approved by humans.";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl font-medium text-ink">404</h1>
        <h2 className="mt-4 text-xl font-medium text-ink">Page not found</h2>
        <p className="mt-2 text-sm text-muted">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="focus-ring inline-flex items-center justify-center rounded-md bg-gold px-4 py-2 text-sm font-medium text-[#0b0b0b] transition-colors hover:bg-gold-soft"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-medium tracking-tight text-ink">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="focus-ring inline-flex items-center justify-center rounded-md bg-gold px-4 py-2 text-sm font-medium text-[#0b0b0b] transition-colors hover:bg-gold-soft"
          >
            Try again
          </button>
          <a
            href="/"
            className="focus-ring inline-flex items-center justify-center rounded-md border border-gold/40 bg-transparent px-4 py-2 text-sm font-medium text-gold transition-colors hover:bg-gold/10"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: SITE_TITLE },
      { name: "description", content: SITE_DESC },
      { name: "author", content: "Merqato" },
      { property: "og:title", content: SITE_TITLE },
      { property: "og:description", content: SITE_DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "AI Agent Webshop" },
      { property: "og:title", content: "AI Agent Webshop" },
      { name: "twitter:title", content: "AI Agent Webshop" },
      { name: "description", content: "Pixel Perfect Clone recreates a web store interface using TanStack Start and React." },
      { property: "og:description", content: "Pixel Perfect Clone recreates a web store interface using TanStack Start and React." },
      { name: "twitter:description", content: "Pixel Perfect Clone recreates a web store interface using TanStack Start and React." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/T9Th5uPVO0aXJIb4F3X0QFtM7K13/social-images/social-1783215791797-WhatsApp_Image_2026-07-04_at_7.36.54_AM_(1).webp" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/T9Th5uPVO0aXJIb4F3X0QFtM7K13/social-images/social-1783215791797-WhatsApp_Image_2026-07-04_at_7.36.54_AM_(1).webp" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function ScrollToTop() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  useEffect(() => {
    if (typeof window !== "undefined") window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <div className="flex min-h-screen flex-col bg-bg text-ink">
          <ScrollToTop />
          <Header />
          <main className="flex-1">
            <Outlet />
          </main>
          <Footer />
        </div>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
