import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { AdminGate, useAdminAuth } from "./AdminGate";
import { OperatorDeleteDialog } from "./OperatorDeleteDialog";
import { OperatorEditorDialog } from "./OperatorEditorDialog";
import { useOperatorCatalog, type EditableOperator } from "@/context/OperatorCatalogContext";
import { useOperatorMedia } from "@/hooks/useOperatorMedia";
import { getAgentConfig, setAgentConfig, type AgentMode } from "@/lib/agentConfig";
import { listAgentBrainModels, testAgentBrainConnection } from "@/lib/agent.functions";

function blankOperator(order: number): EditableOperator {
  return {
    id: "",
    kind: "operator",
    name: "",
    icon: "Bot",
    tagline: "",
    category: "hospitality",
    badges: [],
    price: { amount: 0, currency: "PHP", model: "monthly_subscription", suffix: "/ mo" },
    humanApprovalRequired: true,
    agentReadable: true,
    featured: false,
    topRated: false,
    deploymentScope: [],
    includedServices: [],
    active: true,
    displayOrder: order,
  };
}

export function OperatorAdminPage() {
  return (
    <AdminGate>
      <OperatorManager />
    </AdminGate>
  );
}

function OperatorManager() {
  const catalog = useOperatorCatalog();
  const mediaCatalog = useOperatorMedia();
  const { passkey, lock } = useAdminAuth();
  const testAgent = useServerFn(testAgentBrainConnection);
  const listAgentModels = useServerFn(listAgentBrainModels);
  const [message, setMessage] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [editing, setEditing] = useState<EditableOperator | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<EditableOperator | null>(null);
  const cfg = getAgentConfig();
  const [mode, setMode] = useState<AgentMode | null>(cfg.mode);
  const [keyInput, setKeyInput] = useState(cfg.openrouterKey);
  const [modelInput, setModelInput] = useState(cfg.model);
  const [ollamaBaseUrl, setOllamaBaseUrl] = useState(cfg.ollamaBaseUrl);
  const [generationTimeoutMs, setGenerationTimeoutMs] = useState(cfg.generationTimeoutMs);
  const [orModels, setOrModels] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "checking" | "ok" | "bad">("idle");
  const [statusMsg, setStatusMsg] = useState("");

  useEffect(() => {
    catalog
      .loadAdmin(passkey)
      .catch((error) => setMessage(error instanceof Error ? error.message : String(error)));
  }, [passkey]);

  async function guarded(id: string, action: () => Promise<void>, done: string) {
    setBusyId(id);
    setMessage("");
    try {
      await action();
      setMessage(done);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setBusyId(null);
    }
  }

  async function saveOperator(operator: EditableOperator) {
    const originalId = editing?.id;
    if (isNew) await catalog.addOperator(operator, passkey);
    else await catalog.updateOperator(originalId ?? operator.id, operator, passkey);
    setEditing(null);
    setMessage(`${operator.name} saved`);
  }

  async function verify() {
    setStatus("checking");
    setStatusMsg("Checking connection…");
    try {
      if (!mode) throw new Error("Pick OpenRouter or Local Ollama first.");
      if (!modelInput.trim()) throw new Error("Enter or select a model first.");
      const result = await testAgent({
        data: {
          passkey,
          config: {
            mode,
            model: modelInput.trim(),
            ollamaBaseUrl: ollamaBaseUrl.trim(),
            openrouterKey: keyInput.trim(),
            generationTimeoutMs,
          },
        },
      });
      setOrModels(result.models);
      setStatusMsg(
        `${result.provider === "ollama" ? "Ollama" : "OpenRouter"} verified — ${result.model} is available.`,
      );
      setStatus("ok");
    } catch (e) {
      setStatus("bad");
      setStatusMsg(e instanceof Error ? e.message : "Connection failed.");
    }
  }

  async function syncOllamaModels() {
    setStatus("checking");
    setStatusMsg("Checking Ollama and loading installed models…");
    try {
      const result = await listAgentModels({
        data: { passkey, ollamaBaseUrl: ollamaBaseUrl.trim() },
      });
      setOrModels(result.models);
      if (result.models.length === 0) {
        setStatus("bad");
        setStatusMsg("Ollama is reachable, but no installed models were returned.");
        return;
      }
      setModelInput((current) =>
        result.models.includes(current)
          ? current
          : result.models.includes("qwen2.5-coder:7b")
            ? "qwen2.5-coder:7b"
            : result.models[0],
      );
      setStatus("idle");
      setStatusMsg(
        `${result.models.length} installed Ollama model${result.models.length === 1 ? "" : "s"} found. Save & connect to verify the selection.`,
      );
    } catch (error) {
      setStatus("bad");
      setStatusMsg(error instanceof Error ? error.message : "Could not load Ollama models.");
    }
  }

  async function saveConfig() {
    try {
      if (!mode) throw new Error("Pick OpenRouter or Local Ollama first.");
      if (!modelInput.trim()) throw new Error("Enter or select a model first.");
      const result = await testAgent({
        data: {
          passkey,
          config: {
            mode,
            model: modelInput.trim(),
            ollamaBaseUrl: ollamaBaseUrl.trim(),
            openrouterKey: keyInput.trim(),
            generationTimeoutMs,
          },
        },
      });
      setOrModels(result.models);
      setAgentConfig({
        mode,
        openrouterKey: mode === "openrouter" ? keyInput.trim() : "",
        model: result.model,
        ollamaBaseUrl: ollamaBaseUrl.trim(),
        generationTimeoutMs,
        lastSuccessfulHealthCheck: result.checkedAt,
      });
      setStatusMsg(`Verified and saved — using ${result.model}.`);
      setStatus("ok");
      setMessage("Agent brain connected.");
    } catch (e) {
      setStatus("bad");
      setStatusMsg(e instanceof Error ? e.message : "Save failed.");
    }
  }

  const editingMedia = editing
    ? mediaCatalog.media
        .filter((item) => item.operatorId === editing.id)
        .sort((a, b) => a.sortOrder - b.sortOrder)
    : [];

  return (
    <div className="shell py-10">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Admin</p>
          <h1 className="font-display text-4xl font-medium">AI Operator Selection</h1>
          <p className="mt-2 text-sm text-muted">
            Manage complete operator details, pricing, visibility, screenshots, and video.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/admin/social-media"
            className="focus-ring rounded-md border border-gold/40 px-4 py-2 text-sm text-gold"
          >
            Social Media Operator
          </Link>
          <button
            onClick={() => {
              setIsNew(true);
              setEditing(blankOperator(catalog.operators.length));
            }}
            className="rounded-md bg-gold px-4 py-2 text-sm font-medium text-[#0b0b0b]"
          >
            Add operator
          </button>
          <button onClick={lock} className="rounded-md border border-line px-4 py-2 text-sm">
            Lock
          </button>
        </div>
      </div>

      {message && (
        <p className="mb-4 rounded-md border border-gold/25 bg-gold/5 px-4 py-3 text-sm text-gold">
          {message}
        </p>
      )}

      {/* AGENT MODEL CONFIG */}
      <div className="card flex flex-col gap-4 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="eyebrow !mb-1.5">Agent brain</p>
            <h3 className="font-display text-xl font-medium">Connect a model</h3>
          </div>
          {status === "ok" && (
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-[12px] font-medium text-emerald-600">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />{" "}
              {mode === "ollama" ? "Ollama live" : "OpenRouter live"}
            </span>
          )}
          {status === "bad" && (
            <span className="inline-flex items-center gap-2 rounded-full border border-crimson/40 bg-crimson/10 px-3 py-1 text-[12px] font-medium text-crimson">
              <span className="h-2 w-2 rounded-full bg-crimson" /> not connected
            </span>
          )}
        </div>

        <p className="text-sm text-muted">
          Pick one — OpenRouter (cloud, paste a key) or your local Ollama device. The green light
          confirms it's reachable. The site widgets use whichever you connect. No default; partners
          play without a key.
        </p>

        {/* mode toggle */}
        <div className="flex flex-wrap gap-2">
          {(["openrouter", "ollama"] as AgentMode[]).map((m) => (
            <button
              key={m}
              onClick={() => {
                setMode(m);
                setStatus("idle");
                setStatusMsg("");
              }}
              className={`focus-ring rounded-md border px-4 py-2 text-sm ${mode === m ? "border-gold bg-gold/[0.08] text-gold" : "border-line/30 text-muted hover:border-gold/40"}`}
            >
              {m === "openrouter" ? "OpenRouter (cloud)" : "Local Ollama (device)"}
            </button>
          ))}
        </div>

        {/* openrouter fields */}
        {mode === "openrouter" && (
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-[12px] text-muted">
              OpenRouter API key
              <input
                type="password"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder="sk-or-..."
                className="focus-ring w-full rounded-md border border-line/25 bg-bg/60 px-3 py-2 font-mono text-[12.5px] text-ink placeholder:text-faint"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-[12px] text-muted">
              Model
              <input
                value={modelInput}
                onChange={(e) => setModelInput(e.target.value)}
                placeholder="e.g. google/gemini-2.0-flash-exp:free"
                className="focus-ring w-full rounded-md border border-line/25 bg-bg/60 px-3 py-2 font-mono text-[12.5px] text-ink placeholder:text-faint"
              />
            </label>
          </div>
        )}

        {/* ollama fields */}
        {mode === "ollama" && (
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-[12px] text-muted">
              Ollama base URL
              <input
                value={ollamaBaseUrl}
                onChange={(event) => setOllamaBaseUrl(event.target.value)}
                className="focus-ring w-full rounded-md border border-line/25 bg-bg/60 px-3 py-2 font-mono text-[12.5px] text-ink"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-[12px] text-muted">
              Local Ollama model (synced from your device)
              <select
                value={modelInput}
                onChange={(e) => setModelInput(e.target.value)}
                className="focus-ring w-full rounded-md border border-line/25 bg-bg/60 px-3 py-2 text-[13px] text-ink"
              >
                <option value="">— select a local model —</option>
                {orModels.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1.5 text-[12px] text-muted">
              Generation timeout
              <select
                value={generationTimeoutMs}
                onChange={(event) => setGenerationTimeoutMs(Number(event.target.value))}
                className="focus-ring w-full rounded-md border border-line/25 bg-bg/60 px-3 py-2 text-[13px] text-ink"
              >
                <option value={60000}>60 seconds</option>
                <option value={90000}>90 seconds</option>
                <option value={120000}>120 seconds</option>
              </select>
            </label>
            <div className="flex flex-wrap items-end gap-2">
              <button
                onClick={syncOllamaModels}
                className="focus-ring rounded-md border border-line/30 px-4 py-2 text-sm text-muted hover:border-gold/40"
              >
                Sync models from device
              </button>
              <button
                onClick={verify}
                disabled={!modelInput.trim()}
                className="focus-ring rounded-md border border-line/30 px-4 py-2 text-sm text-muted hover:border-gold/40 disabled:opacity-50"
              >
                Test selected model
              </button>
            </div>
            {modelInput === "qwen2.5-coder:7b" ? (
              <p className="rounded-md border border-gold/25 bg-gold/5 px-3 py-2 text-[11px] text-gold sm:col-span-2">
                qwen2.5-coder:7b remains supported. A general instruction model may produce more
                natural hospitality and social-media copy; models are never downloaded or switched
                automatically.
              </p>
            ) : null}
          </div>
        )}

        {statusMsg && (
          <p className={`text-[12px] ${status === "ok" ? "text-emerald-600" : "text-crimson"}`}>
            {statusMsg}
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          <button
            onClick={saveConfig}
            className="rounded-md bg-gold px-4 py-2 text-sm font-medium text-[#0b0b0b]"
          >
            Save &amp; connect
          </button>
          <button
            onClick={() => {
              setAgentConfig({
                mode: null,
                openrouterKey: "",
                model: "",
                ollamaBaseUrl,
                generationTimeoutMs,
                lastSuccessfulHealthCheck: null,
              });
              setMode(null);
              setStatus("idle");
              setStatusMsg("");
              setMessage("Agent config cleared.");
            }}
            className="rounded-md border border-line px-4 py-2 text-sm"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="grid gap-4">
        {catalog.operators.map((operator) => {
          const busy = busyId === operator.id;
          const mediaCount = mediaCatalog.media.filter(
            (item) => item.operatorId === operator.id,
          ).length;
          return (
            <article
              key={operator.id}
              className="card flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-display text-2xl">{operator.name}</h2>
                  {operator.featured && (
                    <span className="rounded-full border border-gold/30 px-2 py-0.5 text-xs text-gold">
                      Featured
                    </span>
                  )}
                  {!operator.active && (
                    <span className="rounded-full border border-crimson/30 px-2 py-0.5 text-xs text-crimson">
                      Hidden
                    </span>
                  )}
                </div>
                <p className="mt-1 max-w-3xl text-sm text-muted">{operator.tagline}</p>
                <p className="mt-2 text-xs text-muted">
                  Order {operator.displayOrder} · {operator.category} · ₱
                  {operator.price.amount.toLocaleString()} {operator.price.suffix} · {mediaCount}{" "}
                  media
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {operator.id === "social-media-operator" ? (
                  <Link
                    to="/admin/social-media"
                    className="rounded-md border border-gold/40 px-3 py-2 text-sm text-gold"
                  >
                    Open workspace
                  </Link>
                ) : null}
                <button
                  disabled={busy}
                  onClick={() => {
                    setIsNew(false);
                    setEditing(operator);
                  }}
                  className="rounded-md border border-line px-3 py-2 text-sm disabled:opacity-50"
                >
                  Edit
                </button>
                <button
                  disabled={busy}
                  onClick={() =>
                    guarded(
                      operator.id,
                      () =>
                        catalog.updateOperator(
                          operator.id,
                          { ...operator, active: !operator.active },
                          passkey,
                        ),
                      operator.active ? "Operator hidden" : "Operator visible",
                    )
                  }
                  className="rounded-md border border-line px-3 py-2 text-sm disabled:opacity-50"
                >
                  {operator.active ? "Hide" : "Show"}
                </button>
                <button
                  disabled={busy}
                  onClick={() =>
                    guarded(
                      operator.id,
                      () =>
                        catalog.updateOperator(
                          operator.id,
                          { ...operator, featured: !operator.featured },
                          passkey,
                        ),
                      operator.featured ? "Operator unfeatured" : "Operator featured",
                    )
                  }
                  className="rounded-md border border-line px-3 py-2 text-sm disabled:opacity-50"
                >
                  {operator.featured ? "Unfeature" : "Feature"}
                </button>
                <button
                  disabled={busy}
                  onClick={() => setDeleteTarget(operator)}
                  className="rounded-md border border-crimson/40 px-3 py-2 text-sm text-crimson disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </article>
          );
        })}
      </div>

      <OperatorEditorDialog
        operator={editing}
        isNew={isNew}
        passkey={passkey}
        media={editingMedia}
        onMediaChange={() => mediaCatalog.refresh()}
        onClose={() => setEditing(null)}
        onSave={saveOperator}
      />

      <OperatorDeleteDialog
        operator={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onDelete={(operator) => {
          setDeleteTarget(null);
          guarded(
            operator.id,
            () => catalog.deleteOperator(operator.id, passkey),
            `${operator.name} deleted`,
          );
        }}
      />
    </div>
  );
}
