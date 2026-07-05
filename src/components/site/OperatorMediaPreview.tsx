import { useState } from "react";
import { ChevronLeft, ChevronRight, ImageIcon, Play } from "lucide-react";
import type { OperatorMedia } from "@/lib/operator-media";

export function OperatorMediaPreview({ media, compact = false }: { media: OperatorMedia[]; compact?: boolean }) {
  const [index, setIndex] = useState(0);
  if (!media.length) {
    return (
      <div className={`mb-5 flex items-center justify-center rounded-lg border border-line/20 bg-surface-2/40 text-faint ${compact ? "h-28" : "h-40"}`}>
        <ImageIcon size={24} strokeWidth={1.4} />
      </div>
    );
  }

  const activeIndex = Math.min(index, media.length - 1);
  const active = media[activeIndex];
  const move = (direction: number) => setIndex((current) => (current + direction + media.length) % media.length);

  return (
    <div className={`relative mb-5 overflow-hidden rounded-lg border border-line/20 bg-black ${compact ? "h-28" : "h-40"}`}>
      {active.type === "video" ? (
        <video src={active.url} className="h-full w-full object-cover" muted playsInline loop autoPlay preload="metadata" />
      ) : (
        <img src={active.url} alt={active.alt} className="h-full w-full object-cover" loading="lazy" />
      )}

      {media.length > 1 && (
        <>
          <button type="button" aria-label="Previous interface media" onClick={(event) => { event.preventDefault(); move(-1); }} className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/65 p-1.5 text-white"><ChevronLeft size={15} /></button>
          <button type="button" aria-label="Next interface media" onClick={(event) => { event.preventDefault(); move(1); }} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/65 p-1.5 text-white"><ChevronRight size={15} /></button>
        </>
      )}

      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/80 to-transparent px-3 pb-2 pt-8 text-[11px] text-white">
        <span>{active.type === "video" ? <span className="inline-flex items-center gap-1"><Play size={11} /> Interface video</span> : "Interface preview"}</span>
        <span>{activeIndex + 1} / {media.length}</span>
      </div>
    </div>
  );
}
