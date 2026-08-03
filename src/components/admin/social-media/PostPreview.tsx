import { useMemo, useState } from "react";
import { Heart, MessageCircle, Send } from "lucide-react";

import type { PostizIntegration, PostizMedia } from "@/lib/postiz.schemas";

type PreviewPlatform = "facebook" | "instagram";

export function PostPreview({
  content,
  media,
  integrations,
}: {
  content: string;
  media: PostizMedia[];
  integrations: PostizIntegration[];
}) {
  const available = useMemo<PreviewPlatform[]>(() => {
    const values = new Set<PreviewPlatform>();
    for (const integration of integrations) {
      if (integration.identifier === "facebook") values.add("facebook");
      if (integration.identifier.startsWith("instagram")) values.add("instagram");
    }
    return values.size ? [...values] : ["facebook", "instagram"];
  }, [integrations]);
  const [requestedPlatform, setRequestedPlatform] = useState<PreviewPlatform>(available[0]);
  const platform = available.includes(requestedPlatform) ? requestedPlatform : available[0];
  const account = integrations.find((item) =>
    platform === "facebook"
      ? item.identifier === "facebook"
      : item.identifier.startsWith("instagram"),
  );

  return (
    <section className="card p-4 sm:p-5">
      <p className="eyebrow">Preview</p>
      <div className="mt-3 flex gap-2" role="tablist" aria-label="Post preview platform">
        {available.map((item) => (
          <button
            key={item}
            type="button"
            role="tab"
            aria-selected={platform === item}
            onClick={() => setRequestedPlatform(item)}
            className={`focus-ring rounded-md border px-3 py-1.5 text-xs capitalize ${
              platform === item ? "border-gold bg-gold/10 text-gold" : "border-line/20 text-muted"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-line/20 bg-surface">
        <div className="flex items-center gap-3 p-4">
          {account?.picture ? (
            <img src={account.picture} alt="" className="h-10 w-10 rounded-full object-cover" />
          ) : (
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/10 font-display text-gold">
              mQ
            </span>
          )}
          <div>
            <p className="text-sm font-medium text-ink">{account?.name ?? "MerQato Social"}</p>
            <p className="text-[10px] text-faint">Just now · Public</p>
          </div>
        </div>
        <p className="whitespace-pre-wrap px-4 pb-4 text-sm leading-relaxed text-ink">
          {content || "Your post preview will appear here."}
        </p>
        {media[0] ? (
          <img
            src={media[0].path}
            alt="Post media preview"
            className="aspect-[4/3] w-full object-cover"
          />
        ) : (
          <div className="flex aspect-[4/3] items-center justify-center border-y border-line/15 bg-surface-2/30 text-xs text-faint">
            Add media to preview it here
          </div>
        )}
        <div className="grid grid-cols-3 border-t border-line/15 px-2 py-2 text-xs text-muted">
          <span className="flex items-center justify-center gap-1">
            <Heart size={13} /> Like
          </span>
          <span className="flex items-center justify-center gap-1">
            <MessageCircle size={13} /> Comment
          </span>
          <span className="flex items-center justify-center gap-1">
            <Send size={13} /> Share
          </span>
        </div>
      </div>
    </section>
  );
}
