import { AuthPanel } from "@/features/auth/components/auth-panel";
import { SignupForm } from "@/features/auth/components/signup-form";

export default function SignupPage() {
  return (
    <AuthPanel
      description="Create your free account and start practicing today."
      eyebrow="Get started"
      title="Create your account"
    >
      <SignupForm />
    </AuthPanel>
  );
}
