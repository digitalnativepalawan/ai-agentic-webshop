import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { OPERATORS } from "@/lib/site-data";
import type { Operator } from "@/lib/types";

const STORAGE_KEY = "merqato.operator-catalog.v1";

type EditableOperator = Operator & { active?: boolean; displayOrder?: number };

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
  const [operators, setOperators] = useState<EditableOperator[]>(() => normalize(OPERATORS));

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) setOperators(normalize(JSON.parse(saved)));
    } catch {
      setOperators(normalize(OPERATORS));
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(operators));
    } catch {
      // Storage can be unavailable in private browsing; keep in-memory state working.
    }
  }, [operators]);

  const value = useMemo<OperatorCatalogValue>(() => ({
    operators,
    visibleOperators: operators.filter((operator) => operator.active !== false),
    addOperator: (operator) => setOperators((current) => normalize([...current, operator])),
    updateOperator: (id, operator) => setOperators((current) => normalize(current.map((item) => item.id === id ? operator : item))),
    deleteOperator: (id) => setOperators((current) => current.filter((item) => item.id !== id)),
    resetOperators: () => setOperators(normalize(OPERATORS)),
  }), [operators]);

  return <OperatorCatalogContext.Provider value={value}>{children}</OperatorCatalogContext.Provider>;
}

export function useOperatorCatalog() {
  const value = useContext(OperatorCatalogContext);
  if (!value) throw new Error("useOperatorCatalog must be used inside OperatorCatalogProvider");
  return value;
}
