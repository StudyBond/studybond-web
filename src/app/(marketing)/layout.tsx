import { MarketingNavbar } from "@/components/marketing/marketing-navbar";
import { MarketingFooter } from "@/components/marketing/marketing-footer";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-[#09090b] text-white">
      {/* Shared Navigation */}
      <MarketingNavbar />

      {/* Main Content Area */}
      <div className="flex-grow pt-24 md:pt-28">
        {children}
      </div>

      {/* Shared Footer */}
      <MarketingFooter />
    </div>
  );
}
