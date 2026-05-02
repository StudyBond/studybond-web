import { AuthPanel } from "@/features/auth/components/auth-panel";
import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";

export default function ResetPasswordPage() {
  return (
    <AuthPanel
      description="Verify the code from your email, then set a new password."
      eyebrow="Account recovery"
      title="Reset your password"
    >
      <ResetPasswordForm />
    </AuthPanel>
  );
}
