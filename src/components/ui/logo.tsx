import Image from "next/image";
import { cn } from "@/lib/utils/cn";

export type LogoSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";

const sizeMap: Record<LogoSize, { container: string; image: number }> = {
  xs: { container: "h-8 w-8", image: 32 },
  sm: { container: "h-10 w-10", image: 40 },
  md: { container: "h-12 w-12", image: 48 },
  lg: { container: "h-14 w-14", image: 56 },
  xl: { container: "h-16 w-16", image: 64 },
  "2xl": { container: "h-20 w-20", image: 80 },
  "3xl": { container: "h-24 w-24", image: 96 },
};

const lockupSizeMap: Record<LogoSize, { h: number; w: number }> = {
  xs: { h: 40, w: 124 },
  sm: { h: 48, w: 140 },
  md: { h: 56, w: 160 },
  lg: { h: 96, w: 230 },
  xl: { h: 112, w: 268 },
  "2xl": { h: 136, w: 310 },
  "3xl": { h: 152, w: 350 },
};

interface LogoProps {
  size?: LogoSize;
  responsiveSize?: { mobile?: LogoSize; tablet?: LogoSize; desktop?: LogoSize };
  className?: string;
  priority?: boolean;
}

export function Logo({ 
  size = "md", 
  responsiveSize, 
  className, 
  priority = false 
}: LogoProps) {
  if (responsiveSize) {
    const mobileSize = responsiveSize.mobile || "md";
    const tabletSize = responsiveSize.tablet || responsiveSize.mobile || "lg";
    const desktopSize = responsiveSize.desktop || responsiveSize.tablet || "lg";
    
    return (
      <>
        <div className={cn("md:hidden flex items-center justify-center", sizeMap[mobileSize].container, className)}>
          <Image
            src="/studybond-logo.png"
            alt="StudyBond"
            width={sizeMap[mobileSize].image}
            height={sizeMap[mobileSize].image}
            priority={priority}
            className="h-full w-full object-contain"
          />
        </div>
        <div className={cn("hidden md:flex lg:hidden items-center justify-center", sizeMap[tabletSize].container, className)}>
          <Image
            src="/studybond-logo.png"
            alt="StudyBond"
            width={sizeMap[tabletSize].image}
            height={sizeMap[tabletSize].image}
            priority={priority}
            className="h-full w-full object-contain"
          />
        </div>
        <div className={cn("hidden lg:flex items-center justify-center", sizeMap[desktopSize].container, className)}>
          <Image
            src="/studybond-logo.png"
            alt="StudyBond"
            width={sizeMap[desktopSize].image}
            height={sizeMap[desktopSize].image}
            priority={priority}
            className="h-full w-full object-contain"
          />
        </div>
      </>
    );
  }

  const config = sizeMap[size];
  return (
    <div className={cn("flex items-center justify-center", config.container, className)}>
      <Image
        src="/studybond-logo.png"
        alt="StudyBond"
        width={config.image}
        height={config.image}
        priority={priority}
        className="h-full w-full object-contain"
      />
    </div>
  );
}

export function LogoLockup({
  size = "md",
  responsiveSize,
  className,
  priority = false
}: LogoProps) {
  if (responsiveSize) {
    const mobileSize = responsiveSize.mobile || "md";
    const tabletSize = responsiveSize.tablet || responsiveSize.mobile || "lg";
    const desktopSize = responsiveSize.desktop || responsiveSize.tablet || "lg";
    
    return (
      <>
        <div className={cn("md:hidden flex items-center", className)} style={{ height: lockupSizeMap[mobileSize].h, width: lockupSizeMap[mobileSize].w }}>
          <Image
            src="/studybond-lockup.png"
            alt="StudyBond"
            width={lockupSizeMap[mobileSize].w}
            height={lockupSizeMap[mobileSize].h}
            priority={priority}
            className="h-full w-full object-contain"
          />
        </div>
        <div className={cn("hidden md:flex lg:hidden items-center", className)} style={{ height: lockupSizeMap[tabletSize].h, width: lockupSizeMap[tabletSize].w }}>
          <Image
            src="/studybond-lockup.png"
            alt="StudyBond"
            width={lockupSizeMap[tabletSize].w}
            height={lockupSizeMap[tabletSize].h}
            priority={priority}
            className="h-full w-full object-contain"
          />
        </div>
        <div className={cn("hidden lg:flex items-center", className)} style={{ height: lockupSizeMap[desktopSize].h, width: lockupSizeMap[desktopSize].w }}>
          <Image
            src="/studybond-lockup.png"
            alt="StudyBond"
            width={lockupSizeMap[desktopSize].w}
            height={lockupSizeMap[desktopSize].h}
            priority={priority}
            className="h-full w-full object-contain"
          />
        </div>
      </>
    );
  }

  const config = lockupSizeMap[size];
  return (
    <div className={cn("flex items-center", className)} style={{ height: config.h, width: config.w }}>
      <Image
        src="/studybond-lockup.png"
        alt="StudyBond"
        width={config.w}
        height={config.h}
        priority={priority}
        className="h-full w-full object-contain"
      />
    </div>
  );
}
