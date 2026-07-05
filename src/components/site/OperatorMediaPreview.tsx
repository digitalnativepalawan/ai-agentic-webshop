import { ImageIcon, Play } from "lucide-react";
import type { OperatorMedia } from "@/lib/operator-media";

export function OperatorMediaPreview({ media, compact = false }: { media: OperatorMedia[]; compact?: boolean }) {
  const primary = media[0];
  if (!primary) {
    return (
      <div className={`mb-5 flex items-center justify-center rounded-lg border border-line/20 bg-surface-2/40 text-faint ${compact ? "h-28" : "h-40"}`}>
        <ImageIcon size={24} strokeWidth={1.4} />
      </div>
    );
  }

  return (
    <div className={`relative mb-5 overflow-hidden rounded-lg border border-line/20 bg-black ${compact ? "h-28" : "h-40"}`}>
      {primary.type === "video" ? (
        <video src={primary.url} className="h-full w-full object-cover" muted playsInline loop autoPlay preload="metadata" />
      ) : (
        <img src={primary.url} alt={primary.alt} className="h-full w-full object-cover" loading="lazy" />
      )}
      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/80 to-transparent px-3 pb-2 pt-8 text-[11px] text-white">
        <span>{primary.type === "video" ? <span className="inline-flex items-center gap-1"><Play size={11} /> Interface video</span> : "Interface preview"}</span>
        {media.length > 1 && <span>{media.length} media</span>}
      </div>
    </div>
  );
}
