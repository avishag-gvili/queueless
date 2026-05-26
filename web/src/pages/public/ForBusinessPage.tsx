import { Link } from "react-router-dom";
import { PhoneOff, UserCheck, Clock, CalendarDays, Scissors, Settings, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BenefitCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  iconBg?: string;
  iconColor?: string;
}

function BenefitCard({ icon, title, description, iconBg = "bg-primary-soft", iconColor = "text-primary" }: BenefitCardProps) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-6">
      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconBg} ${iconColor}`}>
        {icon}
      </div>
      <div>
        <h3 className="font-semibold mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

interface FeatureRowProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureRow({ icon, title, description }: FeatureRowProps) {
  return (
    <div className="flex gap-4 py-4 border-b border-border last:border-0">
      <div className="text-primary shrink-0 mt-0.5">{icon}</div>
      <div>
        <p className="font-medium text-sm">{title}</p>
        <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
      </div>
    </div>
  );
}

export function ForBusinessPage() {
  return (
    <div className="flex flex-col gap-16">
      {/* Hero */}
      <section className="text-center py-8 md:py-12 rounded-2xl bg-gradient-to-b from-accent-warm-soft/40 to-transparent">
        <div className="max-w-2xl mx-auto">
          <h1 className="mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            נהל את התורים שלך בלי להרים את הטלפון
          </h1>
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            QueueLess נותנת לבעלי עסקים כלי ניהול תורים פשוט ויעיל. הלקוחות מזמינים בעצמם,
            אתה מתמקד בעבודה.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
            <Button
              asChild
              size="lg"
              className="px-8 shadow-[0_4px_14px_-2px_hsl(180_65%_32%/0.35)]"
            >
              <Link to="/register">הירשם בחינם</Link>
            </Button>
            <Button variant="outline" asChild size="lg" className="px-8">
              <Link to="/how-it-works">איך זה עובד</Link>
            </Button>
          </div>
        </div>
      </section>

      <div aria-hidden="true" className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      {/* Benefits */}
      <section className="flex flex-col gap-6">
        <div className="text-center">
          <h2 className="mb-2">למה QueueLess?</h2>
          <p className="text-muted-foreground">שלושה יתרונות שיחסכו לך זמן וכסף</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <BenefitCard
            icon={<PhoneOff className="h-5 w-5" />}
            title="פחות שיחות"
            description="הלקוחות מזמינים תורים בעצמם בלי לצלצל. אתה פנוי לעבוד במקום לענות לטלפון."
            iconBg="bg-primary-soft"
            iconColor="text-primary"
          />
          <BenefitCard
            icon={<UserCheck className="h-5 w-5" />}
            title="פחות no-shows"
            description="כל הזמנה מאושרת ומוקלטת. הלקוח יודע שיש לו תור — הסיכוי שיפספס יורד משמעותית."
            iconBg="bg-accent-warm-soft"
            iconColor="text-accent-warm"
          />
          <BenefitCard
            icon={<Clock className="h-5 w-5" />}
            title="יותר זמן לעסק שלך"
            description="פחות ניהול ידני, יותר זמן לשירות. לוח הבקרה מציג את כל התורים של היום במבט אחד."
            iconBg="bg-primary-soft"
            iconColor="text-primary"
          />
        </div>
      </section>

      <div aria-hidden="true" className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      {/* Features */}
      <section className="flex flex-col gap-6">
        <div>
          <h2 className="mb-2">מה תקבל</h2>
          <p className="text-muted-foreground">כלים מקצועיים, בלי סיבוכים</p>
        </div>
        <div className="rounded-lg border border-border bg-card divide-y divide-border overflow-hidden">
          <FeatureRow
            icon={<Scissors className="h-4 w-4" />}
            title="ניהול שירותים"
            description="הוסף שירותים עם שם, משך זמן ומחיר. עדכן בקלות בכל זמן."
          />
          <FeatureRow
            icon={<Clock className="h-4 w-4" />}
            title="שעות פעילות גמישות"
            description="הגדר שעות פתיחה לכל יום בשבוע בנפרד, כולל ימי מנוחה ומשמרות כפולות."
          />
          <FeatureRow
            icon={<CalendarDays className="h-4 w-4" />}
            title="יומן תורים"
            description="ראה את כל התורים שנקבעו, אשר, בטל וסמן כ'הושלם' ישירות מלוח הבקרה."
          />
          <FeatureRow
            icon={<BarChart3 className="h-4 w-4" />}
            title="לוח בקרה"
            description="סקירה מהירה של כמות התורים היום, השבוע ולפי כל עסק."
          />
          <FeatureRow
            icon={<Settings className="h-4 w-4" />}
            title="ניהול מרובה עסקים"
            description="יש לך יותר מסניף אחד? ניהול מרובה עסקים תחת חשבון אחד."
          />
        </div>
      </section>

      <div aria-hidden="true" className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      {/* CTA */}
      <section className="text-center py-8 md:py-12">
        <div className="max-w-md mx-auto">
          <h2 className="mb-3">מוכן להתחיל?</h2>
          <p className="text-muted-foreground mb-6">
            הרשמה חינמית, פחות מ-5 דקות עד לעסק הפעיל שלך.
          </p>
          <Button asChild size="lg" className="px-10">
            <Link to="/register">הירשם בחינם עכשיו</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
