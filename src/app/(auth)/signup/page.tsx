import type { Metadata } from "next";
import { Suspense } from "react";
import { SignupForm } from "@/features/auth/components/signup-form";

export const metadata: Metadata = { title: "Create your free account" };

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  );
}
