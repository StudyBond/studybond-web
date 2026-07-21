import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Shield, Sparkles, Loader2, AlertCircle } from "lucide-react";
import { useDashboardCriticalData } from "@/features/dashboard/hooks/use-dashboard-data";
import { apiClient } from "@/lib/api/client";
import { cn } from "@/lib/utils/cn";

export function AdminTab() {
  const queryClient = useQueryClient();
  const critical = useDashboardCriticalData();
  const institution = critical.stats.data?.institution;

  const [isEnabled, setIsEnabled] = useState<boolean>(
    Boolean(institution?.studyModeEnabled)
  );

  const toggleMutation = useMutation({
    mutationFn: async (enabled: boolean) => {
      if (!institution?.id) {
        throw new Error("No active institution context found.");
      }
      return apiClient<{ success: boolean; message: string; studyModeEnabled: boolean }>(
        "/api/admin/study-mode/toggle",
        {
          method: "POST",
          body: JSON.stringify({
            institutionId: institution.id,
            enabled,
          }),
        }
      );
    },
    onSuccess: (data, variables) => {
      setIsEnabled(variables);
      toast.success(
        variables ? "Study Mode Enabled!" : "Study Mode Disabled!",
        {
          description: variables
            ? `Students at ${institution?.name || "your institution"} can now access interactive Study Mode.`
            : `Study Mode is now hidden from all students at ${institution?.name || "your institution"}.`,
        }
      );
      // Invalidate dashboard critical data so UI updates instantly
      queryClient.invalidateQueries({ queryKey: ["dashboard", "stats"] });
    },
    onError: (err: any) => {
      toast.error("Failed to update Study Mode toggle", {
        description: err?.message || "Something went wrong.",
      });
    },
  });

  if (!institution) {
    return (
      <div className="p-8 text-center text-white/40 text-sm">
        No active institution found for admin context.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6 space-y-2">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-sm uppercase tracking-wider font-mono">
          <Shield className="h-4 w-4" />
          Admin Platform Controls
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight">
          Feature Management — {institution.name} ({institution.code})
        </h2>
        <p className="text-sm text-white/50 leading-relaxed">
          As an administrator, you have full control over feature rollouts. Toggle features on or off instantly for students at your institution.
        </p>
      </div>

      {/* Feature Toggles Card */}
      <div className="rounded-2xl border border-white/[0.06] bg-[var(--sb-bg-surface-1)] p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.06]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-indigo-400" />
              <h3 className="font-bold text-white text-base">
                Interactive Study Mode
              </h3>
              {isEnabled ? (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Active / Visible
                </span>
              ) : (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-white/40 border border-white/10">
                  Hidden / Disabled
                </span>
              )}
            </div>
            <p className="text-xs text-white/40 max-w-md">
              When enabled, a Study Mode card appears on student dashboards allowing self-paced learning with instant answer reveals and explanations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {toggleMutation.isPending && (
              <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
            )}
            <button
              type="button"
              role="switch"
              aria-checked={isEnabled}
              disabled={toggleMutation.isPending}
              onClick={() => toggleMutation.mutate(!isEnabled)}
              className={cn(
                "relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none disabled:opacity-50",
                isEnabled ? "bg-indigo-600" : "bg-white/10 hover:bg-white/20"
              )}
            >
              <span
                className={cn(
                  "pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-300 ease-in-out",
                  isEnabled ? "translate-x-7" : "translate-x-0"
                )}
              />
            </button>
          </div>
        </div>

        {/* Informational Footer */}
        <div className="flex items-start gap-2.5 text-xs text-white/40">
          <AlertCircle className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
          <span>
            Changes take effect immediately across all student dashboards for <strong>{institution.name}</strong> without requiring a service restart.
          </span>
        </div>
      </div>
    </div>
  );
}
