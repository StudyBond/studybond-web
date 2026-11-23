"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { useDashboardCriticalData } from "@/features/dashboard/hooks/use-dashboard-data";
import { apiClient } from "@/lib/api/client";
import { cn } from "@/lib/utils/cn";

import { errorText, Loading, Switch } from "./settings-ui";
import s from "./settings.module.css";

/** Admin controls (admins only): Study mode on or off for the board. */
export function AdminTab() {
  const queryClient = useQueryClient();
  const critical = useDashboardCriticalData();
  const institution = critical.stats.data?.institution;
  const [enabledOverride, setEnabledOverride] = useState<boolean | null>(null);
  const isEnabled = enabledOverride ?? Boolean(institution?.studyModeEnabled);

  const toggleMutation = useMutation({
    mutationFn: async (enabled: boolean) => {
      if (!institution?.id) throw new Error("No board found for your account.");
      return apiClient<{ success: boolean; message: string; studyModeEnabled: boolean }>("/api/admin/study-mode/toggle", {
        method: "POST",
        body: JSON.stringify({ institutionId: institution.id, enabled }),
      });
    },
    onSuccess: (_data, enabled) => {
      setEnabledOverride(enabled);
      toast.success(enabled ? `Study mode is on for ${institution?.name}` : `Study mode is off for ${institution?.name}`);
      void queryClient.invalidateQueries({ queryKey: ["dashboard", "stats"] });
    },
    onError: (error) => {
      toast.error("Couldn't change Study mode", { description: errorText(error, "Something went wrong.") });
    },
  });

  if (critical.stats.isLoading) return <Loading />;
  if (!institution) return <Loading text="No board found for your account." />;

  return (
    <>
      <p className={s.lead}>Only admins see this page. Changes reach students on {institution.name} straight away.</p>
      <div className={s.list}>
        <div className={cn(s.item, s.itemRow)}>
          <span className={s.itemT}>
            <b>Study mode</b>
            <small>
              {isEnabled
                ? `On. Students on ${institution.name} can open Study mode.`
                : `Off. Study mode is hidden from students on ${institution.name}.`}
            </small>
          </span>
          <Switch
            on={isEnabled}
            onChange={(on) => toggleMutation.mutate(on)}
            label="Study mode"
            disabled={toggleMutation.isPending}
          />
        </div>
      </div>
    </>
  );
}
