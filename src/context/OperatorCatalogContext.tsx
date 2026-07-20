import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  listPublicOperators,
  listAllOperators,
  upsertOperator,
  deleteOperator as deleteOperatorFn,
  type AdminOperator,
} from "@/lib/operators.functions";
import { OPERATORS } from "@/lib/site-data";
import type { Operator } from "@/lib/types";

/**
 * Static catalog fallback. The live DB (Supabase) may have no seeded rows on a
 * given deploy; when the public query returns nothing we fall back to the
 * authored catalog so the marketplace never renders an empty grid. Admin
 * writes still go through Supabase when connected.
 */
// KAPWA is the product. Static fallback guarantees the grid is never empty
// even if the live Supabase operators table is missing/empty (see incident where
// operators "disappeared" because the public query returned no rows).
const STATIC_OPERATORS: AdminOperator[] = OPERATORS.map(
  (op: Operator): AdminOperator => ({ ...op, active: true, displayOrder: 0 }),
);

export type EditableOperator = AdminOperator;

type OperatorCatalogValue = {
  operators: EditableOperator[]; // admin view when passkey provided, else public list
  visibleOperators: EditableOperator[];
  loading: boolean;
  loadAdmin: (passkey: string) => Promise<void>;
  addOperator: (operator: EditableOperator, passkey: string) => Promise<void>;
  updateOperator: (id: string, operator: EditableOperator, passkey: string) => Promise<void>;
  deleteOperator: (id: string, passkey: string) => Promise<void>;
  refresh: () => Promise<void>;
};

const OperatorCatalogContext = createContext<OperatorCatalogValue | null>(null);

const PUBLIC_KEY = ["operators", "public"] as const;
const ADMIN_KEY = ["operators", "admin"] as const;

export function OperatorCatalogProvider({ children }: { children: ReactNode }) {
  const qc = useQueryClient();
  const listPublic = useServerFn(listPublicOperators);
  const listAdmin = useServerFn(listAllOperators);
  const upsertFn = useServerFn(upsertOperator);
  const deleteFn = useServerFn(deleteOperatorFn);

  const publicQuery = useQuery({
    queryKey: PUBLIC_KEY,
    queryFn: () => listPublic(),
    staleTime: 30_000,
    retry: 1,
  });

  const adminQuery = useQuery<EditableOperator[]>({
    queryKey: ADMIN_KEY,
    queryFn: () => Promise.resolve([]),
    enabled: false,
    initialData: [],
  });

  const value = useMemo<OperatorCatalogValue>(() => {
    // Merge strategy: live DB rows win by id, but any statically-authored
    // operators (e.g. newly added catalog entries not yet seeded to Supabase)
    // are still included so the marketplace surfaces them immediately.
    const dbRows = publicQuery.data ?? [];
    const dbIds = new Set(dbRows.map((r) => r.id));
    const staticExtras = STATIC_OPERATORS.filter((s) => !dbIds.has(s.id));
    const publicList = dbRows.length > 0 ? [...dbRows, ...staticExtras] : STATIC_OPERATORS;
    const adminList = adminQuery.data ?? [];
    const operators = adminList.length > 0 ? adminList : publicList;

    return {
      operators,
      visibleOperators: publicList,
      loading: publicQuery.isLoading,
      async loadAdmin(passkey: string) {
        const rows = await listAdmin({ data: { passkey } });
        qc.setQueryData(ADMIN_KEY, rows);
      },
      async addOperator(operator, passkey) {
        await upsertFn({ data: { passkey, operator } });
        await Promise.all([
          listAdmin({ data: { passkey } }).then((rows) => qc.setQueryData(ADMIN_KEY, rows)),
          qc.invalidateQueries({ queryKey: PUBLIC_KEY }),
        ]);
      },
      async updateOperator(_id, operator, passkey) {
        await upsertFn({ data: { passkey, operator } });
        await Promise.all([
          listAdmin({ data: { passkey } }).then((rows) => qc.setQueryData(ADMIN_KEY, rows)),
          qc.invalidateQueries({ queryKey: PUBLIC_KEY }),
        ]);
      },
      async deleteOperator(id, passkey) {
        await deleteFn({ data: { passkey, id } });
        await Promise.all([
          listAdmin({ data: { passkey } }).then((rows) => qc.setQueryData(ADMIN_KEY, rows)),
          qc.invalidateQueries({ queryKey: PUBLIC_KEY }),
        ]);
      },
      async refresh() {
        await qc.invalidateQueries({ queryKey: PUBLIC_KEY });
      },
    };
  }, [publicQuery.data, publicQuery.isLoading, adminQuery.data, qc, listAdmin, upsertFn, deleteFn]);

  return <OperatorCatalogContext.Provider value={value}>{children}</OperatorCatalogContext.Provider>;
}

export function useOperatorCatalog() {
  const value = useContext(OperatorCatalogContext);
  if (!value) throw new Error("useOperatorCatalog must be used inside OperatorCatalogProvider");
  return value;
}
