import type { EditableOperator } from "@/context/OperatorCatalogContext";
import type { OperatorCategory, PriceModel } from "@/lib/types";

const categories: OperatorCategory[] = ["hospitality", "booking", "marketing", "lead-gen", "operations", "mission-control", "local-business"];
const priceModels: PriceModel[] = ["monthly_subscription", "one_time_setup", "per_day", "per_week", "per_stay", "per_month", "custom_quote"];
const splitLines = (value: string) => value.split("\n").map((item) => item.trim()).filter(Boolean);

export function OperatorFormFields({ operator, onChange }: { operator: EditableOperator; onChange: (operator: EditableOperator) => void }) {
  const set = (patch: Partial<EditableOperator>) => onChange({ ...operator, ...patch });
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <label className="text-sm">Name<input className="input mt-1 w-full" value={operator.name} onChange={(e) => set({ name: e.target.value })} /></label>
      <label className="text-sm">ID / slug<input className="input mt-1 w-full" value={operator.id} onChange={(e) => set({ id: e.target.value })} /></label>
      <label className="text-sm md:col-span-2">Description<textarea className="input mt-1 min-h-24 w-full" value={operator.tagline} onChange={(e) => set({ tagline: e.target.value })} /></label>
      <label className="text-sm">Category<select className="input mt-1 w-full" value={operator.category} onChange={(e) => set({ category: e.target.value as OperatorCategory })}>{categories.map((category) => <option key={category}>{category}</option>)}</select></label>
      <label className="text-sm">Type<select className="input mt-1 w-full" value={operator.kind} onChange={(e) => set({ kind: e.target.value as EditableOperator["kind"] })}><option value="operator">Operator</option><option value="setup">Setup</option></select></label>
      <label className="text-sm">Icon name<input className="input mt-1 w-full" value={operator.icon} onChange={(e) => set({ icon: e.target.value })} /></label>
      <label className="text-sm">Display order<input className="input mt-1 w-full" type="number" min="0" value={operator.displayOrder} onChange={(e) => set({ displayOrder: Number(e.target.value) })} /></label>
      <label className="text-sm">Price (PHP)<input className="input mt-1 w-full" type="number" min="0" value={operator.price.amount} onChange={(e) => set({ price: { ...operator.price, amount: Number(e.target.value) } })} /></label>
      <label className="text-sm">Price model<select className="input mt-1 w-full" value={operator.price.model} onChange={(e) => set({ price: { ...operator.price, model: e.target.value as PriceModel } })}>{priceModels.map((model) => <option key={model} value={model}>{model.replaceAll("_", " ")}</option>)}</select></label>
      <label className="text-sm">Price suffix<input className="input mt-1 w-full" value={operator.price.suffix} onChange={(e) => set({ price: { ...operator.price, suffix: e.target.value } })} /></label>
      <label className="text-sm">Price note<input className="input mt-1 w-full" value={operator.price.note ?? ""} onChange={(e) => set({ price: { ...operator.price, note: e.target.value || undefined } })} /></label>
      <label className="text-sm md:col-span-2">Badges — one per line: Label | gold/crimson/neutral<textarea className="input mt-1 min-h-24 w-full" value={operator.badges.map((badge) => `${badge.label} | ${badge.tone}`).join("\n")} onChange={(e) => set({ badges: splitLines(e.target.value).map((line) => { const [label, rawTone] = line.split("|").map((part) => part.trim()); return { label, tone: rawTone === "crimson" || rawTone === "neutral" ? rawTone : "gold" }; }) })} /></label>
      <label className="text-sm md:col-span-2">Included services — one per line<textarea className="input mt-1 min-h-32 w-full" value={operator.includedServices.join("\n")} onChange={(e) => set({ includedServices: splitLines(e.target.value) })} /></label>
      <label className="text-sm md:col-span-2">Deployment scope — one per line<textarea className="input mt-1 min-h-24 w-full" value={operator.deploymentScope.join("\n")} onChange={(e) => set({ deploymentScope: splitLines(e.target.value) })} /></label>
      <div className="md:col-span-2 grid gap-3 rounded-lg border border-line/30 p-4 sm:grid-cols-2 lg:grid-cols-5">
        {([ ["active", "Visible"], ["featured", "Featured"], ["topRated", "Top rated"], ["agentReadable", "AI-readable"], ["humanApprovalRequired", "Human approval"] ] as const).map(([key, label]) => <label key={key} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!operator[key]} onChange={(e) => set({ [key]: e.target.checked })} />{label}</label>)}
      </div>
    </div>
  );
}
