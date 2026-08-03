import { createFileRoute } from "@tanstack/react-router";

import { SocialMediaAdminPage } from "@/components/admin/SocialMediaAdminPage";

export const Route = createFileRoute("/admin/social-media")({
  head: () => ({
    meta: [
      { title: "Social Media Operator — Merqato" },
      {
        name: "description",
        content: "Create, approve, schedule, and monitor social posts through Merqato and Postiz.",
      },
    ],
  }),
  component: SocialMediaAdminPage,
});
