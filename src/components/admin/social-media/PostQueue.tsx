import { AlertCircle, CalendarClock, ExternalLink } from "lucide-react";

import { postizContentToText, type PostizPost } from "@/lib/postiz.schemas";

function statusFor(post: PostizPost) {
  if (post.state === "PUBLISHED")
    return { label: "Published", className: "text-emerald-600 bg-emerald-500/10" };
  if (post.state === "QUEUE") {
    return { label: "Scheduled", className: "text-gold bg-gold/10" };
  }
  if (post.state === "ERROR") {
    return { label: "Failed", className: "text-crimson bg-crimson/10" };
  }
  return { label: "Draft", className: "text-muted bg-surface-2" };
}

export function PostQueue({ posts, loading }: { posts: PostizPost[]; loading: boolean }) {
  return (
    <section className="card p-5 sm:p-6">
      <div>
        <p className="eyebrow">Posts</p>
        <h2 className="font-display text-2xl font-medium">Scheduled and recent</h2>
      </div>
      <div className="mt-5 space-y-3">
        {posts.map((post) => {
          const status = statusFor(post);
          return (
            <article key={post.id} className="rounded-xl border border-line/20 bg-surface-2/30 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${status.className}`}
                    >
                      {status.label}
                    </span>
                    <span className="text-xs text-muted">
                      {post.integration.name ?? post.integration.providerIdentifier}
                    </span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink">
                    {postizContentToText(post.content) || "Media post"}
                  </p>
                  {post.state === "ERROR" ? (
                    <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-crimson">
                      <AlertCircle size={12} /> Publishing failed in Postiz. Open Postiz for the
                      platform response and retry controls.
                    </p>
                  ) : null}
                  {post.publishDate ? (
                    <p className="mt-2 inline-flex items-center gap-1.5 font-mono text-[10px] text-faint">
                      <CalendarClock size={11} />
                      {new Date(post.publishDate).toLocaleString("en-PH", {
                        timeZone: "Asia/Manila",
                      })}{" "}
                      PHT
                    </p>
                  ) : null}
                </div>
                {post.releaseURL ? (
                  <a
                    href={post.releaseURL}
                    target="_blank"
                    rel="noreferrer"
                    className="focus-ring inline-flex items-center gap-1 text-xs text-gold"
                  >
                    View <ExternalLink size={12} />
                  </a>
                ) : null}
              </div>
            </article>
          );
        })}
        {loading ? (
          <p className="py-6 text-center text-sm text-muted">Loading posts from Postiz…</p>
        ) : null}
        {!loading && posts.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted">
            No posts were returned for this date range.
          </p>
        ) : null}
      </div>
    </section>
  );
}
