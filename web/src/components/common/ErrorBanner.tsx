import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  error: unknown;
  className?: string;
}

function extractMessage(error: unknown): string {
  if (!error) return "אירעה שגיאה לא צפויה.";
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  // Axios error shape
  const e = error as { response?: { data?: { detail?: string } } };
  if (e.response?.data?.detail) return String(e.response.data.detail);
  return "אירעה שגיאה לא צפויה.";
}

export function ErrorBanner({ error, className }: Props) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive",
        className,
      )}
      role="alert"
    >
      <AlertCircle className="h-4 w-4 shrink-0" />
      <span>{extractMessage(error)}</span>
    </div>
  );
}
