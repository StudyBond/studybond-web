import { SiteFooter, SiteNav } from "@/features/landing/site-chrome";
import "@/features/landing/landing.css";

/* Every public page shares the homepage's nav and footer. The nav sits in
   the page flow (not fixed), so pages need no top padding for it. */
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-[#09090b] text-white">
      <SiteNav />
      <div className="grow">{children}</div>
      <SiteFooter />
    </div>
  );
}
