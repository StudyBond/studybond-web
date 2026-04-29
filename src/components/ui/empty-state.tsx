import { Surface } from "@/components/ui/surface";

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <Surface className="flex flex-col items-center justify-center p-10 text-center">
      {icon ? (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.05] text-white/30">
          {icon}
        </div>
      ) : null}
      <h3 className="text-base font-semibold text-white/90">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-white/50">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </Surface>
  );
}
