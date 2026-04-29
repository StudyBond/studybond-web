import { AuthPanel } from "@/features/auth/components/auth-panel";
import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <AuthPanel
      description="Enter your email and we'll send you a code to reset your password."
      eyebrow="Password reset"
      title="Forgot your password?"
    >
      <ForgotPasswordForm />
    </AuthPanel>
  );
}
