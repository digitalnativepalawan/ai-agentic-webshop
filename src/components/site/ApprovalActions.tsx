import { useState } from "react";
import { Check, Copy, Loader2, Lock, MessageCircle } from "lucide-react";

import { APPROVAL } from "@/lib/checkout-rules";
import { createApprovalRequest } from "@/lib/checkout.functions";
import { CTAButton } from "./CTAButton";

interface SuccessResult {
  orderId: string;
  orderRef: string;
  status: string;
}

/**
 * Human-facing approval request form. Submits to the deterministic
 * createApprovalRequest server function (price resolved server-side) and
 * degrades gracefully: on any failure it keeps the form and surfaces the
 * WhatsApp fallback rather than dead-ending the user.
 */
export function ApprovalActions({ offerId }: { offerId: string }) {
  const [form, setForm] = useState({ name: "", email: "", notes: "" });
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SuccessResult | null>(null);
  const [copied, setCopied] = useState(false);

  const submit = async () => {
    if (status === "submitting") return;
    setStatus("submitting");
    setError(null);
    try {
      const res = await createApprovalRequest({
        data: {
          offerId,
          requesterName: form.name.trim() || undefined,
          requesterEmail: form.email.trim() || undefined,
          notes: form.notes.trim() || undefined,
          channel: "web",
        },
      });
      setResult({ orderId: res.orderId, orderRef: res.orderRef, status: res.status });
      setStatus("idle");
    } catch {
      setError("We couldn't submit your request. Please try again, or reach us on WhatsApp.");
      setStatus("error");
    }
  };

  if (result) {
    const copyRef = () =>
      navigator.clipboard?.writeText(result.orderRef).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      });

    return (
      <div className="mt-4 flex flex-col items-center rounded-lg border border-gold/25 bg-gold/[0.04] px-4 py-6 text-center">
        <span className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full border border-gold/40 text-gold">
          <Check size={22} />
        </span>
        <h4 className="font-display text-[20px] font-medium">Request received</h4>
        <p className="mt-1.5 max-w-xs text-[12.5px] leading-relaxed text-muted">
          A Palawan-based human will review your request and reply within {APPROVAL.averageTime}.
          No payment has been taken.
        </p>
        <button
          type="button"
          onClick={copyRef}
          className="focus-ring mt-4 inline-flex items-center gap-2 rounded bg-surface-2/70 px-3 py-1.5 font-mono text-[12px] text-ink transition-colors hover:text-gold"
        >
          {result.orderRef}
          {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
        </button>
        <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-gold">
          Awaiting human approval
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-3">
      <div className="grid grid-cols-2 gap-2.5">
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Your name"
          autoComplete="name"
          className="input !py-2.5 text-[13px]"
        />
        <input
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="Email"
          autoComplete="email"
          className="input !py-2.5 text-[13px]"
        />
      </div>
      <textarea
        value={form.notes}
        onChange={(e) => setForm({ ...form, notes: e.target.value })}
        rows={2}
        placeholder="Anything we should know? (optional)"
        className="input resize-none !py-2.5 text-[13px]"
      />

      {error && (
        <p
          role="alert"
          className="rounded-lg border border-crimson/30 bg-crimson/[0.06] px-3 py-2 text-[12px] text-crimson"
        >
          {error}
        </p>
      )}

      <CTAButton
        variant="primary"
        full
        onClick={submit}
        disabled={status === "submitting"}
        arrow={status !== "submitting"}
        icon={status === "submitting" ? <Loader2 size={15} className="animate-spin" /> : undefined}
      >
        {status === "submitting" ? "Submitting…" : "Request approval"}
      </CTAButton>

      <button
        type="button"
        className="focus-ring flex w-full items-center justify-center gap-2 rounded-lg border border-gold/35 px-4 py-3 font-mono text-[12px] uppercase tracking-[0.12em] text-gold transition-colors hover:border-gold hover:bg-gold/10"
      >
        <MessageCircle size={15} /> Send to WhatsApp
      </button>

      <p className="flex items-center justify-center gap-1.5 pt-1 text-[11.5px] text-faint">
        <Lock size={12} /> No payment is taken until a human approves.
      </p>
    </div>
  );
}
