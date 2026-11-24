import type { Metadata } from "next";
import { caveat } from "@/features/home/home-fonts";
import "@/features/auth/auth.css";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

/* Each auth page draws its own frame (features/auth/components/auth-frame),
   because the sign-up panel shows the student's own slip. */
export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <main className={`au ${caveat.variable}`}>{children}</main>;
}
