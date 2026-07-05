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
      <DialogContent className="max-h-[94vh] max-w-5xl overflow-y-auto border-line bg-bg text-ink">
        <DialogHeader>
          <DialogTitle className="font-display text-3xl">{isNew ? "Add AI operator" : `Edit ${form?.name ?? "operator"}`}</DialogTitle>
          <DialogDescription>Manage catalog details, pricing, visibility, screenshots, and optional video.</DialogDescription>
        </DialogHeader>

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

        {error && <p className="text-sm text-crimson">{error}</p>}
        <DialogFooter>
          <button type="button" onClick={onClose} className="rounded-md border border-line px-4 py-2 text-sm">Cancel</button>
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
