import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { OPERATORS } from "@/lib/site-data";
import type { Operator } from "@/lib/types";

const STORAGE_KEY = "merqato.operator-catalog.v1";
type EditableOperator = Operator & { active?: boolean; displayOrder?: number };

const KAPWA: EditableOperator = {
  id: "kapwa-resort-backoffice",
  kind: "operator",
  name: "KAPWA",
  icon: "Sparkles",
  tagline: "An all-around AI back office for resorts — guest service, bookings, follow-up, reviews, marketing, reporting, and daily operations in one coordinated system.",
  category: "hospitality",
  badges: [
    { label: "All-around resort back office", tone: "gold" },
    { label: "Featured", tone: "gold" },
  ],
  price: { amount: 0, currency: "PHP", model: "custom_quote", suffix: "custom quote" },
  humanApprovalRequired: true,
  agentReadable: true,
  featured: true,
  topRated: true,
  deploymentScope: ["1 Resort", "Multi-channel", "Management dashboard", "Human approval workflows"],
  includedServices: [
    "Guest inquiries and concierge support",
    "Booking and availability assistance",
    "Lead and booking follow-up",
    "Review monitoring and reply drafting",
    "Social media planning and content support",
    "Operations reminders and task coordination",
    "Management summaries and performance reporting",
    "Human approval for sensitive actions",
  ],
  active: true,
  displayOrder: 0,
};

const DEFAULT_OPERATORS: EditableOperator[] = [
  KAPWA,
  ...OPERATORS.map((operator, index) => ({ ...operator, active: true, displayOrder: index + 1 })),
];

type OperatorCatalogValue = {
  operators: EditableOperator[];
  visibleOperators: EditableOperator[];
  addOperator: (operator: EditableOperator) => void;
  updateOperator: (id: string, operator: EditableOperator) => void;
  deleteOperator: (id: string) => void;
  resetOperators: () => void;
};

const OperatorCatalogContext = createContext<OperatorCatalogValue | null>(null);

function normalize(items: EditableOperator[]) {
  return items
    .map((item, index) => ({ active: true, displayOrder: index, ...item }))
    .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
}

export function OperatorCatalogProvider({ children }: { children: ReactNode }) {
  const [operators, setOperators] = useState<EditableOperator[]>(() => normalize(DEFAULT_OPERATORS));

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) setOperators(normalize(JSON.parse(saved)));
    } catch {
      setOperators(normalize(DEFAULT_OPERATORS));
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(operators));
    } catch {
      // Keep in-memory state working if browser storage is unavailable.
    }
  }, [operators]);

  const value = useMemo<OperatorCatalogValue>(() => ({
    operators,
    visibleOperators: operators.filter((operator) => operator.active !== false),
    addOperator: (operator) => setOperators((current) => normalize([...current, operator])),
    updateOperator: (id, operator) => setOperators((current) => normalize(current.map((item) => item.id === id ? operator : item))),
    deleteOperator: (id) => setOperators((current) => current.filter((item) => item.id !== id)),
    resetOperators: () => setOperators(normalize(DEFAULT_OPERATORS)),
  }), [operators]);

  return <OperatorCatalogContext.Provider value={value}>{children}</OperatorCatalogContext.Provider>;
}

export function useOperatorCatalog() {
  const value = useContext(OperatorCatalogContext);
  if (!value) throw new Error("useOperatorCatalog must be used inside OperatorCatalogProvider");
  return value;
}
