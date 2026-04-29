import { AuthPanel } from "@/features/auth/components/auth-panel";
import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";

export default function ResetPasswordPage() {
  return (
    <AuthPanel
      description="Use the code from your email and choose a new password."
      eyebrow="New password"
      title="Reset your password"
    >
      <ResetPasswordForm />
    </AuthPanel>
  );
}
