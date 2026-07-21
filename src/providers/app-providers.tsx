"use client";

import { ApiError } from "@/lib/api/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "sonner";
import { useState } from "react";
import { OfflineSyncProvider } from "@/providers/offline-sync-provider";
import { OfflineBanner } from "@/components/ui/offline-banner";

export function AppProviders({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: (failureCount, error) => {
              if (error instanceof ApiError) {
                // Never retry auth errors or rate-limit (429) errors.
                // Retrying 429s doubles load on a saturated backend.
                if (
                  error.kind === "auth" ||
                  error.kind === "rate_limit" ||
                  error.status === 429
                ) {
                  return false;
                }
              }

              return failureCount < 1;
            },
            staleTime: 30_000,
          },
          mutations: {
            retry: 0,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <OfflineSyncProvider>
        {children}
        <OfflineBanner />
      </OfflineSyncProvider>
      <Toaster
        position="top-right"
        theme="dark"
        toastOptions={{
          style: {
            background: "var(--sb-bg-elevated)",
            border: "1px solid var(--sb-border)",
            color: "var(--sb-text)",
            fontSize: "0.875rem",
          },
        }}
      />
      {process.env.NODE_ENV === "development" ? (
        <ReactQueryDevtools initialIsOpen={false} />
      ) : null}
    </QueryClientProvider>
  );
}
