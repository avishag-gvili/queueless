import { Link } from "react-router-dom";
import { Search, Calendar, CheckCircle, Building2, Settings, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StepProps {
  number: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  accent?: "teal" | "amber";
}

function Step({ number, icon, title, description, accent = "teal" }: StepProps) {
  const isAmber = accent === "amber";
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center gap-2 shrink-0">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-full ${
            isAmber ? "bg-accent-warm-soft text-accent-warm" : "bg-primary-soft text-primary"
          }`}
        >
          {icon}
        </div>
        <div className="w-px flex-1 bg-border last:hidden" />
      </div>
      <div className="pb-8">
        <span
          className={`inline-flex items-center justify-center h-5 w-5 rounded-full text-xs font-bold mb-1 transition-transform duration-200 hover:scale-110 ${
            isAmber
              ? "bg-accent-warm text-accent-warm-foreground"
              : "bg-primary text-primary-foreground"
          }`}
        >
          {number}
        </span>
        <h3 className="font-semibold text-foreground mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

export function HowItWorksPage() {
  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-16">
      {/* Page header */}
      <section className="text-center py-8 rounded-2xl bg-gradient-to-b from-accent-warm-soft/40 to-transparent">
        <h1 className="mb-3 animate-in fade-in slide-in-from-bottom-4 duration-700">
          איך זה עובד?
        </h1>
        <p className="text-muted-foreground text-lg animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
          QueueLess מחברת בין לקוחות לבעלי עסקים בצורה פשוטה, מהירה ונוחה.
        </p>
      </section>

      <div aria-hidden="true" className="h-px bg-gradient-to-r from-transparent via-border to-transparent -mt-8" />

      {/* For customers */}
      <section className="flex flex-col gap-6 rounded-2xl bg-primary-soft/40 p-6 md:p-8">
        <div className="border-b border-border pb-4">
          <h2 className="text-xl font-semibold">ללקוחות</h2>
          <p className="text-sm text-muted-foreground mt-1">
            הזמינו תור בשלושה צעדים פשוטים
          </p>
        </div>
        <div className="flex flex-col">
          <Step
            number="1"
            icon={<Search className="h-4.5 w-4.5" />}
            title="חפש עסק"
            description="חפש לפי שם, תחום או קטגוריה. סנן לפי סוג העסק — מספרה, כושר, בריאות ועוד."
            accent="teal"
          />
          <Step
            number="2"
            icon={<Calendar className="h-4.5 w-4.5" />}
            title="בחר שירות, תאריך ושעה"
            description="ראה את כל השירותים הזמינים ואת המחירים. בחר תאריך ושעה שמתאימים לך מרשימת הזמנות הפנויים."
            accent="amber"
          />
          <Step
            number="3"
            icon={<CheckCircle className="h-4.5 w-4.5" />}
            title="קבל אישור — וזהו, התור מובטח"
            description="הזן את פרטיך וסיים. התור שלך מאושר מיידית — ללא טלפונים, ללא המתנה."
            accent="teal"
          />
        </div>
        <div>
          <Button asChild>
            <Link to="/businesses">גלה עסקים עכשיו</Link>
          </Button>
        </div>
      </section>

      {/* For business owners */}
      <section className="flex flex-col gap-6 rounded-2xl bg-slate-50 p-6 md:p-8">
        <div className="border-b border-border pb-4">
          <h2 className="text-xl font-semibold">לבעלי עסק</h2>
          <p className="text-sm text-muted-foreground mt-1">
            הגדירו את העסק שלכם ותתחילו לקבל הזמנות
          </p>
        </div>
        <div className="flex flex-col">
          <Step
            number="1"
            icon={<Building2 className="h-4.5 w-4.5" />}
            title="הירשם וצור את העסק שלך"
            description="פתח חשבון בחינם, הוסף את שם העסק, קטגוריה ותיאור קצר שיעזור ללקוחות למצוא אותך."
            accent="teal"
          />
          <Step
            number="2"
            icon={<Settings className="h-4.5 w-4.5" />}
            title="הגדר שירותים ושעות פעילות"
            description="הוסף את השירותים שאתה מציע עם משך זמן ומחיר. קבע שעות פתיחה לכל יום בשבוע — כולל משמרות מרובות."
            accent="amber"
          />
          <Step
            number="3"
            icon={<Inbox className="h-4.5 w-4.5" />}
            title="קבל הזמנות אוטומטית — בלי טלפונים"
            description="הלקוחות מזמינים תורים בעצמם ב-24/7. ראה את כל התורים בלוח הבקרה, אשר, בטל או סמן כ'הושלם'."
            accent="teal"
          />
        </div>
        <div>
          <Button asChild>
            <Link to="/register">התחל עכשיו — בחינם</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
