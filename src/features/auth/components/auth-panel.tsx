import Link from "next/link";
import { Logo, LogoLockup } from "@/components/ui/logo";

export function AuthPanel({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex w-full max-w-[400px] flex-col justify-center">
      {/* Logo */}
      <Link href="/" className="mb-10 block transition-opacity hover:opacity-80">
        <LogoLockup responsiveSize={{ mobile: "lg", tablet: "xl", desktop: "2xl" }} />
      </Link>

      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#e09040]">
          {eyebrow}
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white">
          {title}
        </h1>
        <p className="mt-2 text-sm text-white/50 leading-relaxed">
          {description}
        </p>
      </div>

      <div className="w-full">{children}</div>
    </div>
  );
}
