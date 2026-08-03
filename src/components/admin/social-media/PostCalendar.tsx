import type { PostizPost } from "@/lib/postiz.schemas";

export function PostCalendar({ posts }: { posts: PostizPost[] }) {
  const days = Array.from({ length: 14 }, (_, offset) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + offset);
    const key = date.toLocaleDateString("en-CA", { timeZone: "Asia/Manila" });
    return {
      date,
      key,
      posts: posts.filter((post) =>
        post.publishDate
          ? new Date(post.publishDate).toLocaleDateString("en-CA", { timeZone: "Asia/Manila" }) ===
            key
          : false,
      ),
    };
  });

  return (
    <section className="card p-5 sm:p-6">
      <p className="eyebrow">Content calendar</p>
      <h2 className="font-display text-2xl font-medium">Next 14 days</h2>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-7">
        {days.map((day) => (
          <article
            key={day.key}
            className="min-h-32 rounded-xl border border-line/20 bg-surface-2/30 p-3"
          >
            <p className="font-mono text-[10px] uppercase tracking-wider text-faint">
              {day.date.toLocaleDateString("en-PH", { weekday: "short", timeZone: "Asia/Manila" })}
            </p>
            <p className="mt-1 font-display text-2xl text-ink">{day.date.getDate()}</p>
            <div className="mt-3 space-y-2">
              {day.posts.map((post) => (
                <div key={post.id} className="rounded-md border border-gold/20 bg-gold/5 p-2">
                  <p className="line-clamp-2 text-[10px] leading-relaxed text-ink">
                    {post.content || "Media post"}
                  </p>
                  <p className="mt-1 text-[9px] text-gold">{post.integration.name}</p>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
