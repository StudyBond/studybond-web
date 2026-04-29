import Link from "next/link";
import { cn } from "@/lib/utils/cn";

type ButtonBaseProps = {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
};

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  ButtonBaseProps & {
    asChild?: false;
  };

type ButtonLinkProps = React.ComponentProps<typeof Link> &
  ButtonBaseProps & {
    asChild: true;
  };

const sizeStyles = {
  sm: "h-8 px-3 text-xs gap-1.5 rounded-lg",
  md: "h-10 px-5 text-sm gap-2 rounded-xl",
  lg: "h-12 px-7 text-base gap-2.5 rounded-xl",
  icon: "h-10 w-10 rounded-xl",
};

const variantStyles = {
  primary:
    "bg-[#e09040] text-[#0a0a0a] font-semibold shadow-[0_4px_24px_rgba(224,144,64,0.15)] hover:bg-[#e8a058] hover:shadow-[0_6px_28px_rgba(224,144,64,0.25)] active:scale-[0.98]",
  secondary:
    "bg-white/[0.05] text-white/80 border border-white/[0.08] hover:bg-white/[0.08] hover:border-white/[0.12] active:scale-[0.98]",
  ghost:
    "bg-transparent text-white/50 hover:text-white/80 hover:bg-white/[0.05] active:scale-[0.98]",
  danger:
    "bg-red-400/10 text-red-400 border border-red-400/15 hover:bg-red-400/15 active:scale-[0.98]",
};

const baseStyles =
  "inline-flex items-center justify-center font-medium transition-all duration-200 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e09040] disabled:pointer-events-none disabled:opacity-40 select-none whitespace-nowrap cursor-pointer";

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}

export function Button(props: ButtonProps | ButtonLinkProps) {
  const variant = props.variant ?? "primary";
  const size = props.size ?? "md";
  const isLoading = props.isLoading ?? false;
  const className = cn(baseStyles, sizeStyles[size], variantStyles[variant], props.className);

  if (props.asChild) {
    const {
      asChild: _asChild,
      variant: _variant,
      size: _size,
      isLoading: _isLoading,
      className: _className,
      ...linkProps
    } = props;
    void _asChild; void _variant; void _size; void _isLoading; void _className;
    return <Link className={className} {...linkProps} />;
  }

  const {
    variant: _variant,
    asChild: _asChild,
    size: _size,
    isLoading: _isLoading,
    className: _className,
    children,
    disabled,
    ...buttonProps
  } = props;
  void _variant; void _asChild; void _size; void _isLoading; void _className;

  return (
    <button className={className} disabled={disabled || isLoading} {...buttonProps}>
      {isLoading ? <Spinner /> : null}
      {children}
    </button>
  );
}
