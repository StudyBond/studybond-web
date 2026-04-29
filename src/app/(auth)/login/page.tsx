import { AuthPanel } from "@/features/auth/components/auth-panel";
import { LoginForm } from "@/features/auth/components/login-form";

export default function LoginPage() {
  return (
    <AuthPanel
      description="Sign in to continue your exam preparation."
      eyebrow="Welcome back"
      title="Sign in to StudyBond"
    >
      <LoginForm />
    </AuthPanel>
  );
}
