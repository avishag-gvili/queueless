import { cn } from "@/lib/utils";

interface Props {
  fullPage?: boolean;
  className?: string;
}

export function LoadingSpinner({ fullPage, className }: Props) {
  const spinner = (
    <div
      className={cn(
        "animate-spin rounded-full border-2 border-muted border-t-primary h-8 w-8",
        className,
      )}
      role="status"
      aria-label="טוען..."
    />
  );

  if (fullPage) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        {spinner}
      </div>
    );
  }

  return spinner;
}
