import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { CookieBanner } from "@/components/legal/CookieBanner";
import { CookiePreferencesDialog } from "@/components/legal/CookiePreferencesDialog";
import { hasDecided } from "@/lib/cookieConsent";

const PUBLIC_NAV = [
  { to: "/businesses", label: "עסקים" },
  { to: "/how-it-works", label: "איך זה עובד" },
  { to: "/for-business", label: "לבעלי עסק" },
];

interface NavItemProps {
  to: string;
  label: string;
  onClick?: () => void;
}

function NavItem({ to, label, onClick }: NavItemProps) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          "text-sm font-medium transition-colors",
          isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground",
        )
      }
    >
      {label}
    </NavLink>
  );
}

export default function AppShell() {
  const { user, isAuthenticated, logout } = useAuth();
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeMobile = () => setMobileOpen(false);
  const [showCookieBanner, setShowCookieBanner] = useState(false);
  const [cookiePrefsOpen, setCookiePrefsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!hasDecided()) setShowCookieBanner(true);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <header
        className={cn(
          "sticky top-0 z-50 transition-all duration-200",
          scrolled
            ? "bg-white/90 backdrop-blur-md border-b border-border shadow-sm"
            : "bg-background/85 backdrop-blur-sm border-b border-transparent",
        )}
      >
        <div className="container relative flex h-16 items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-0.5 font-bold text-foreground shrink-0">
            <span className="text-primary text-xl font-extrabold">Q</span>
            <span className="text-xl">ueueLess</span>
          </Link>

          {/* Desktop center nav */}
          <nav className="hidden md:flex absolute inset-x-0 justify-center items-center gap-8 pointer-events-none">
            {PUBLIC_NAV.map((link) => (
              <span key={link.to} className="pointer-events-auto">
                <NavItem to={link.to} label={link.label} />
              </span>
            ))}
          </nav>

          {/* Desktop auth — always at end */}
          <div className="hidden md:flex items-center gap-3 ms-auto">
            {isAuthenticated && user ? (
              <>
                {user.role === "customer" && (
                  <NavItem to="/my/appointments" label="התורים שלי" />
                )}
                {user.role === "business_owner" && (
                  <NavItem to="/admin/businesses" label="ניהול" />
                )}
                <span className="text-sm text-muted-foreground">שלום, {user.full_name}</span>
                <Button variant="outline" size="sm" onClick={logout}>
                  התנתק
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/login">התחבר</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to="/register">הרשמה</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden ms-auto"
                aria-label="פתח תפריט"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64 flex flex-col gap-0 p-0">
              <div className="flex flex-col gap-1 p-6 flex-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                  ניווט
                </p>
                {PUBLIC_NAV.map((link) => (
                  <NavItem key={link.to} to={link.to} label={link.label} onClick={closeMobile} />
                ))}
                {isAuthenticated && user && (
                  <>
                    <div className="border-t border-border my-3" />
                    {user.role === "customer" && (
                      <NavItem to="/my/appointments" label="התורים שלי" onClick={closeMobile} />
                    )}
                    {user.role === "business_owner" && (
                      <NavItem to="/admin/businesses" label="ניהול" onClick={closeMobile} />
                    )}
                  </>
                )}
              </div>
              <div className="p-6 border-t border-border flex flex-col gap-2">
                {isAuthenticated && user ? (
                  <>
                    <p className="text-sm text-muted-foreground mb-1">שלום, {user.full_name}</p>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        logout();
                        closeMobile();
                      }}
                    >
                      התנתק
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" className="w-full" asChild>
                      <Link to="/login" onClick={closeMobile}>
                        התחבר
                      </Link>
                    </Button>
                    <Button className="w-full" asChild>
                      <Link to="/register" onClick={closeMobile}>
                        הרשמה
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* ── Page content ───────────────────────────────────────────── */}
      <main
        key={pathname}
        className="flex-1 container py-8 md:py-12 animate-in fade-in duration-200"
      >
        <Outlet />
      </main>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer className="border-t border-border bg-muted/40 mt-auto">
        <div className="container py-10 md:py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1 flex flex-col gap-3">
              <Link to="/" className="flex items-center gap-0.5 font-bold text-foreground w-fit">
                <span className="text-primary font-extrabold">Q</span>
                <span>ueueLess</span>
              </Link>
              <p className="text-sm text-muted-foreground leading-relaxed">
                מערכת תורים חכמה לעסקים קטנים ולקוחותיהם.
              </p>
            </div>

            {/* System links */}
            <div className="flex flex-col gap-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                המערכת
              </p>
              <div className="flex flex-col gap-2">
                <Link to="/businesses" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  חיפוש עסקים
                </Link>
                <Link to="/how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  איך זה עובד
                </Link>
                <Link to="/for-business" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  לבעלי עסק
                </Link>
              </div>
            </div>

            {/* Account links */}
            <div className="flex flex-col gap-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                חשבון
              </p>
              <div className="flex flex-col gap-2">
                <Link to="/register" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  הרשמה
                </Link>
                <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  התחברות
                </Link>
              </div>
            </div>

            {/* Legal */}
            <div className="flex flex-col gap-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                משפטי
              </p>
              <div className="flex flex-col gap-2">
                <Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  תנאי שימוש
                </Link>
                <Link to="/privacy-policy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  מדיניות פרטיות
                </Link>
                <button
                  type="button"
                  onClick={() => setCookiePrefsOpen(true)}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors text-start"
                >
                  ניהול עוגיות
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-6">
            <p className="text-xs text-muted-foreground text-center">
              © {new Date().getFullYear()} QueueLess. כל הזכויות שמורות.
            </p>
          </div>
        </div>
      </footer>

      {showCookieBanner && (
        <CookieBanner
          onOpenPreferences={() => {
            setCookiePrefsOpen(true);
            setShowCookieBanner(false);
          }}
          onDecided={() => setShowCookieBanner(false)}
        />
      )}
      <CookiePreferencesDialog
        open={cookiePrefsOpen}
        onOpenChange={setCookiePrefsOpen}
        onSaved={() => setShowCookieBanner(false)}
      />
    </div>
  );
}
