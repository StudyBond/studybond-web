import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXTwitter, faInstagram, faLinkedin, faTiktok } from "@fortawesome/free-brands-svg-icons";
import { footerLinks, socialLinks } from "@/app/(marketing)/constants";
import { LogoLockup } from "@/components/ui/logo";
import { ArrowRight } from "lucide-react";

const socialIconMap: Record<string, typeof faXTwitter> = {
  x: faXTwitter,
  instagram: faInstagram,
  linkedin: faLinkedin,
  tiktok: faTiktok,
};

export function MarketingFooter() {
  // Map internal learn links properly to support SEO flow
  const mappedFooterLinks = {
    ...footerLinks,
    learn: [
      { label: "Blog", href: "/blog" },
      { label: "UI Post-UTME Past Questions", href: "/ui-post-utme" },
      { label: "Cut-Off Marks Guide", href: "/blog/ui-post-utme-cut-off-mark" },
      { label: "FAQ", href: "/ui-post-utme#faq" },
    ],
  };

  return (
    <footer className="relative overflow-hidden border-t border-white/[0.06] bg-gradient-to-b from-[#09090b] via-[#241300] to-[#000000]">
      {/* Background elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-96 -top-96 h-[800px] w-[800px] rounded-full bg-[#e09040]/3 blur-[150px]" />
        <div className="absolute -right-96 -bottom-96 h-[800px] w-[800px] rounded-full bg-[#c06830]/2 blur-[150px]" />
      </div>

      <div className="relative z-10">
        {/* Top section - Newsletter */}
        <div className="border-b border-white/[0.06]">
          <div className="mx-auto max-w-6xl px-5 py-6 md:py-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex-1">
                <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
                  Stay in the loop.
                </h3>
                <p className="mt-2 text-sm text-white/40">
                  Get tips, exam insights, and platform updates straight to your inbox.
                </p>
              </div>
              <div className="w-full md:w-auto">
                <form className="flex flex-col sm:flex-row gap-2 sm:bg-white/5 sm:rounded-xl sm:p-1 sm:border border-white/10 hover:border-white/20 transition-colors">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 w-full md:min-w-64 bg-white/5 sm:bg-transparent border border-white/10 sm:border-none rounded-xl sm:rounded-none px-4 py-3 sm:py-2.5 text-sm text-white placeholder-white/30 outline-none min-w-0"
                  />
                  <button
                    type="submit"
                    className="flex items-center justify-center gap-2 px-5 py-3 sm:py-2.5 bg-[#e09040] hover:bg-[#e09040]/90 text-[#09090b] font-semibold rounded-xl sm:rounded-lg transition-colors text-sm whitespace-nowrap w-full sm:w-auto shrink-0"
                  >
                    Subscribe <ArrowRight className="h-4 w-4" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Main footer content */}
        <div className="mx-auto max-w-6xl px-5 py-8 md:py-10">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-5">
            {/* Brand column */}
            <div className="md:col-span-1">
              <div className="mb-6">
                <LogoLockup responsiveSize={{ mobile: "sm", tablet: "md", desktop: "lg" }} />
              </div>
              <p className="text-sm text-white/40 mb-6 leading-relaxed">
                The platform for serious Post-UTME exam prep. Practice smart, ace your exam.
              </p>
              <div className="flex items-center gap-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    title={social.name}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/50 hover:bg-white/10 hover:text-[#e09040] hover:border-[#e09040]/30 transition-all"
                  >
                    <FontAwesomeIcon icon={socialIconMap[social.key]} className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* Product column */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-white/80 mb-5">Product</h4>
              <ul className="space-y-3">
                {mappedFooterLinks.product.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-white/50 hover:text-[#e09040] transition-colors duration-200 hover:translate-x-0.5 inline-block"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Learn column */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-white/80 mb-5">Learn</h4>
              <ul className="space-y-3">
                {mappedFooterLinks.learn.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-white/50 hover:text-[#e09040] transition-colors duration-200 hover:translate-x-0.5 inline-block"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company column */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-white/80 mb-5">Company</h4>
              <ul className="space-y-3">
                {mappedFooterLinks.company.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-white/50 hover:text-[#e09040] transition-colors duration-200 hover:translate-x-0.5 inline-block"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal column */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-white/80 mb-5">Legal</h4>
              <ul className="space-y-3">
                {mappedFooterLinks.legal.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-white/50 hover:text-[#e09040] transition-colors duration-200 hover:translate-x-0.5 inline-block"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/[0.06] bg-white/[0.01]">
          <div className="mx-auto max-w-6xl px-5 py-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-xs text-white/25">
                &copy; {new Date().getFullYear()} StudyBond. Built for serious students. All rights reserved.
              </p>
              <div className="flex items-center gap-4 text-xs text-white/20">
                <span>Made with 🔥 in Nigeria</span>
                <div className="h-3 w-px bg-white/10" />
                <a href="#" className="text-white/25 hover:text-[#e09040] transition-colors">
                  Status page
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
