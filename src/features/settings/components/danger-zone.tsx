"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import { useDeleteAccount } from "@/features/settings/hooks/use-settings";
import { AlertTriangle, Trash2, Loader2, Eye, EyeOff, X } from "lucide-react";
import { useRouter } from "next/navigation";

export function DangerZone() {
  const router = useRouter();
  const deleteAccount = useDeleteAccount();
  const [showModal, setShowModal] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  async function handleDelete() {
    if (!password) return;
    try {
      await deleteAccount.mutateAsync(password);
      router.push("/");
    } catch {
      // handled via mutation error state
    }
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-400/10 text-red-400">
            <AlertTriangle className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-red-400/80">Danger Zone</h3>
            <p className="text-[10px] text-white/25">Irreversible actions that affect your account</p>
          </div>
        </div>

        <div className="rounded-2xl border border-red-400/10 bg-red-400/[0.02] p-5">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <h4 className="text-sm font-bold text-white/70">Delete Account</h4>
              <p className="text-xs text-white/30 mt-1 leading-relaxed">
                Permanently delete your account and all associated data. This includes exam history, bookmarks, achievements, and subscription. This action cannot be undone.
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl border border-red-400/20 bg-red-400/[0.05] text-xs font-bold text-red-400/70 transition-all hover:bg-red-400/[0.10] hover:text-red-400 hover:border-red-400/30"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-lg animate-in fade-in duration-200"
            onClick={() => setShowModal(false)}
          />
          <div className="relative z-10 w-full max-w-[calc(100vw-2rem)] sm:max-w-md rounded-2xl border border-red-400/15 bg-[var(--sb-bg-elevated)] p-6 shadow-2xl animate-in zoom-in-95 fade-in duration-200">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-white/20 hover:text-white/50 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex flex-col items-center text-center mb-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-400/10 text-red-400 mb-4">
                <AlertTriangle className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-bold text-white">Delete Your Account?</h3>
              <p className="text-xs text-white/30 mt-2 max-w-xs leading-relaxed">
                This will permanently erase everything — your exams, progress, bookmarks, and subscription. There is no way to undo this.
              </p>
            </div>

            {/* Password confirmation */}
            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/30 block">
                Enter your password to confirm
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your current password"
                  className="w-full rounded-xl border border-red-400/15 bg-red-400/[0.03] px-4 py-3 pr-12 text-sm text-white placeholder:text-white/15 outline-none transition-all focus:border-red-400/30 focus:ring-1 focus:ring-red-400/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/15 hover:text-white/40 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {deleteAccount.isError && (
                <p className="text-xs text-red-400/80">
                  {deleteAccount.error instanceof Error ? deleteAccount.error.message : "Deletion failed."}
                </p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white/50 bg-white/[0.04] hover:bg-white/[0.08] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={!password || deleteAccount.isPending}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-red-500 to-red-600 shadow-lg hover:shadow-red-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {deleteAccount.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete Forever
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
