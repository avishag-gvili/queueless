import { useState } from "react";
import { useParams } from "react-router-dom";
import { useOwnerWorkingHours, useCreateWorkingHours, useDeleteWorkingHours } from "@/hooks/useWorkingHours";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ErrorBanner } from "@/components/common/ErrorBanner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { WorkingHours } from "@/types/api";

const DAY_NAMES = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];

function formatTime(t: string): string {
  return t.substring(0, 5);
}

interface DayRowProps {
  dayOfWeek: number;
  windows: WorkingHours[];
  businessId: string;
}

function DayRow({ dayOfWeek, windows, businessId }: DayRowProps) {
  const { mutateAsync: createWH, isPending: adding } = useCreateWorkingHours(businessId);
  const { mutateAsync: deleteWH } = useDeleteWorkingHours(businessId);
  const [openTime, setOpenTime] = useState("09:00");
  const [closeTime, setCloseTime] = useState("17:00");
  const [error, setError] = useState<string | null>(null);
  // pendingOpen tracks that the user toggled the day open but hasn't added a window yet
  const [pendingOpen, setPendingOpen] = useState(false);

  const dayWindows = windows.filter((w) => w.day_of_week === dayOfWeek);
  const isOpen = dayWindows.length > 0 || pendingOpen;

  const handleToggle = async () => {
    setError(null);
    if (isOpen) {
      for (const w of dayWindows) {
        await deleteWH(w.id);
      }
      setPendingOpen(false);
    } else {
      setPendingOpen(true);
    }
  };

  const handleAdd = async () => {
    setError(null);
    if (openTime >= closeTime) {
      setError("שעת סגירה חייבת להיות אחרי שעת פתיחה");
      return;
    }
    try {
      await createWH({ day_of_week: dayOfWeek, open_time: openTime, close_time: closeTime });
      // pendingOpen stays true until query refetches; once dayWindows.length > 0 it's irrelevant
    } catch (err) {
      const e = err as { response?: { data?: { detail?: string } } };
      setError(e.response?.data?.detail ?? "שגיאה בהוספה");
    }
  };

  return (
    <div className="flex flex-col gap-2 py-3 border-b border-border last:border-0">
      <div className="flex items-center gap-3 flex-wrap">
        <span className="w-16 text-sm font-medium shrink-0">{DAY_NAMES[dayOfWeek]}</span>

        <button
          type="button"
          onClick={handleToggle}
          className={cn(
            "text-xs px-2.5 py-0.5 rounded-full border transition-colors",
            isOpen
              ? "border-primary text-primary bg-primary/5 hover:bg-primary/10"
              : "border-border text-muted-foreground hover:border-primary hover:text-primary",
          )}
        >
          {isOpen ? "פתוח" : "סגור"}
        </button>

        {isOpen && dayWindows.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {dayWindows.map((w) => (
              <Badge key={w.id} variant="secondary" className="gap-1 text-xs">
                {formatTime(w.open_time)}–{formatTime(w.close_time)}
                <button
                  type="button"
                  onClick={() => deleteWH(w.id)}
                  className="hover:text-destructive transition-colors ms-0.5"
                  aria-label="הסר"
                >
                  ×
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {isOpen && (
        <div className="flex items-center gap-2 flex-wrap ps-[76px]">
          <Input
            type="time"
            value={openTime}
            onChange={(e) => setOpenTime(e.target.value)}
            className="w-28 text-sm"
            dir="ltr"
          />
          <span className="text-sm text-muted-foreground">עד</span>
          <Input
            type="time"
            value={closeTime}
            onChange={(e) => setCloseTime(e.target.value)}
            className="w-28 text-sm"
            dir="ltr"
          />
          <Button type="button" size="sm" variant="outline" onClick={handleAdd} disabled={adding}>
            <Plus className="h-4 w-4" />
            הוסף
          </Button>
          {error && <p className="text-xs text-destructive w-full">{error}</p>}
        </div>
      )}
    </div>
  );
}

export function WorkingHoursPage() {
  const { id: businessId } = useParams<{ id: string }>();
  const { data: workingHours, isLoading, error } = useOwnerWorkingHours(businessId);

  if (isLoading) return <LoadingSpinner fullPage />;
  if (error) return <ErrorBanner error={error} className="my-8" />;

  return (
    <div className="max-w-lg flex flex-col gap-4">
      <h1 className="text-2xl font-bold">שעות פעילות</h1>
      <p className="text-sm text-muted-foreground">
        לחץ על "סגור" כדי לפתוח יום, על "פתוח" כדי לסגור. ניתן להוסיף כמה חלונות ביום (למשל:
        9–12 ו-16–19).
      </p>

      <div className="rounded-lg border border-border bg-card px-4">
        {Array.from({ length: 7 }, (_, i) => (
          <DayRow
            key={i}
            dayOfWeek={i}
            windows={workingHours ?? []}
            businessId={businessId!}
          />
        ))}
      </div>
    </div>
  );
}
