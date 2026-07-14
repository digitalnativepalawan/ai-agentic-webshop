// Server-only: list Mission Control tasks for the operator dashboard.
import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { Database } from "@/integrations/supabase/types";

export const getMissionControlTasks = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin
    .from("mission_control_tasks")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) return [];
  return (data ?? []) as Database["public"]["Tables"]["mission_control_tasks"]["Row"][];
});
