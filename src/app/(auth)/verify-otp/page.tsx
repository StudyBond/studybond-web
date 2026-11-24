import type { Metadata } from "next";
import { Suspense } from "react";
import { VerifyOtpForm } from "@/features/auth/components/verify-otp-form";

export const metadata: Metadata = { title: "Enter your code" };

export default function VerifyOtpPage() {
  return (
    <Suspense>
      <VerifyOtpForm />
    </Suspense>
  );
}
