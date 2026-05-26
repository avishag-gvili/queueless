import type { ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xl font-semibold border-b border-border pb-2">{title}</h2>
      <div className="flex flex-col gap-2 text-sm text-foreground leading-relaxed">{children}</div>
    </section>
  );
}

function LegalWarningBanner() {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-accent-warm/30 bg-accent-warm-soft p-4 text-accent-warm-soft-foreground">
      <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
      <p className="text-sm font-medium">
        זוהי תבנית בלבד. יש להעביר לבדיקת עורך דין לפני השקה לציבור.
      </p>
    </div>
  );
}

export function PrivacyPolicyPage() {
  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-8 pb-12">
      <div className="flex flex-col gap-3">
        <h1>מדיניות פרטיות</h1>
        <p className="text-muted-foreground text-sm">עודכן לאחרונה: מאי 2026</p>
      </div>

      <LegalWarningBanner />

      <Section title="מי אנחנו">
        <p>
          QueueLess היא מערכת תורים דיגיטלית המחברת בין לקוחות לעסקים קטנים. כתובת החברה ופרטי
          הקשר יופיעו כאן לאחר השלמת ההליך המשפטי.
        </p>
        <p className="text-muted-foreground italic">
          [מקום לפרטי החברה: שם משפטי, כתובת, ח.פ.]
        </p>
      </Section>

      <Section title="איזה מידע אנחנו אוספים">
        <p>אנחנו אוספים את סוגי המידע הבאים:</p>
        <ul className="list-disc list-inside flex flex-col gap-1 ps-2">
          <li>
            <strong>פרטי חשבון:</strong> שם מלא, כתובת אימייל, סיסמה מוצפנת ותפקיד (לקוח / בעל
            עסק).
          </li>
          <li>
            <strong>פרטי עסק:</strong> שם עסק, תיאור, קטגוריה, שעות פעילות ושירותים שבעל העסק
            מגדיר.
          </li>
          <li>
            <strong>פרטי תורים:</strong> שירות שנבחר, תאריך ושעה, סטטוס תור (מאושר / בוטל /
            הושלם).
          </li>
          <li>
            <strong>נתוני שימוש:</strong> דפים שנצפו, פעולות במערכת, כתובת IP ונתוני דפדפן — אם
            ניתנה הסכמה לעוגיות ניתוח שימוש.
          </li>
        </ul>
        <p>אנחנו לא אוספים מידע אישי רגיש כגון מספרי זהות, פרטי בנק או מידע רפואי.</p>
      </Section>

      <Section title="איך אנחנו משתמשים במידע">
        <ul className="list-disc list-inside flex flex-col gap-1 ps-2">
          <li>מתן השירות: ניהול חשבונות, הזמנת תורים ותקשורת בין לקוחות לעסקים.</li>
          <li>שיפור המוצר: הבנת דפוסי שימוש ושיפור חוויית המשתמש (בהסכמה בלבד).</li>
          <li>אבטחה: זיהוי ומניעת פעילות חשודה.</li>
          <li>תקשורת: הודעות מערכת הנוגעות לחשבון שלך (לא שיווק, אלא דיווחים עסקיים).</li>
        </ul>
      </Section>

      <Section title="שיתוף מידע עם צדדים שלישיים">
        <p>
          נכון למועד עדכון מדיניות זו, אנחנו אינם משתפים מידע אישי עם צדדים שלישיים לצורכי
          שיווק.
        </p>
        <p>
          שיתוף מידע עשוי להתבצע במקרים הבאים: ציות לחוק ולצווי בית משפט; ספקי תשתית טכנית
          (אחסון ענן) שכפופים להסכמי עיבוד נתונים; העברת עסק (מיזוג, רכישה) — עם הודעה מוקדמת
          למשתמשים.
        </p>
      </Section>

      <Section title="אבטחת מידע">
        <ul className="list-disc list-inside flex flex-col gap-1 ps-2">
          <li>כל התקשורת מוצפנת ב-TLS (HTTPS).</li>
          <li>סיסמאות מאוחסנות כ-hash בלבד — לעולם לא בטקסט גלוי.</li>
          <li>גישה למסדי הנתונים מוגבלת לצוות פיתוח בלבד.</li>
          <li>אנו מבצעים גיבויים תקופתיים ועדכוני אבטחה שוטפים.</li>
        </ul>
        <p className="text-muted-foreground">
          אין מערכת מאובטחת לחלוטין. אם תגלה פגיעות אבטחה, אנא פנה אלינו מיידית.
        </p>
      </Section>

      <Section title="שימוש בעוגיות">
        <p>
          אנחנו משתמשים בעוגיות חיוניות לתפעול המערכת (כגון שמירת מצב ההתחברות). בהסכמתך,
          אנחנו עשויים להשתמש גם בעוגיות ניתוח שימוש ושיווק.
        </p>
        <p>
          תוכל לנהל את העדפות העוגיות בכל עת דרך קישור "ניהול עוגיות" בתחתית הדף.
        </p>
      </Section>

      <Section title="זכויות המשתמש לפי תיקון 13 לחוק הגנת הפרטיות (ישראל)">
        <p>בהתאם לחוק הגנת הפרטיות, תשמ"א-1981 ותיקון 13 (2025), יש לך זכות ל:</p>
        <ul className="list-disc list-inside flex flex-col gap-1 ps-2">
          <li>
            <strong>זכות עיון:</strong> לדעת אילו נתונים אנחנו מחזיקים עליך ולקבל עותק שלהם.
          </li>
          <li>
            <strong>זכות תיקון:</strong> לדרוש תיקון מידע שגוי או לא מדויק.
          </li>
          <li>
            <strong>זכות מחיקה:</strong> לבקש מחיקת הנתונים שלך, בכפוף לחובות שמירה חוקיות.
          </li>
          <li>
            <strong>זכות התנגדות:</strong> להתנגד לעיבוד מידע לצרכי שיווק ישיר.
          </li>
        </ul>
        <p className="text-muted-foreground italic">
          [פרטי ממונה הגנת הפרטיות יופיעו כאן לאחר מינוי]
        </p>
      </Section>

      <Section title="זכויות לפי GDPR (למשתמשים מה-EEA)">
        <p>
          אם הינך תושב/ת האיחוד האירופי, חלות עליך גם זכויות GDPR הכוללות: זכות גישה, תיקון,
          מחיקה, הגבלת עיבוד, ניידות נתונים, והתנגדות לעיבוד. הבסיס המשפטי לעיבוד הוא ביצוע
          חוזה (מתן השירות) והסכמה (עוגיות אנליטיקס).
        </p>
      </Section>

      <Section title="איך לפנות אלינו">
        <p>
          לכל שאלה, בקשה או תלונה הנוגעת לפרטיות, ניתן לפנות אלינו בכתובת:
        </p>
        <p className="text-muted-foreground italic">[כתובת אימייל ליצירת קשר — למלא לפני השקה]</p>
        <p>אנו מתחייבים להשיב תוך 30 יום.</p>
      </Section>

      <Section title="שינויים במדיניות">
        <p>
          אנו רשאים לעדכן מדיניות זו מעת לעת. שינויים מהותיים יובאו לידיעתך באמצעות הודעה
          באתר או בדואר אלקטרוני לפחות 14 יום מראש. המשך השימוש לאחר השינוי מהווה הסכמה למדיניות
          המעודכנת.
        </p>
      </Section>
    </div>
  );
}
