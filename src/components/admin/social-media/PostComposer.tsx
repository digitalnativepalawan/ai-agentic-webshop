import { useEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  CalendarClock,
  CheckCircle2,
  History,
  ImagePlus,
  Loader2,
  RotateCcw,
  Send,
  Sparkles,
  Trash2,
  WandSparkles,
  X,
} from "lucide-react";

import { generateSocialMediaContent } from "@/lib/agent.functions";
import { getAgentConfig, toAgentRuntimeConfig } from "@/lib/agentConfig";
import type { SocialContentResult } from "@/lib/agent.schemas";
import { createSocialPost, uploadSocialMedia } from "@/lib/postiz.functions";
import type { PostizIntegration, PostizMedia } from "@/lib/postiz.schemas";
import { PostPreview } from "./PostPreview";

const TIME_ZONE = "Asia/Manila";
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_FILES = 10;
const ACCEPTED_MEDIA =
  "image/jpeg,image/png,image/gif,image/webp,image/avif,image/bmp,image/tiff,video/mp4";

type AiAction = "generate" | "improve" | "shorten" | "hashtags" | "facebook" | "instagram" | "tone";
type CopyTab = "base" | "facebook" | "instagram";
type Copies = Record<CopyTab, string>;
type Version = { id: number; label: string; at: string; copies: Copies };

const EMPTY_COPIES: Copies = { base: "", facebook: "", instagram: "" };

function defaultSchedule() {
  const date = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";
  return {
    date: `${get("year")}-${get("month")}-${get("day")}`,
    time: `${get("hour")}:${get("minute")}`,
  };
}

function manilaDateToIso(date: string, time: string) {
  if (!date || !time) return "";
  const parsed = new Date(`${date}T${time}:00+08:00`);
  return Number.isNaN(parsed.getTime()) ? "" : parsed.toISOString();
}

function resolvedSchedule(date: string, time: string) {
  const iso = manilaDateToIso(date, time);
  if (!iso) return { iso: "", label: "Invalid date or time" };
  const label = new Intl.DateTimeFormat("en-PH", {
    timeZone: TIME_ZONE,
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(iso));
  return { iso, label: `${label} Asia/Manila` };
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error(`Could not read ${file.name}.`));
    reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
    reader.readAsDataURL(file);
  });
}

const labelClass = "flex flex-col gap-1.5 text-[11px] font-medium text-muted";
const fieldClass =
  "focus-ring w-full rounded-md border border-line/25 bg-bg/60 px-3 py-2.5 text-sm text-ink placeholder:text-faint";

export function PostComposer({
  passkey,
  integrations,
  onPostCreated,
}: {
  passkey: string;
  integrations: PostizIntegration[];
  onPostCreated: () => Promise<void> | void;
}) {
  const generateContent = useServerFn(generateSocialMediaContent);
  const upload = useServerFn(uploadSocialMedia);
  const createPost = useServerFn(createSocialPost);
  const initialSchedule = useMemo(defaultSchedule, []);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [copies, setCopies] = useState<Copies>(EMPTY_COPIES);
  const [activeTab, setActiveTab] = useState<CopyTab>("base");
  const [generated, setGenerated] = useState<SocialContentResult | null>(null);
  const [versions, setVersions] = useState<Version[]>([]);
  const [editedSinceGeneration, setEditedSinceGeneration] = useState(false);
  const [replacePrompt, setReplacePrompt] = useState(false);
  const [media, setMedia] = useState<PostizMedia[]>([]);
  const [failedFiles, setFailedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [publishMode, setPublishMode] = useState<"now" | "schedule">("schedule");
  const [date, setDate] = useState(initialSchedule.date);
  const [time, setTime] = useState(initialSchedule.time);
  const [approved, setApproved] = useState(false);
  const [submitting, setSubmitting] = useState<"" | "now" | "schedule" | "draft">("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [aiBusy, setAiBusy] = useState<AiAction | "">("");
  const [lastAiAction, setLastAiAction] = useState<AiAction>("generate");
  const [brand, setBrand] = useState("merQato Digital");
  const [customBrand, setCustomBrand] = useState("");
  const [objective, setObjective] = useState("Awareness");
  const [audience, setAudience] = useState("");
  const [topic, setTopic] = useState("");
  const [callToAction, setCallToAction] = useState("");
  const [tone, setTone] = useState("Warm");
  const [format, setFormat] = useState("Single post");
  const [backgroundContext, setBackgroundContext] = useState("");
  const selectedDefaults = useRef(false);
  const requestSequence = useRef(0);

  useEffect(() => {
    if (!selectedDefaults.current && integrations.length > 0) {
      selectedDefaults.current = true;
      setSelectedIds(integrations.filter((item) => !item.disabled).map((item) => item.id));
    }
  }, [integrations]);

  useEffect(() => setApproved(false), [copies, selectedIds, media, publishMode, date, time]);

  const selectedIntegrations = integrations.filter((integration) =>
    selectedIds.includes(integration.id),
  );
  const selectedChannels = Array.from(
    new Set(
      selectedIntegrations.flatMap((integration) =>
        integration.identifier === "facebook"
          ? (["facebook"] as const)
          : integration.identifier.startsWith("instagram")
            ? (["instagram"] as const)
            : [],
      ),
    ),
  );
  const schedule = useMemo(() => resolvedSchedule(date, time), [date, time]);
  const scheduleValid = new Date(schedule.iso).getTime() > Date.now();
  const instagramSelected = selectedChannels.includes("instagram");
  const finalReady =
    approved &&
    selectedIds.length > 0 &&
    copies.base.trim().length > 0 &&
    (!instagramSelected || media.length > 0) &&
    (publishMode === "now" || scheduleValid);

  function snapshot(label: string) {
    setVersions((current) => [
      ...current.slice(-10),
      { id: Date.now(), label, at: new Date().toISOString(), copies: { ...copies } },
    ]);
  }

  function updateCopy(tab: CopyTab, value: string, manual = true) {
    setCopies((current) => ({ ...current, [tab]: value.slice(0, 10_000) }));
    if (manual) setEditedSinceGeneration(true);
  }

  function toggleIntegration(id: string) {
    const integration = integrations.find((item) => item.id === id);
    const selected = selectedIds.includes(id);
    setError("");
    setMessage(
      `${integration?.name || "Account"} ${selected ? "removed from" : "selected for"} this post.`,
    );
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  function togglePlatform(platform: "facebook" | "instagram") {
    const ids = integrations
      .filter((item) =>
        platform === "facebook"
          ? item.identifier === "facebook"
          : item.identifier.startsWith("instagram"),
      )
      .map((item) => item.id);
    const selected = ids.some((id) => selectedIds.includes(id));
    const label = platform === "facebook" ? "Facebook" : "Instagram";
    setError("");
    setMessage(`${label} ${selected ? "removed from" : "selected for"} this post.`);
    setSelectedIds((current) =>
      selected
        ? current.filter((id) => !ids.includes(id))
        : Array.from(new Set([...current, ...ids])),
    );
  }

  async function uploadFiles(files: File[]) {
    if (!files.length) return;
    if (media.length + files.length > MAX_FILES)
      return setError(`A post can contain at most ${MAX_FILES} media files.`);
    setUploading(true);
    setUploadProgress(0);
    setFailedFiles([]);
    setError("");
    const uploaded: PostizMedia[] = [];
    const failed: File[] = [];
    for (const [index, file] of files.entries()) {
      try {
        if (file.size > MAX_FILE_SIZE) throw new Error(`${file.name} is larger than 10 MB.`);
        if (!ACCEPTED_MEDIA.split(",").includes(file.type))
          throw new Error(`${file.name} has an unsupported file type.`);
        const response = await upload({
          data: {
            passkey,
            filename: file.name,
            contentType: file.type as "image/jpeg",
            base64: await fileToBase64(file),
          },
        });
        uploaded.push(response);
      } catch (uploadError) {
        failed.push(file);
        setError(
          uploadError instanceof Error ? uploadError.message : `Upload failed for ${file.name}.`,
        );
      }
      setUploadProgress(Math.round(((index + 1) / files.length) * 100));
    }
    if (uploaded.length) {
      setMedia((current) => [...current, ...uploaded].slice(0, MAX_FILES));
      setMessage(
        `${uploaded.length} media file${uploaded.length === 1 ? "" : "s"} uploaded to Postiz with a verified media reference.`,
      );
    }
    setFailedFiles(failed);
    setUploading(false);
  }

  function applyGenerated(result: SocialContentResult) {
    setCopies({
      base: result.main_post,
      facebook: result.facebook_version,
      instagram: result.instagram_version,
    });
    setGenerated(result);
    setEditedSinceGeneration(false);
  }

  async function runAi(action: AiAction, replaceDecision = false) {
    if (action === "generate" && generated && editedSinceGeneration && !replaceDecision) {
      setReplacePrompt(true);
      return;
    }
    setError("");
    setMessage("");
    const config = toAgentRuntimeConfig(getAgentConfig());
    if (!config) return setError("Connect and verify the Agent Brain in Operator Admin first.");
    if (!selectedChannels.length)
      return setError("Select Facebook, Instagram, or both before using AI.");
    if (!topic.trim()) return setError("Describe the content topic or rough idea first.");
    if (action !== "generate" && !copies[activeTab].trim())
      return setError("Add or generate copy before transforming it.");
    snapshot(`Before AI ${action}`);
    setAiBusy(action);
    setLastAiAction(action);
    const sequence = ++requestSequence.current;
    try {
      const response = await generateContent({
        data: {
          passkey,
          config,
          action,
          brand: brand === "Custom" ? customBrand || "Custom brand" : brand,
          objective,
          audience: audience || "Audience described by the topic",
          topic,
          callToAction,
          tone,
          format,
          channels: selectedChannels,
          backgroundContext,
          currentContent: copies[activeTab],
        },
      });
      if (sequence !== requestSequence.current) return;
      const result = response.result;
      if (action === "generate") applyGenerated(result);
      else if (action === "facebook") {
        updateCopy("facebook", result.facebook_version, false);
        setActiveTab("facebook");
        setGenerated(result);
      } else if (action === "instagram") {
        updateCopy("instagram", result.instagram_version, false);
        setActiveTab("instagram");
        setGenerated(result);
      } else if (action === "hashtags") {
        const tags = result.hashtags.join(" ");
        updateCopy(activeTab, `${copies[activeTab].trim()}\n\n${tags}`.trim(), false);
        setGenerated(result);
      } else {
        updateCopy(
          activeTab,
          action === "shorten" ? result.short_version : result.main_post,
          false,
        );
        setGenerated(result);
      }
      setEditedSinceGeneration(false);
      setMessage(
        `AI ${action} completed through ${config.mode} at ${new Date(response.completedAt).toLocaleString("en-PH", { timeZone: TIME_ZONE })}. Nothing was published.`,
      );
    } catch (aiError) {
      if (sequence !== requestSequence.current) return;
      setError(aiError instanceof Error ? aiError.message : "AI generation failed.");
    } finally {
      if (sequence === requestSequence.current) setAiBusy("");
    }
  }

  function cancelAi() {
    requestSequence.current += 1;
    setAiBusy("");
    setError("AI request cancelled in this workspace. The server timeout remains active.");
  }

  async function submit(type: "now" | "schedule" | "draft") {
    setError("");
    setMessage("");
    if (!copies.base.trim()) return setError("Add base copy before continuing.");
    if (!selectedIds.length) return setError("Select at least one connected account.");
    if (type !== "draft" && !approved) return setError("Complete the final review checkbox first.");
    if (type !== "draft" && instagramSelected && !media.length)
      return setError("Instagram requires uploaded media for this post.");
    if (type === "schedule" && !scheduleValid)
      return setError("Choose a future Asia/Manila schedule time.");
    setSubmitting(type);
    try {
      const response = await createPost({
        data: {
          passkey,
          type,
          date: type === "schedule" ? schedule.iso : new Date().toISOString(),
          content: copies.base.trim(),
          platformContent: {
            facebook: copies.facebook.trim() || copies.base.trim(),
            instagram: copies.instagram.trim() || copies.base.trim(),
          },
          integrationIds: selectedIds,
          media,
        },
      });
      const verb =
        type === "draft"
          ? "saved as draft"
          : type === "schedule"
            ? "scheduled"
            : "sent for publishing";
      setMessage(
        `${response.posts.length} verified Postiz post${response.posts.length === 1 ? "" : "s"} ${verb}.`,
      );
      setApproved(false);
      await onPostCreated();
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Postiz could not create the post.",
      );
    } finally {
      setSubmitting("");
    }
  }

  const workflowStatus = submitting
    ? submitting === "draft"
      ? "Draft"
      : "Publishing"
    : approved
      ? "Approved"
      : generated
        ? editedSinceGeneration
          ? "Edited"
          : "AI Generated"
        : copies.base
          ? "Ready for Review"
          : "Draft";

  return (
    <div className="space-y-5">
      {message || error ? (
        <div
          role={error ? "alert" : "status"}
          aria-live={error ? "assertive" : "polite"}
          className={`fixed bottom-5 right-5 z-[100] flex max-w-[min(26rem,calc(100vw-2.5rem))] items-start gap-3 rounded-xl border p-4 shadow-2xl backdrop-blur ${
            error
              ? "border-crimson/35 bg-bg/95 text-crimson"
              : "border-emerald-500/35 bg-bg/95 text-emerald-700"
          }`}
        >
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold">{error ? "Action needed" : "Action completed"}</p>
            <p className="mt-1 text-xs leading-relaxed">{error || message}</p>
          </div>
          <button
            type="button"
            aria-label="Dismiss status message"
            onClick={() => {
              setError("");
              setMessage("");
            }}
            className="focus-ring rounded-md p-1 text-current opacity-70 hover:opacity-100"
          >
            <X size={14} />
          </button>
        </div>
      ) : null}
      <section className="card border-gold/30 p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="eyebrow">Primary workflow</p>
            <div className="flex items-center gap-2">
              <WandSparkles size={20} className="text-gold" />
              <h2 className="font-display text-3xl font-medium">AI Content Creator</h2>
            </div>
            <p className="mt-1 text-sm text-muted">
              Build polished platform copy through the verified Agent Brain, then review every
              detail before publishing.
            </p>
          </div>
          <span className="rounded-full border border-gold/25 bg-gold/5 px-3 py-1 text-[10px] uppercase tracking-[0.12em] text-gold">
            {workflowStatus}
          </span>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <label className={labelClass}>
            Business or brand
            <select
              value={brand}
              onChange={(event) => setBrand(event.target.value)}
              className={fieldClass}
            >
              {[
                "merQato Digital",
                "Marina Terrace",
                "BAIA Palawan",
                "Kapwa Hospitality Test",
                "Custom",
              ].map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          {brand === "Custom" ? (
            <label className={labelClass}>
              Custom brand
              <input
                value={customBrand}
                onChange={(event) => setCustomBrand(event.target.value)}
                className={fieldClass}
              />
            </label>
          ) : null}
          <label className={labelClass}>
            Campaign objective
            <select
              value={objective}
              onChange={(event) => setObjective(event.target.value)}
              className={fieldClass}
            >
              {[
                "Awareness",
                "Engagement",
                "Lead generation",
                "Booking inquiry",
                "Event promotion",
                "Community building",
                "Educational",
                "Offer or promotion",
              ].map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <label className={labelClass}>
            Tone
            <select
              value={tone}
              onChange={(event) => setTone(event.target.value)}
              className={fieldClass}
            >
              {[
                "Warm",
                "Professional",
                "Friendly",
                "Editorial",
                "Playful",
                "Direct",
                "Luxury hospitality",
                "Community-focused",
              ].map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <label className={labelClass}>
            Post format
            <select
              value={format}
              onChange={(event) => setFormat(event.target.value)}
              className={fieldClass}
            >
              {[
                "Single post",
                "Image caption",
                "Facebook post",
                "Instagram caption",
                "Carousel concept",
                "Story concept",
                "Short campaign",
                "Weekly content set",
              ].map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <label className={`${labelClass} md:col-span-2`}>
            Target audience
            <input
              value={audience}
              onChange={(event) => setAudience(event.target.value)}
              placeholder="Remote workers and digital nomads considering Palawan"
              className={fieldClass}
            />
          </label>
          <label className={`${labelClass} md:col-span-2`}>
            Call to action
            <input
              value={callToAction}
              onChange={(event) => setCallToAction(event.target.value)}
              placeholder="Invite people to join the community or send an inquiry"
              className={fieldClass}
            />
          </label>
          <label className={`${labelClass} md:col-span-2 xl:col-span-4`}>
            Content topic or rough idea
            <textarea
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              rows={3}
              placeholder="digital nomads in San Vicente, Palawan Island, where are you?"
              className={fieldClass}
            />
          </label>
          <label className={`${labelClass} md:col-span-2 xl:col-span-3`}>
            Optional background context
            <textarea
              value={backgroundContext}
              onChange={(event) => setBackgroundContext(event.target.value)}
              rows={2}
              placeholder="Facts, offer details, links, or constraints the AI must preserve"
              className={fieldClass}
            />
          </label>
          <div className={labelClass}>
            Selected channels
            <div className="flex gap-2">
              {(["facebook", "instagram"] as const).map((platform) => {
                const selected = selectedChannels.includes(platform);
                return (
                  <button
                    key={platform}
                    type="button"
                    aria-label={platform}
                    aria-pressed={selected}
                    title={`${platform} is ${selected ? "selected" : "not selected"}`}
                    onClick={() => togglePlatform(platform)}
                    className={`focus-ring inline-flex items-center gap-2 rounded-md border px-3 py-2 text-xs capitalize ${selected ? "border-gold bg-gold/10 text-gold" : "border-line/25 text-muted"}`}
                  >
                    <span
                      aria-hidden="true"
                      className={`flex h-4 w-4 items-center justify-center rounded-full border text-[10px] ${selected ? "border-gold bg-gold text-[#0b0b0b]" : "border-line/40"}`}
                    >
                      {selected ? "✓" : ""}
                    </span>
                    {platform}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {replacePrompt ? (
          <div className="mt-4 rounded-xl border border-gold/30 bg-gold/5 p-4">
            <p className="text-sm font-medium">Replace current edited copy?</p>
            <p className="mt-1 text-xs text-muted">
              The current version will remain in session history.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setReplacePrompt(false);
                  runAi("generate", true);
                }}
                className="rounded-md bg-gold px-3 py-2 text-xs font-medium text-[#0b0b0b]"
              >
                Replace current copy
              </button>
              <button
                type="button"
                onClick={() => {
                  snapshot("Saved manual version");
                  setReplacePrompt(false);
                  runAi("generate", true);
                }}
                className="rounded-md border border-line/30 px-3 py-2 text-xs"
              >
                Generate as new version
              </button>
              <button
                type="button"
                onClick={() => setReplacePrompt(false)}
                className="rounded-md border border-line/30 px-3 py-2 text-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : null}

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => runAi("generate")}
            disabled={Boolean(aiBusy)}
            className="focus-ring inline-flex items-center gap-2 rounded-md bg-ink px-5 py-2.5 text-sm font-medium text-bg disabled:opacity-50"
          >
            {aiBusy === "generate" ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Sparkles size={15} />
            )}{" "}
            {aiBusy === "generate" ? "Generating…" : "Generate content"}
          </button>
          {aiBusy ? (
            <button
              type="button"
              onClick={cancelAi}
              className="focus-ring inline-flex items-center gap-1 rounded-md border border-crimson/30 px-3 py-2 text-xs text-crimson"
            >
              <X size={12} /> Cancel
            </button>
          ) : null}
          {error && lastAiAction ? (
            <button
              type="button"
              onClick={() => runAi(lastAiAction)}
              className="focus-ring inline-flex items-center gap-1 rounded-md border border-line/30 px-3 py-2 text-xs"
            >
              <RotateCcw size={12} /> Retry last AI action
            </button>
          ) : null}
        </div>
      </section>

      <section className="card p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="eyebrow">Channels</p>
            <h2 className="font-display text-2xl">Connected Postiz accounts</h2>
          </div>
          <button
            type="button"
            onClick={() => {
              setSelectedIds([]);
              setError("");
              setMessage("All channels cleared. Select Facebook, Instagram, or both.");
            }}
            className="text-xs text-muted"
          >
            Clear all
          </button>
        </div>
        <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
          {integrations.map((integration) => {
            const selected = selectedIds.includes(integration.id);
            return (
              <button
                key={integration.id}
                type="button"
                disabled={integration.disabled}
                aria-pressed={selected}
                onClick={() => toggleIntegration(integration.id)}
                className={`focus-ring flex min-w-48 items-center gap-3 rounded-xl border p-3 text-left disabled:opacity-40 ${selected ? "border-gold bg-gold/8" : "border-line/20"}`}
              >
                {integration.picture ? (
                  <img
                    src={integration.picture}
                    alt=""
                    className="h-9 w-9 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold/10 text-gold">
                    {integration.identifier === "facebook" ? "f" : "◎"}
                  </span>
                )}
                <span>
                  <span className="block text-xs font-medium">{integration.name}</span>
                  <span className="block text-[10px] text-muted">
                    {integration.identifier.replace("-standalone", "")}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {generated ? (
        <section className="card p-5 sm:p-6">
          <p className="eyebrow">Generated platform content</p>
          <div className="grid gap-3 lg:grid-cols-3">
            {(
              [
                ["Main post", generated.main_post, "base"],
                ["Facebook version", generated.facebook_version, "facebook"],
                ["Instagram version", generated.instagram_version, "instagram"],
              ] as const
            ).map(([label, value, tab]) => (
              <article key={tab} className="rounded-xl border border-line/20 p-4">
                <h3 className="font-display text-xl">{label}</h3>
                <p className="mt-2 line-clamp-6 whitespace-pre-wrap text-sm leading-relaxed text-muted">
                  {value}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    snapshot(`Before using ${label}`);
                    updateCopy(tab, value, false);
                    setActiveTab(tab);
                  }}
                  className="mt-3 rounded-md border border-gold/30 px-3 py-2 text-xs text-gold"
                >
                  Use {tab === "base" ? "as main post" : `${tab} version`}
                </button>
              </article>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() =>
                updateCopy(
                  activeTab,
                  `${copies[activeTab].trim()}\n\n${generated.hashtags.join(" ")}`.trim(),
                  false,
                )
              }
              className="rounded-md border border-line/25 px-3 py-2 text-xs"
            >
              Append hashtags
            </button>
            <span className="rounded-md border border-line/20 px-3 py-2 text-xs text-muted">
              Image brief: {generated.image_brief}
            </span>
          </div>
        </section>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(340px,0.8fr)]">
        <div className="space-y-5">
          <section className="card p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="eyebrow">Manual composer</p>
                <h2 className="font-display text-2xl">Platform copy</h2>
              </div>
              <span className="font-mono text-[11px] text-faint">
                {copies[activeTab].length} characters
              </span>
            </div>
            <div className="mt-4 flex gap-2" role="tablist" aria-label="Platform copy editor">
              {(["base", "facebook", "instagram"] as CopyTab[]).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab}
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-md border px-3 py-2 text-xs capitalize ${activeTab === tab ? "border-gold bg-gold/10 text-gold" : "border-line/25 text-muted"}`}
                >
                  {tab} · {copies[tab].length}
                </button>
              ))}
            </div>
            <textarea
              value={copies[activeTab]}
              onChange={(event) => updateCopy(activeTab, event.target.value)}
              onBlur={() => snapshot(`Manual ${activeTab} edit`)}
              rows={10}
              className="focus-ring mt-3 w-full resize-y rounded-xl border border-line/25 bg-bg/40 p-4 text-sm leading-relaxed text-ink"
              placeholder={`Write ${activeTab} copy…`}
            />
            <div className="mt-3 flex flex-wrap gap-2">
              {(["improve", "shorten", "hashtags", "facebook", "instagram"] as AiAction[]).map(
                (action) => (
                  <button
                    key={action}
                    type="button"
                    onClick={() => runAi(action)}
                    disabled={Boolean(aiBusy)}
                    className="rounded-md border border-line/25 px-3 py-2 text-xs capitalize text-muted disabled:opacity-50"
                  >
                    {aiBusy === action
                      ? "Working…"
                      : action === "facebook"
                        ? "Facebook version"
                        : action === "instagram"
                          ? "Instagram version"
                          : action}
                  </button>
                ),
              )}
              <button
                type="button"
                onClick={() => runAi("tone")}
                disabled={Boolean(aiBusy)}
                className="inline-flex items-center gap-1 rounded-md bg-ink px-3 py-2 text-xs text-bg disabled:opacity-50"
              >
                <Sparkles size={12} /> Change tone
              </button>
              <button
                type="button"
                disabled={!versions.length}
                onClick={() => {
                  const previous = versions[versions.length - 1];
                  if (previous) {
                    setCopies(previous.copies);
                    setVersions((current) => current.slice(0, -1));
                  }
                }}
                className="inline-flex items-center gap-1 rounded-md border border-line/25 px-3 py-2 text-xs disabled:opacity-40"
              >
                <RotateCcw size={12} /> Undo last AI change
              </button>
            </div>
            {versions.length ? (
              <details className="mt-4 rounded-lg border border-line/20 p-3">
                <summary className="cursor-pointer text-xs text-muted">
                  <History size={12} className="mr-1 inline" /> Session version history (
                  {versions.length})
                </summary>
                <div className="mt-2 space-y-1">
                  {versions
                    .slice(-6)
                    .reverse()
                    .map((version) => (
                      <button
                        key={version.id}
                        type="button"
                        onClick={() => {
                          snapshot("Before restoring version");
                          setCopies(version.copies);
                        }}
                        className="block w-full rounded-md px-2 py-1.5 text-left text-[11px] text-muted hover:bg-surface-2"
                      >
                        {version.label} ·{" "}
                        {new Date(version.at).toLocaleTimeString("en-PH", { timeZone: TIME_ZONE })}
                      </button>
                    ))}
                </div>
              </details>
            ) : null}
          </section>

          <section className="card p-5 sm:p-6">
            <p className="eyebrow">Media</p>
            {uploading ? (
              <div className="mb-3">
                <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
                  <div className="h-full bg-gold" style={{ width: `${uploadProgress}%` }} />
                </div>
                <p className="mt-1 text-[10px] text-muted">
                  Uploading to Postiz · {uploadProgress}%
                </p>
              </div>
            ) : null}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {media.map((item) => (
                <div
                  key={item.id}
                  className="group relative overflow-hidden rounded-xl border border-line/20"
                >
                  {item.name.toLowerCase().endsWith(".mp4") ? (
                    <video src={item.path} className="aspect-square w-full object-cover" />
                  ) : (
                    <img
                      src={item.path}
                      alt={item.alt ?? "Uploaded post media"}
                      className="aspect-square w-full object-cover"
                    />
                  )}
                  <button
                    type="button"
                    onClick={() =>
                      setMedia((current) => current.filter((entry) => entry.id !== item.id))
                    }
                    aria-label={`Remove ${item.name}`}
                    className="absolute right-2 top-2 rounded-full bg-black/75 p-1.5 text-white"
                  >
                    <Trash2 size={12} />
                  </button>
                  <p className="truncate px-2 py-1 font-mono text-[8px] text-faint">
                    Postiz ID: {item.id}
                  </p>
                </div>
              ))}
              <label className="focus-within:ring-2 focus-within:ring-gold flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-gold/30 bg-gold/[0.03] text-center text-xs text-muted">
                {uploading ? (
                  <Loader2 size={20} className="animate-spin text-gold" />
                ) : (
                  <ImagePlus size={20} className="text-gold" />
                )}
                <span className="mt-2">{uploading ? "Uploading…" : "Add media"}</span>
                <span className="mt-1 text-[9px] text-faint">Images or MP4 · max 10 MB</span>
                <input
                  type="file"
                  multiple
                  accept={ACCEPTED_MEDIA}
                  disabled={uploading}
                  onChange={(event) => {
                    const files = Array.from(event.currentTarget.files ?? []);
                    event.currentTarget.value = "";
                    void uploadFiles(files);
                  }}
                  className="sr-only"
                />
              </label>
            </div>
            {failedFiles.length ? (
              <button
                type="button"
                onClick={() => uploadFiles(failedFiles)}
                className="mt-3 inline-flex items-center gap-1 rounded-md border border-crimson/30 px-3 py-2 text-xs text-crimson"
              >
                <RotateCcw size={12} /> Retry {failedFiles.length} failed upload
                {failedFiles.length === 1 ? "" : "s"}
              </button>
            ) : null}
          </section>
        </div>

        <aside className="space-y-5">
          <PostPreview copies={copies} media={media} integrations={selectedIntegrations} />
          <section className="card p-5">
            <p className="eyebrow">Review and approval</p>
            <h2 className="font-display text-2xl">Review post</h2>
            <dl className="mt-4 space-y-3 text-xs">
              <div>
                <dt className="text-faint">Accounts</dt>
                <dd className="mt-1 text-ink">
                  {selectedIntegrations.map((item) => item.name).join(", ") || "None selected"}
                </dd>
              </div>
              <div>
                <dt className="text-faint">Copy</dt>
                <dd className="mt-1 text-ink">
                  Base {copies.base.length} · Facebook{" "}
                  {copies.facebook.length || copies.base.length} · Instagram{" "}
                  {copies.instagram.length || copies.base.length} characters
                </dd>
              </div>
              <div>
                <dt className="text-faint">Media</dt>
                <dd className="mt-1 text-ink">
                  {media.length} verified Postiz upload{media.length === 1 ? "" : "s"}
                </dd>
              </div>
              <div>
                <dt className="text-faint">Publish mode</dt>
                <dd className="mt-1 text-ink">
                  {publishMode === "now" ? "Publish now" : `Scheduled for ${schedule.label}`}
                </dd>
              </div>
              <div>
                <dt className="text-faint">Call to action</dt>
                <dd className="mt-1 text-ink">
                  {callToAction || generated?.call_to_action || "No explicit call to action"}
                </dd>
              </div>
            </dl>
            {instagramSelected && !media.length ? (
              <p className="mt-3 rounded-md border border-crimson/25 bg-crimson/5 p-2 text-[11px] text-crimson">
                Add verified media before approving an Instagram post.
              </p>
            ) : null}
            <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-lg border border-gold/25 bg-gold/5 p-3 text-xs leading-relaxed">
              <input
                type="checkbox"
                checked={approved}
                onChange={(event) => setApproved(event.target.checked)}
                className="mt-0.5 accent-[#b99a45]"
              />
              <span>I reviewed the text, media, accounts, date, and time.</span>
            </label>
          </section>

          <section className="card p-5">
            <p className="eyebrow">Publishing controls</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                aria-pressed={publishMode === "now"}
                onClick={() => setPublishMode("now")}
                className={`rounded-xl border p-3 text-left ${publishMode === "now" ? "border-gold bg-gold/10 text-gold" : "border-line/20"}`}
              >
                <span className="block text-sm font-medium">Publish now</span>
                <span className="text-[10px] text-muted">Immediate after approval</span>
              </button>
              <button
                type="button"
                aria-pressed={publishMode === "schedule"}
                onClick={() => setPublishMode("schedule")}
                className={`rounded-xl border p-3 text-left ${publishMode === "schedule" ? "border-gold bg-gold/10 text-gold" : "border-line/20"}`}
              >
                <span className="block text-sm font-medium">Schedule</span>
                <span className="text-[10px] text-muted">Asia/Manila GMT+8</span>
              </button>
            </div>
            {publishMode === "schedule" ? (
              <div className="mt-3 grid grid-cols-2 gap-3">
                <label className={labelClass}>
                  Date
                  <input
                    type="date"
                    value={date}
                    onInput={(event) => setDate(event.currentTarget.value)}
                    onChange={(event) => setDate(event.target.value)}
                    className={`${fieldClass} min-w-0`}
                  />
                </label>
                <label className={labelClass}>
                  Time
                  <input
                    type="time"
                    value={time}
                    onInput={(event) => setTime(event.currentTarget.value)}
                    onChange={(event) => setTime(event.target.value)}
                    className={`${fieldClass} min-w-0`}
                  />
                </label>
                <p
                  className={`col-span-2 text-[11px] ${scheduleValid ? "text-emerald-700" : "text-crimson"}`}
                >
                  {scheduleValid
                    ? `Scheduled for ${schedule.label}`
                    : "Choose a future date and time in Asia/Manila."}
                </p>
              </div>
            ) : null}
            {message ? (
              <p className="mt-3 rounded-md border border-emerald-500/25 bg-emerald-500/5 p-3 text-xs text-emerald-700">
                {message}
              </p>
            ) : null}
            {error ? (
              <div className="mt-3 rounded-md border border-crimson/30 bg-crimson/5 p-3 text-xs text-crimson">
                <p>{error}</p>
              </div>
            ) : null}
            <div className="mt-4 space-y-2">
              <button
                type="button"
                onClick={() => submit("draft")}
                disabled={Boolean(submitting) || uploading}
                className="w-full rounded-md border border-line/30 px-4 py-2.5 text-sm disabled:opacity-50"
              >
                {submitting === "draft" ? "Saving…" : "Save as draft"}
              </button>
              <button
                type="button"
                onClick={() => submit(publishMode)}
                disabled={Boolean(submitting) || uploading}
                data-ready={finalReady ? "true" : "false"}
                className={`inline-flex w-full items-center justify-center gap-2 rounded-md border px-4 py-3 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-40 ${
                  finalReady
                    ? "border-gold bg-gold text-[#0b0b0b]"
                    : "border-gold/40 bg-gold/10 text-gold"
                }`}
              >
                {submitting ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : publishMode === "now" ? (
                  <Send size={14} />
                ) : (
                  <CalendarClock size={14} />
                )}
                {submitting
                  ? "Sending…"
                  : publishMode === "now"
                    ? "Approve and Publish"
                    : "Approve and Schedule"}
              </button>
            </div>
            <p className="mt-3 flex items-start gap-1.5 text-[10px] leading-relaxed text-faint">
              <CheckCircle2 size={11} className="mt-0.5 shrink-0" /> AI generation never publishes
              automatically. The final action remains disabled until review is confirmed.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
