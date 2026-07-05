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
  });

  const adminQuery = useQuery<EditableOperator[]>({
    queryKey: ADMIN_KEY,
    queryFn: () => Promise.resolve([]),
    enabled: false,
    initialData: [],
  });

  const value = useMemo<OperatorCatalogValue>(() => {
    const publicList = publicQuery.data ?? [];
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
