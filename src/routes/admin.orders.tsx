import { createFileRoute } from "@tanstack/react-router";
import { OrdersAdminPage } from "@/components/admin/OrdersAdminPage";

export const Route = createFileRoute("/admin/orders")({
  head: () => ({ meta: [{ title: "Orders Admin — Merqato" }] }),
  component: OrdersAdminPage,
});
