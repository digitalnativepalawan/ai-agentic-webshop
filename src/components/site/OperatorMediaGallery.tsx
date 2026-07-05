import { useState } from "react";
import type { OperatorMedia } from "@/lib/operator-media";

export function OperatorMediaGallery({ media }: { media: OperatorMedia[] }) {
  const [activeId, setActiveId] = useState(media[0]?.id);
  if (!media.length) return null;
  const active = media.find((item) => item.id === activeId) ?? media[0];

  return (
    <div className="card mb-6 overflow-hidden p-4">
      <div className="overflow-hidden rounded-lg border border-line/20 bg-black">
        {active.type === "video" ? (
          <video src={active.url} controls playsInline className="aspect-video w-full object-contain" />
        ) : (
          <img src={active.url} alt={active.alt} className="aspect-video w-full object-contain" />
        )}
      </div>
      {media.length > 1 && (
        <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
          {media.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveId(item.id)}
              className={`h-20 w-28 shrink-0 overflow-hidden rounded-md border ${active.id === item.id ? "border-gold" : "border-line/30"}`}
            >
              {item.type === "video" ? (
                <video src={item.url} muted playsInline className="h-full w-full object-cover" />
              ) : (
                <img src={item.url} alt={item.alt} className="h-full w-full object-cover" loading="lazy" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
