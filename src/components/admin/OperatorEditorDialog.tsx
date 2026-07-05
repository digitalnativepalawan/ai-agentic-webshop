import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { EditableOperator } from "@/context/OperatorCatalogContext";
import type { OperatorMedia } from "@/lib/operator-media";
import { OperatorFormFields } from "./OperatorFormFields";
import { OperatorMediaAdmin } from "./OperatorMediaAdmin";

const slugify = (value: string) => value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export function OperatorEditorDialog({
  operator,
  isNew,
  passkey,
  media,
  onMediaChange,
  onClose,
  onSave,
}: {
  operator: EditableOperator | null;
  isNew: boolean;
  passkey: string;
  media: OperatorMedia[];
  onMediaChange: (media: OperatorMedia[]) => void;
  onClose: () => void;
  onSave: (operator: EditableOperator) => Promise<void>;
}) {
  const [form, setForm] = useState<EditableOperator | null>(operator);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => setForm(operator ? { ...operator } : null), [operator]);

  return (
    <Dialog open={!!operator} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="h-[94vh] max-h-[900px] w-[calc(100vw-1.5rem)] max-w-5xl grid-rows-[auto_minmax(0,1fr)_auto] gap-0 border-line/50 p-0"
        style={{ backgroundColor: "rgb(var(--surface))" }}
      >
        <DialogHeader className="border-b border-line/25 px-6 py-5 pr-14 sm:px-8">
          <DialogTitle className="font-display text-3xl">
            {isNew ? "Add AI operator" : `Edit ${form?.name ?? "operator"}`}
          </DialogTitle>
          <DialogDescription className="text-muted">
            Manage catalog details, pricing, visibility, screenshots, and optional video.
          </DialogDescription>
        </DialogHeader>

        <div
          className="min-h-0 overflow-y-auto px-6 py-6 sm:px-8"
          style={{ backgroundColor: "rgb(var(--surface))" }}
        >
          {form && (
            <div className="space-y-6">
              <OperatorFormFields operator={form} onChange={setForm} />
              {isNew ? (
                <div className="rounded-lg border border-gold/25 bg-gold/5 p-4 text-sm text-muted">
                  Save the operator first, then reopen it to upload screenshots and video from your device.
                </div>
              ) : (
                <OperatorMediaAdmin
                  operatorId={form.id}
                  operatorName={form.name}
                  passkey={passkey}
                  media={media}
                  onChange={onMediaChange}
                />
              )}
            </div>
          )}
          {error && <p className="mt-4 text-sm text-crimson">{error}</p>}
        </div>

        <DialogFooter
          className="border-t border-line/25 px-6 py-4 sm:px-8"
          style={{ backgroundColor: "rgb(var(--surface))" }}
        >
          <button type="button" onClick={onClose} className="rounded-md border border-line px-4 py-2 text-sm">
            Cancel
          </button>
          <button
            type="button"
            disabled={saving || !form}
            onClick={async () => {
              if (!form) return;
              const next = { ...form, id: slugify(form.id || form.name), name: form.name.trim(), tagline: form.tagline.trim() };
              if (!next.id || !next.name || !next.tagline) {
                setError("Name, ID, and description are required.");
                return;
              }
              setSaving(true);
              setError("");
              try {
                await onSave(next);
              } catch (error) {
                setError(error instanceof Error ? error.message : "Unable to save operator");
              } finally {
                setSaving(false);
              }
            }}
            className="rounded-md bg-gold px-5 py-2 text-sm font-medium text-[#0b0b0b] disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save operator"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
