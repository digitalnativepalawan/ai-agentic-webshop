import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  BarChart3,
  Bot,
  CalendarDays,
  ChevronDown,
  FileText,
  Gauge,
  Image,
  Link2,
  Menu,
  PenLine,
  Settings2,
  Users,
} from "lucide-react";

import { AdminGate, useAdminAuth } from "./AdminGate";
import { PostCalendar } from "./social-media/PostCalendar";
import { PostComposer } from "./social-media/PostComposer";
import { PostQueue } from "./social-media/PostQueue";
import { PostizConnection, type PostizConnectionState } from "./social-media/PostizConnection";
import { SocialConnections } from "./social-media/SocialConnections";
import {
  getPostizConfiguration,
  listPostizConnectedAccounts,
  listSocialPosts,
  testPostizConnection,
} from "@/lib/postiz.functions";
import type { PostizIntegration, PostizPost } from "@/lib/postiz.schemas";

type View =
  | "dashboard"
  | "create"
  | "calendar"
  | "posts"
  | "media"
  | "analytics"
  | "accounts"
  | "brain"
  | "connection"
  | "preferences";

const NAV: Array<{
  id: View;
  label: string;
  icon: typeof Gauge;
  group: "main" | "accounts" | "settings";
}> = [
  { id: "dashboard", label: "Dashboard", icon: Gauge, group: "main" },
  { id: "create", label: "Create Post", icon: PenLine, group: "main" },
  { id: "calendar", label: "Content Calendar", icon: CalendarDays, group: "main" },
  { id: "posts", label: "Posts", icon: FileText, group: "main" },
  { id: "media", label: "Media Library", icon: Image, group: "main" },
  { id: "analytics", label: "Analytics", icon: BarChart3, group: "main" },
  { id: "accounts", label: "Connected Accounts", icon: Users, group: "accounts" },
  { id: "brain", label: "AI Brain", icon: Bot, group: "settings" },
  { id: "connection", label: "Postiz Connection", icon: Link2, group: "settings" },
  { id: "preferences", label: "Preferences", icon: Settings2, group: "settings" },
];

const EMPTY_CONNECTION: PostizConnectionState = {
  connected: false,
  urlConfigured: false,
  apiKeyConfigured: false,
  host: null,
  checkedAt: null,
  integrationCount: 0,
};

function dateRange() {
  const start = new Date();
  start.setDate(start.getDate() - 30);
  const end = new Date();
  end.setDate(end.getDate() + 90);
  return { startDate: start.toISOString(), endDate: end.toISOString() };
}

function SocialMediaManager() {
  const { passkey, lock } = useAdminAuth();
  const getConfiguration = useServerFn(getPostizConfiguration);
  const listAccounts = useServerFn(listPostizConnectedAccounts);
  const listPosts = useServerFn(listSocialPosts);
  const testConnection = useServerFn(testPostizConnection);
  const [view, setView] = useState<View>("create");
  const [integrations, setIntegrations] = useState<PostizIntegration[]>([]);
  const [posts, setPosts] = useState<PostizPost[]>([]);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [connection, setConnection] = useState<PostizConnectionState>(EMPTY_CONNECTION);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [connectionBusy, setConnectionBusy] = useState(false);
  const [error, setError] = useState("");
  const [connectionError, setConnectionError] = useState("");

  const refreshAccounts = useCallback(async () => {
    setRefreshing(true);
    setError("");
    try {
      const result = await listAccounts({ data: { passkey } });
      setIntegrations(result.integrations);
      setLastSync(result.checkedAt);
    } catch (refreshError) {
      setError(
        refreshError instanceof Error ? refreshError.message : "Could not load Postiz accounts.",
      );
    } finally {
      setRefreshing(false);
    }
  }, [listAccounts, passkey]);

  const refreshPosts = useCallback(async () => {
    const range = dateRange();
    try {
      setPosts(await listPosts({ data: { passkey, ...range } }));
    } catch (postsError) {
      setError(postsError instanceof Error ? postsError.message : "Could not load Postiz posts.");
    }
  }, [listPosts, passkey]);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      const range = dateRange();
      const [configurationResult, accountsResult, postsResult] = await Promise.allSettled([
        getConfiguration({ data: { passkey } }),
        listAccounts({ data: { passkey } }),
        listPosts({ data: { passkey, ...range } }),
      ]);
      if (!active) return;
      if (configurationResult.status === "fulfilled") {
        setConnection((current) => ({ ...current, ...configurationResult.value }));
      }
      if (accountsResult.status === "fulfilled") {
        setIntegrations(accountsResult.value.integrations);
        setLastSync(accountsResult.value.checkedAt);
      } else {
        setError(
          accountsResult.reason instanceof Error
            ? accountsResult.reason.message
            : "Could not load Postiz accounts.",
        );
      }
      if (postsResult.status === "fulfilled") setPosts(postsResult.value);
      setLoading(false);
    }
    load();
    return () => {
      active = false;
    };
  }, [getConfiguration, listAccounts, listPosts, passkey]);

  async function runConnectionTest() {
    setConnectionBusy(true);
    setConnectionError("");
    try {
      const result = await testConnection({ data: { passkey } });
      setConnection({ ...result, host: result.host ?? null });
      await refreshAccounts();
    } catch (testError) {
      setConnection((current) => ({ ...current, connected: false }));
      setConnectionError(
        testError instanceof Error ? testError.message : "Postiz connection test failed.",
      );
    } finally {
      setConnectionBusy(false);
    }
  }

  const publishedCount = useMemo(
    () => posts.filter((post) => Boolean(post.releaseURL)).length,
    [posts],
  );
  const scheduledCount = useMemo(
    () =>
      posts.filter((post) => post.publishDate && new Date(post.publishDate).getTime() > Date.now())
        .length,
    [posts],
  );

  const nav = (
    <nav aria-label="Social Media Operator navigation" className="space-y-5">
      {(["main", "accounts", "settings"] as const).map((group) => (
        <div key={group}>
          <p className="mb-2 px-3 font-mono text-[9px] uppercase tracking-[0.18em] text-faint">
            {group}
          </p>
          <div className="space-y-1">
            {NAV.filter((item) => item.group === group).map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setView(item.id)}
                  className={`focus-ring flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                    view === item.id
                      ? "bg-gold/10 text-gold"
                      : "text-muted hover:bg-surface-2/60 hover:text-ink"
                  }`}
                >
                  <Icon size={15} /> {item.label}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-bg">
      <div className="shell py-5 lg:py-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="eyebrow">Social Media Operator</p>
            <h1 className="font-display text-3xl font-medium sm:text-4xl">
              {NAV.find((item) => item.id === view)?.label}
            </h1>
            <p className="mt-1 text-sm text-muted">
              Create, approve, schedule, and monitor content through Postiz.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`rounded-full border px-3 py-1 text-[11px] ${connection.connected ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600" : "border-gold/25 text-muted"}`}
            >
              {connection.connected ? "Postiz active" : "Postiz not tested"}
            </span>
            <button
              type="button"
              onClick={lock}
              className="focus-ring rounded-md border border-line/30 px-3 py-2 text-xs"
            >
              Lock
            </button>
          </div>
        </div>

        <details className="card mb-4 p-3 lg:hidden">
          <summary className="flex cursor-pointer list-none items-center justify-between text-sm text-ink">
            <span className="flex items-center gap-2">
              <Menu size={16} /> Workspace navigation
            </span>
            <ChevronDown size={15} />
          </summary>
          <div className="mt-4 border-t border-line/15 pt-4">{nav}</div>
        </details>

        <div className="grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)]">
          <aside className="card hidden self-start p-3 lg:sticky lg:top-20 lg:block">
            <Link
              to="/admin/operators"
              className="focus-ring mb-5 block rounded-lg border border-gold/20 p-3"
            >
              <span className="font-display text-xl">
                <span className="text-ink">mer</span>
                <span className="text-gold">Q</span>
                <span className="text-ink">ato</span>
              </span>
              <span className="mt-1 block font-mono text-[8px] uppercase tracking-[0.2em] text-faint">
                Social Media Operator
              </span>
            </Link>
            {nav}
          </aside>

          <main className="min-w-0">
            {error ? (
              <p className="mb-4 rounded-md border border-crimson/30 bg-crimson/5 px-3 py-2 text-sm text-crimson">
                {error}
              </p>
            ) : null}
            {view === "create" ? (
              <PostComposer
                passkey={passkey}
                integrations={integrations}
                onPostCreated={refreshPosts}
              />
            ) : null}
            {view === "calendar" ? <PostCalendar posts={posts} /> : null}
            {view === "posts" ? <PostQueue posts={posts} loading={loading} /> : null}
            {view === "accounts" ? (
              <SocialConnections
                integrations={integrations}
                busy={refreshing}
                lastSync={lastSync}
                onRefresh={refreshAccounts}
              />
            ) : null}
            {view === "connection" ? (
              <PostizConnection
                state={connection}
                busy={connectionBusy}
                error={connectionError}
                onTest={runConnectionTest}
              />
            ) : null}
            {view === "dashboard" ? (
              <div className="space-y-5">
                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    { label: "Connected accounts", value: integrations.length },
                    { label: "Scheduled", value: scheduledCount },
                    { label: "Published in range", value: publishedCount },
                  ].map((item) => (
                    <article key={item.label} className="card p-5">
                      <p className="text-xs text-muted">{item.label}</p>
                      <p className="mt-2 font-display text-4xl text-gold">{item.value}</p>
                    </article>
                  ))}
                </div>
                <PostQueue posts={posts.slice(0, 6)} loading={loading} />
              </div>
            ) : null}
            {view === "media" ? (
              <section className="card p-6">
                <p className="eyebrow">Media library</p>
                <h2 className="font-display text-2xl">Upload through the composer</h2>
                <p className="mt-2 max-w-2xl text-sm text-muted">
                  Media is uploaded directly to Postiz and attached by its returned media ID and
                  URL. Open Create Post to upload and preview images or MP4 video.
                </p>
                <button
                  type="button"
                  onClick={() => setView("create")}
                  className="mt-5 rounded-md bg-gold px-4 py-2 text-sm font-medium text-[#0b0b0b]"
                >
                  Open composer
                </button>
              </section>
            ) : null}
            {view === "analytics" ? (
              <section className="card p-6">
                <p className="eyebrow">Analytics</p>
                <h2 className="font-display text-2xl">Publishing overview</h2>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-line/20 p-4">
                    <p className="text-xs text-muted">Published posts in loaded range</p>
                    <p className="mt-2 font-display text-4xl text-gold">{publishedCount}</p>
                  </div>
                  <div className="rounded-xl border border-line/20 p-4">
                    <p className="text-xs text-muted">Upcoming scheduled posts</p>
                    <p className="mt-2 font-display text-4xl text-gold">{scheduledCount}</p>
                  </div>
                </div>
              </section>
            ) : null}
            {view === "brain" ? (
              <section className="card p-6">
                <p className="eyebrow">AI Brain</p>
                <h2 className="font-display text-2xl">Shared model configuration</h2>
                <p className="mt-2 max-w-2xl text-sm text-muted">
                  The Social Media Operator uses the existing OpenRouter or Ollama selection. Model
                  credentials and selection remain managed in Operator Admin.
                </p>
                <Link
                  to="/admin/operators"
                  className="focus-ring mt-5 inline-flex rounded-md bg-gold px-4 py-2 text-sm font-medium text-[#0b0b0b]"
                >
                  Open Agent Brain settings
                </Link>
              </section>
            ) : null}
            {view === "preferences" ? (
              <section className="card p-6">
                <p className="eyebrow">Preferences</p>
                <h2 className="font-display text-2xl">Publishing defaults</h2>
                <div className="mt-5 rounded-xl border border-line/20 p-4">
                  <p className="text-sm font-medium">Timezone</p>
                  <p className="mt-1 text-sm text-muted">
                    Asia/Manila (GMT+8). Schedule inputs are converted to UTC ISO timestamps before
                    being sent to Postiz.
                  </p>
                </div>
              </section>
            ) : null}
          </main>
        </div>
      </div>
    </div>
  );
}

export function SocialMediaAdminPage() {
  return (
    <AdminGate>
      <SocialMediaManager />
    </AdminGate>
  );
}
