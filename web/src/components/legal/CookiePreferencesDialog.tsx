import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { getConsent, setConsent, CURRENT_VERSION } from "@/lib/cookieConsent";
import type { ConsentState } from "@/lib/cookieConsent";

interface CookiePreferencesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: () => void;
}

export function CookiePreferencesDialog({
  open,
  onOpenChange,
  onSaved,
}: CookiePreferencesDialogProps) {
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    if (!open) return;
    const consent = getConsent();
    if (consent) {
      setAnalytics(consent.analytics);
      setMarketing(consent.marketing);
    }
  }, [open]);

  function save() {
    const state: ConsentState = {
      essential: true,
      analytics,
      marketing,
      decidedAt: new Date().toISOString(),
      version: CURRENT_VERSION,
    };
    setConsent(state);
    onOpenChange(false);
    onSaved?.();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>העדפות עוגיות</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col divide-y divide-border">
          <div className="flex items-start justify-between gap-4 py-4">
            <div className="flex-1">
              <p className="text-sm font-medium">עוגיות חיוניות</p>
              <p className="text-sm text-muted-foreground mt-0.5">
                נדרשות לפעולת המערכת (התחברות, אבטחה).
              </p>
            </div>
            <Switch
              checked={true}
              onCheckedChange={() => {}}
              disabled
              aria-label="עוגיות חיוניות — תמיד פעיל"
            />
          </div>

          <div className="flex items-start justify-between gap-4 py-4">
            <div className="flex-1">
              <p className="text-sm font-medium">ניתוח שימוש</p>
              <p className="text-sm text-muted-foreground mt-0.5">
                עוזר לנו להבין איך משתמשים באתר ולשפר אותו.
              </p>
            </div>
            <Switch
              checked={analytics}
              onCheckedChange={setAnalytics}
              aria-label="עוגיות ניתוח שימוש"
            />
          </div>

          <div className="flex items-start justify-between gap-4 py-4">
            <div className="flex-1">
              <p className="text-sm font-medium">שיווק</p>
              <p className="text-sm text-muted-foreground mt-0.5">
                מאפשר התאמה אישית של תוכן ופרסומות.
              </p>
            </div>
            <Switch
              checked={marketing}
              onCheckedChange={setMarketing}
              aria-label="עוגיות שיווק"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:space-x-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            ביטול
          </Button>
          <Button onClick={save}>שמור העדפות</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
