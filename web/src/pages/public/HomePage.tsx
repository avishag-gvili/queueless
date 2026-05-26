import { Link } from "react-router-dom";
import { Search, Calendar, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StepCardProps {
  number: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  iconBg?: string;
  iconColor?: string;
}

function StepCard({ number, icon, title, description, iconBg = "bg-primary-soft", iconColor = "text-primary" }: StepCardProps) {
  return (
    <div className="flex flex-col items-center text-center gap-4 p-6">
      <div className={`flex h-12 w-12 items-center justify-center rounded-full ${iconBg} ${iconColor}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
          שלב {number}
        </p>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

export function HomePage() {
  return (
    <div className="flex flex-col">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative py-16 md:py-24 text-center rounded-2xl bg-gradient-to-b from-accent-warm-soft/40 to-transparent overflow-hidden">
        {/* Decorative amber blob — top center */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-12 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-accent-warm/60 blur-3xl"
        />
        {/* Decorative teal blob — bottom opposite side */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-16 -start-16 w-64 h-64 rounded-full bg-primary/40 blur-3xl"
        />
        <div className="relative max-w-2xl mx-auto">
          <h1 className="mb-5 animate-in fade-in slide-in-from-bottom-4 duration-700">
            ניהול תורים פשוט וחכם
          </h1>
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            מצא עסקים, הזמן תורים בקלות וקבל אישור מיידי — בלי טלפונים ובלי המתנה.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
            <Button
              asChild
              size="lg"
              className="px-8 shadow-[0_4px_14px_-2px_hsl(180_65%_32%/0.35)]"
            >
              <Link to="/businesses">גלה עסקים</Link>
            </Button>
            <Button variant="outline" asChild size="lg" className="px-8">
              <Link to="/for-business">אני בעל עסק</Link>
            </Button>
          </div>
        </div>
      </section>

      <div aria-hidden="true" className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      {/* ── How it works ──────────────────────────────────────*/}
      <section className="py-12 md:py-16">
        <div className="text-center mb-10">
          <h2 className="mb-2">איך זה עובד?</h2>
          <p className="text-muted-foreground">שלושה צעדים פשוטים</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 max-w-3xl mx-auto divide-y md:divide-y-0 md:divide-x md:divide-x-reverse divide-border">
          <StepCard
            number="1"
            icon={<Search className="h-5 w-5" />}
            title="חפש עסק"
            description="חפש לפי שם, תחום, או קטגוריה וגלה עסקים ליד הבית."
            iconBg="bg-primary-soft"
            iconColor="text-primary"
          />
          <StepCard
            number="2"
            icon={<Calendar className="h-5 w-5" />}
            title="בחר זמן"
            description="בחר שירות, תאריך ושעה שמתאימים לך מרשימת הזמנות הפנויים."
            iconBg="bg-amber-100"
            iconColor="text-amber-600"
          />
          <StepCard
            number="3"
            icon={<CheckCircle className="h-5 w-5" />}
            title="קבל אישור"
            description="קבל אישור מיידי — התור שלך מובטח, ללא טלפונים."
            iconBg="bg-emerald-100"
            iconColor="text-emerald-600"
          />
        </div>
      </section>

      <div aria-hidden="true" className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      {/* ── Business owner CTA ───────────────────────────────── */}
      <section className="py-12 md:py-16">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="mb-3">מנהלים עסק?</h2>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            הפסיקו לאבד לקוחות על שיחות טלפון. הגדירו שירותים ושעות פעילות, וקבלו הזמנות
            אוטומטית.
          </p>
          <Button asChild size="lg" className="px-8">
            <Link to="/for-business">קרא עוד</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
