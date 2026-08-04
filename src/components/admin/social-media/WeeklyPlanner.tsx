import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  ImagePlus,
  Loader2,
  Send,
  Sparkles,
} from "lucide-react";

import { generateWeeklySocialPlan } from "@/lib/agent.functions";
import { getAgentConfig, toAgentRuntimeConfig } from "@/lib/agentConfig";
import { createSocialPost, uploadSocialMedia } from "@/lib/postiz.functions";
import type { PostizIntegration, PostizMedia } from "@/lib/postiz.schemas";

type Channel = "facebook" | "instagram";
type WeeklyDraft = {
  id: string;
  date: string;
  time: string;
  theme: string;
  content: string;
  imageBrief: string;
  media: PostizMedia[];
  state: "review" | "scheduled";
};

const TIMES = ["09:00", "17:00", "20:00"];
const ACCEPTED_MEDIA = "image/jpeg,image/png,image/gif,image/webp,image/avif,video/mp4";

function dateKey(offset = 1) {
  const value = new Date();
  value.setDate(value.getDate() + offset);
  return value.toLocaleDateString("en-CA", { timeZone: "Asia/Manila" });
}

function labelDate(value: string) {
  return new Date(`${value}T12:00:00+08:00`).toLocaleDateString("en-PH", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "Asia/Manila",
  });
}

function toBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
    reader.onerror = () => reject(new Error(`Could not read ${file.name}.`));
    reader.readAsDataURL(file);
  });
}

export function WeeklyPlanner({
  passkey,
  integrations,
  onScheduled,
}: {
  passkey: string;
  integrations: PostizIntegration[];
  onScheduled: () => Promise<void> | void;
}) {
  const generate = useServerFn(generateWeeklySocialPlan);
  const upload = useServerFn(uploadSocialMedia);
  const createPost = useServerFn(createSocialPost);
  const [brand, setBrand] = useState("Marina Terrace");
  const [brief, setBrief] = useState(
    "Show remote workers why Marina Terrace is a practical home base for focused work and island life.",
  );
  const [audience, setAudience] = useState("Remote workers and digital nomads considering Palawan");
  const [callToAction, setCallToAction] = useState("Invite people to message Marina Terrace");
  const [tone, setTone] = useState("Warm and practical");
  const [startDate, setStartDate] = useState(dateKey());
  const [postsPerDay, setPostsPerDay] = useState(2);
  const [channels, setChannels] = useState<Channel[]>(["facebook", "instagram"]);
  const [drafts, setDrafts] = useState<WeeklyDraft[]>([]);
  const [selected, setSelected] = useState(0);
  const [busy, setBusy] = useState<"generate" | "upload" | "approve" | "">("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const current = drafts[selected];
  const scheduled = drafts.filter((draft) => draft.state === "scheduled").length;
  const needsMedia = channels.includes("instagram");
  const missingMedia = drafts.filter((draft) => !draft.media.length).length;
  const selectedIntegrationIds = useMemo(
    () =>
      integrations
        .filter(
          (integration) =>
            !integration.disabled &&
            channels.some((channel) =>
              channel === "facebook"
                ? integration.identifier === "facebook"
                : integration.identifier.startsWith("instagram"),
            ),
        )
        .map((integration) => integration.id),
    [channels, integrations],
  );

  function patchCurrent(patch: Partial<WeeklyDraft>) {
    setDrafts((value) =>
      value.map((draft, index) => (index === selected ? { ...draft, ...patch } : draft)),
    );
  }

  function toggleChannel(channel: Channel) {
    setChannels((value) =>
      value.includes(channel) ? value.filter((item) => item !== channel) : [...value, channel],
    );
    setError("");
  }

  async function createWeek() {
    const config = toAgentRuntimeConfig(getAgentConfig());
    if (!config) return setError("Configure the Agent Brain before creating a week.");
    if (!channels.length) return setError("Select Facebook, Instagram, or both.");
    if (!selectedIntegrationIds.length)
      return setError("No connected Postiz account matches the selected channels.");
    setBusy("generate");
    setError("");
    setMessage("");
    try {
      const result = await generate({
        data: {
          passkey,
          config,
          brand,
          brief,
          audience,
          callToAction,
          tone,
          startDate,
          postsPerDay,
          channels,
          times: TIMES.slice(0, postsPerDay),
        },
      });
      setDrafts(
        result.drafts.map((draft) => ({
          id: crypto.randomUUID(),
          date: draft.date,
          time: draft.time,
          theme: draft.theme,
          content: draft.content,
          imageBrief: draft.image_brief,
          media: [],
          state: "review",
        })),
      );
      setSelected(0);
      setMessage(`${result.drafts.length} posts created. Review, add media, then approve once.`);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The agent could not create the week.");
    } finally {
      setBusy("");
    }
  }

  async function addMedia(file?: File) {
    if (!file || !current) return;
    if (file.size > 10 * 1024 * 1024) return setError("Media must be 10 MB or smaller.");
    if (!ACCEPTED_MEDIA.split(",").includes(file.type)) return setError("Unsupported media type.");
    setBusy("upload");
    setError("");
    try {
      const media = await upload({
        data: {
          passkey,
          filename: file.name,
          contentType: file.type as "image/jpeg",
          base64: await toBase64(file),
        },
      });
      patchCurrent({ media: [media] });
      setMessage(`${file.name} uploaded to Postiz for post ${selected + 1}.`);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Media upload failed.");
    } finally {
      setBusy("");
    }
  }

  async function approveWeek() {
    if (!drafts.length || !selectedIntegrationIds.length) return;
    if (needsMedia && missingMedia)
      return setError(`Add media to the ${missingMedia} remaining Instagram posts first.`);
    setBusy("approve");
    setError("");
    setMessage("");
    let completed = 0;
    try {
      for (const draft of drafts) {
        if (draft.state === "scheduled") {
          completed += 1;
          continue;
        }
        const iso = new Date(`${draft.date}T${draft.time}:00+08:00`).toISOString();
        await createPost({
          data: {
            passkey,
            type: "schedule",
            date: iso,
            content: draft.content,
            platformContent: { facebook: draft.content, instagram: draft.content },
            integrationIds: selectedIntegrationIds,
            media: draft.media,
          },
        });
        completed += 1;
        setDrafts((value) =>
          value.map((item) => (item.id === draft.id ? { ...item, state: "scheduled" } : item)),
        );
      }
      setMessage(`${completed} posts approved and scheduled in Postiz.`);
      await onScheduled();
    } catch (reason) {
      setError(
        `${completed} of ${drafts.length} posts were scheduled. ${reason instanceof Error ? reason.message : "Postiz stopped the weekly approval."}`,
      );
      await onScheduled();
    } finally {
      setBusy("");
    }
  }

  return (
    <div className="space-y-5">
      {(message || error) && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm ${error ? "border-crimson/30 bg-crimson/5 text-crimson" : "border-emerald-500/25 bg-emerald-500/5 text-emerald-700"}`}
        >
          {error || message}
        </div>
      )}
      <section className="card p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="eyebrow">Weekly agent</p>
            <h2 className="font-display text-3xl">Create 7 days of content</h2>
            <p className="mt-1 max-w-xl text-sm text-muted">
              Give the agent one goal. Review the complete calendar, add media, and approve the week
              once.
            </p>
          </div>
          <div className="rounded-xl bg-surface-2 px-4 py-2 text-right">
            <p className="text-[10px] text-muted">This creates</p>
            <p className="font-display text-2xl text-gold">{postsPerDay * 7} posts</p>
          </div>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <label className="text-xs text-muted">
            Brand
            <select
              value={brand}
              onChange={(event) => setBrand(event.target.value)}
              className="mt-1.5 w-full rounded-md border border-line/25 bg-bg px-3 py-2.5 text-sm text-ink"
            >
              <option>Marina Terrace</option>
              <option>BAIA Palawan</option>
              <option>merQato Digital</option>
            </select>
          </label>
          <label className="text-xs text-muted">
            Week starts
            <input
              type="date"
              min={dateKey(0)}
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              className="mt-1.5 w-full rounded-md border border-line/25 bg-bg px-3 py-2.5 text-sm text-ink"
            />
          </label>
          <label className="text-xs text-muted">
            Posts each day
            <select
              value={postsPerDay}
              onChange={(event) => setPostsPerDay(Number(event.target.value))}
              className="mt-1.5 w-full rounded-md border border-line/25 bg-bg px-3 py-2.5 text-sm text-ink"
            >
              <option value={1}>1 post</option>
              <option value={2}>2 posts</option>
              <option value={3}>3 posts</option>
            </select>
          </label>
          <label className="text-xs text-muted">
            Tone
            <input
              value={tone}
              onChange={(event) => setTone(event.target.value)}
              className="mt-1.5 w-full rounded-md border border-line/25 bg-bg px-3 py-2.5 text-sm text-ink"
            />
          </label>
          <label className="md:col-span-2 text-xs text-muted">
            Weekly goal
            <textarea
              rows={3}
              value={brief}
              onChange={(event) => setBrief(event.target.value)}
              className="mt-1.5 w-full rounded-md border border-line/25 bg-bg px-3 py-2.5 text-sm text-ink"
            />
          </label>
          <label className="text-xs text-muted">
            Audience
            <textarea
              rows={3}
              value={audience}
              onChange={(event) => setAudience(event.target.value)}
              className="mt-1.5 w-full rounded-md border border-line/25 bg-bg px-3 py-2.5 text-sm text-ink"
            />
          </label>
          <label className="text-xs text-muted">
            Call to action
            <textarea
              rows={3}
              value={callToAction}
              onChange={(event) => setCallToAction(event.target.value)}
              className="mt-1.5 w-full rounded-md border border-line/25 bg-bg px-3 py-2.5 text-sm text-ink"
            />
          </label>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line/15 pt-4">
          <div className="flex gap-2">
            {(["facebook", "instagram"] as Channel[]).map((channel) => {
              const active = channels.includes(channel);
              return (
                <button
                  key={channel}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggleChannel(channel)}
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs capitalize ${active ? "border-gold bg-gold/10 text-gold" : "border-line/25 text-muted"}`}
                >
                  <span
                    className={`flex h-4 w-4 items-center justify-center rounded-full ${active ? "bg-gold text-[#0b0b0b]" : "border border-line/30"}`}
                  >
                    {active ? <Check size={11} /> : null}
                  </span>
                  {channel}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={createWeek}
            disabled={Boolean(busy)}
            className="inline-flex items-center gap-2 rounded-md bg-ink px-5 py-2.5 text-sm font-medium text-bg disabled:opacity-50"
          >
            {busy === "generate" ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Sparkles size={15} />
            )}{" "}
            {busy === "generate" ? "Agent is planning…" : `Create ${postsPerDay * 7} posts`}
          </button>
        </div>
      </section>

      {drafts.length && current ? (
        <div className="grid gap-5 xl:grid-cols-[340px_minmax(0,1fr)]">
          <section className="card p-4">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="eyebrow">Review queue</p>
                <h2 className="font-display text-2xl">The week</h2>
              </div>
              <span className="text-xs text-muted">
                {scheduled}/{drafts.length} scheduled
              </span>
            </div>
            <div className="max-h-[650px] space-y-2 overflow-y-auto">
              {drafts.map((draft, index) => (
                <button
                  key={draft.id}
                  type="button"
                  onClick={() => setSelected(index)}
                  className={`w-full rounded-lg border p-3 text-left ${selected === index ? "border-gold bg-gold/8" : "border-line/20"}`}
                >
                  <div className="flex justify-between gap-2">
                    <span className="font-mono text-[10px] text-gold">
                      {labelDate(draft.date)} · {draft.time}
                    </span>
                    {draft.state === "scheduled" ? (
                      <Check size={13} className="text-emerald-600" />
                    ) : needsMedia && !draft.media.length ? (
                      <span className="text-[9px] text-crimson">Needs media</span>
                    ) : null}
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs text-muted">{draft.content}</p>
                </button>
              ))}
            </div>
          </section>
          <section className="card p-5 sm:p-6">
            <div className="flex items-center justify-between border-b border-line/15 pb-4">
              <div>
                <p className="eyebrow">
                  Post {selected + 1} of {drafts.length}
                </p>
                <h2 className="font-display text-2xl">
                  {labelDate(current.date)} at {current.time}
                </h2>
              </div>
              <div className="flex gap-2">
                <button
                  aria-label="Previous post"
                  disabled={!selected}
                  onClick={() => setSelected((value) => value - 1)}
                  className="rounded-md border border-line/25 p-2 disabled:opacity-30"
                >
                  <ChevronLeft size={15} />
                </button>
                <button
                  aria-label="Next post"
                  disabled={selected === drafts.length - 1}
                  onClick={() => setSelected((value) => value + 1)}
                  className="rounded-md border border-line/25 p-2 disabled:opacity-30"
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
            <label className="mt-4 block text-xs text-muted">
              Theme
              <input
                value={current.theme}
                onChange={(event) => patchCurrent({ theme: event.target.value })}
                className="mt-1.5 w-full rounded-md border border-line/25 bg-bg px-3 py-2.5 text-sm"
              />
            </label>
            <label className="mt-4 block text-xs text-muted">
              Agent-written post
              <textarea
                rows={9}
                value={current.content}
                onChange={(event) => patchCurrent({ content: event.target.value })}
                className="mt-1.5 w-full rounded-md border border-line/25 bg-bg px-3 py-2.5 text-sm leading-relaxed"
              />
            </label>
            <div className="mt-4 rounded-xl border border-dashed border-line/25 bg-surface-2/30 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">
                    {current.media[0]?.name || "Add image or video"}
                  </p>
                  <p className="mt-1 text-xs text-muted">Agent brief: {current.imageBrief}</p>
                </div>
                <label className="cursor-pointer rounded-md border border-line/25 bg-bg px-3 py-2 text-xs">
                  <input
                    type="file"
                    accept={ACCEPTED_MEDIA}
                    className="sr-only"
                    onChange={(event) => void addMedia(event.target.files?.[0])}
                  />
                  <span className="inline-flex items-center gap-2">
                    {busy === "upload" ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <ImagePlus size={14} />
                    )}{" "}
                    Choose media
                  </span>
                </label>
              </div>
            </div>
            <div className="mt-5 flex justify-end border-t border-line/15 pt-5">
              <button
                type="button"
                onClick={approveWeek}
                disabled={Boolean(busy) || scheduled === drafts.length}
                className="inline-flex items-center gap-2 rounded-md bg-gold px-5 py-2.5 text-sm font-medium text-[#0b0b0b] disabled:opacity-50"
              >
                {busy === "approve" ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Send size={15} />
                )}{" "}
                {busy === "approve"
                  ? `Scheduling ${scheduled + 1} of ${drafts.length}…`
                  : "Approve the full week"}
              </button>
            </div>
          </section>
        </div>
      ) : (
        <section className="card border-dashed py-16 text-center">
          <CalendarDays className="mx-auto text-gold" />
          <h2 className="mt-3 font-display text-2xl">Your weekly calendar will appear here</h2>
          <p className="mt-1 text-sm text-muted">
            Nothing publishes until you review and approve the full week.
          </p>
        </section>
      )}
    </div>
  );
}
