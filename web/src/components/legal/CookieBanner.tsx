import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { setConsent, CURRENT_VERSION } from "@/lib/cookieConsent";
import type { ConsentState } from "@/lib/cookieConsent";

interface CookieBannerProps {
  onOpenPreferences: () => void;
  onDecided: () => void;
}

export function CookieBanner({ onOpenPreferences, onDecided }: CookieBannerProps) {
  function acceptAll() {
    const state: ConsentState = {
      essential: true,
      analytics: true,
      marketing: true,
      decidedAt: new Date().toISOString(),
      version: CURRENT_VERSION,
    };
    setConsent(state);
    onDecided();
  }

  function rejectNonEssential() {
    const state: ConsentState = {
      essential: true,
      analytics: false,
      marketing: false,
      decidedAt: new Date().toISOString(),
      version: CURRENT_VERSION,
    };
    setConsent(state);
    onDecided();
  }

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 flex justify-center p-4 animate-in slide-in-from-bottom-2 duration-400">
      <div className="gradient-border-top w-full max-w-2xl rounded-lg border border-border bg-card shadow-lg">
        <div className="p-4 md:p-5">
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            אנחנו משתמשים בעוגיות לשיפור החוויה ולניתוח שימוש. עוגיות חיוניות תמיד פעילות.{" "}
            <Link to="/privacy-policy" className="text-primary underline underline-offset-2 hover:no-underline">
              קרא עוד
            </Link>
          </p>
          <div className="flex flex-wrap gap-2 justify-end">
            <Button variant="ghost" size="sm" onClick={rejectNonEssential}>
              דחה לא-חיוניות
            </Button>
            <Button variant="outline" size="sm" onClick={onOpenPreferences}>
              התאם הגדרות
            </Button>
            <Button size="sm" onClick={acceptAll}>
              אשר את הכל
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
