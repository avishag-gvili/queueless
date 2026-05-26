import { cn } from "@/lib/utils";

interface Props {
  message: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ message, description, icon, action, className }: Props) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-dashed border-border p-12 text-center gap-3",
        "animate-in fade-in zoom-in-95 duration-300",
        className,
      )}
    >
      {icon && (
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-soft text-primary shadow-md">
          {icon}
        </div>
      )}
      <div>
        <p className="font-medium text-foreground">{message}</p>
        {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
      </div>
      {action}
    </div>
  );
}
