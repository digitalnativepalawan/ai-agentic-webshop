import { createFileRoute } from "@tanstack/react-router";
import { OperatorAdminPage } from "@/components/admin/OperatorAdminPage";

export const Route = createFileRoute("/admin/operators")({
  head: () => ({ meta: [{ title: "Operator Admin — Merqato" }] }),
  component: OperatorAdminPage,
});
