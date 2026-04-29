import { AuthPanel } from "@/features/auth/components/auth-panel";
import { VerifyOtpForm } from "@/features/auth/components/verify-otp-form";

export default function VerifyOtpPage() {
  return (
    <AuthPanel
      description="Enter the 6-digit code sent to your email address."
      eyebrow="Verification"
      title="Verify your email"
    >
      <VerifyOtpForm />
    </AuthPanel>
  );
}
