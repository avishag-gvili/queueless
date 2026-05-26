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

export function TermsOfServicePage() {
  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-8 pb-12">
      <div className="flex flex-col gap-3">
        <h1>תנאי שימוש</h1>
        <p className="text-muted-foreground text-sm">עודכן לאחרונה: מאי 2026</p>
      </div>

      <LegalWarningBanner />

      <Section title="הקדמה">
        <p>
          ברוכים הבאים ל-QueueLess. השימוש באתר ובשירותים שלנו כפוף לתנאי שימוש אלה. אנא קרא
          אותם בקפידה לפני השימוש בשירות. השימוש בשירות מהווה הסכמה לתנאים.
        </p>
      </Section>

      <Section title="הגדרות">
        <ul className="list-disc list-inside flex flex-col gap-1 ps-2">
          <li>
            <strong>"השירות"</strong> — מערכת QueueLess לניהול ואיתור תורים, כפי שמוצגת בכתובת
            האתר.
          </li>
          <li>
            <strong>"בעל עסק"</strong> — משתמש שנרשם בתפקיד "בעל עסק" ומנהל עסק אחד או יותר
            במערכת.
          </li>
          <li>
            <strong>"לקוח"</strong> — משתמש שנרשם בתפקיד "לקוח" ומשתמש בשירות להזמנת תורים.
          </li>
          <li>
            <strong>"QueueLess"</strong> — החברה המפעילה את השירות.
          </li>
        </ul>
      </Section>

      <Section title="רישום וחשבון משתמש">
        <p>
          כדי להשתמש בחלקים מהשירות, יש להירשם ולספק מידע נכון ומדויק. אתה אחראי לשמירת סודיות
          פרטי ההתחברות שלך. כל פעילות המתבצעת תחת חשבונך היא באחריותך.
        </p>
        <p>
          QueueLess שומרת לעצמה את הזכות להשעות או לבטל חשבונות שמפרים את תנאי השימוש.
        </p>
      </Section>

      <Section title="תיאור השירות">
        <p>
          QueueLess מאפשרת לבעלי עסקים לנהל שירותים, שעות פעילות ותורים. לקוחות יכולים לחפש
          עסקים, לצפות בשירותים הזמינים ולהזמין תורים. QueueLess היא פלטפורמה בלבד ואינה צד
          לעסקה בין הלקוח לבעל העסק.
        </p>
      </Section>

      <Section title="חובות וזכויות בעלי עסקים">
        <ul className="list-disc list-inside flex flex-col gap-1 ps-2">
          <li>לספק מידע מדויק ועדכני על שירותים ומחירים.</li>
          <li>לכבד תורים שנקבעו על ידי לקוחות.</li>
          <li>לקבוע ולאכוף מדיניות ביטולים ברורה.</li>
          <li>לא להשתמש בפלטפורמה לצרכי הונאה או הטעיה.</li>
        </ul>
        <p>
          בעל עסק זכאי לנהל את שעות הפעילות, השירותים והתורים לפי שיקול דעתו, בכפוף לחוקי
          הגנת הצרכן.
        </p>
      </Section>

      <Section title="חובות וזכויות לקוחות">
        <ul className="list-disc list-inside flex flex-col gap-1 ps-2">
          <li>לספק פרטים נכונים בעת הזמנת תור.</li>
          <li>להגיע לתורים בזמן או לבטל מראש בהתאם למדיניות העסק.</li>
          <li>לא לנצל לרעה את מערכת ההזמנות (הזמנות כוזבות, ספאם).</li>
        </ul>
      </Section>

      <Section title="מדיניות ביטולים">
        <p>
          מדיניות ביטול תורים נקבעת על ידי בעל העסק ואינה בסמכות QueueLess. קודם לביטול, אנא
          בדוק את מדיניות הביטולים של העסק הספציפי. QueueLess אינה אחראית לכל חיוב עקב ביטול
          מאוחר.
        </p>
      </Section>

      <Section title="אחריות והגבלת אחריות">
        <p>
          השירות ניתן "כמות שהוא" (AS IS). QueueLess אינה מתחייבת לזמינות רציפה ללא הפרעות.
        </p>
        <p>
          QueueLess לא תישא באחריות לנזקים עקיפים, תוצאתיים, מיוחדים או מענישים הנובעים
          מהשימוש בשירות, לרבות הפסד עסקי, הפסד הכנסות או נזק למוניטין.
        </p>
        <p>
          האחריות המרבית של QueueLess בכל עניין הקשור לשירות לא תעלה על הסכום ששולם על ידיך
          עבור השירות ב-12 החודשים שקדמו לאירוע.
        </p>
      </Section>

      <Section title="קניין רוחני">
        <p>
          כל הזכויות בפלטפורמה, לרבות עיצוב, קוד, לוגו ותוכן, שייכות ל-QueueLess. אין לשכפל,
          להפיץ, לשנות או לעשות שימוש מסחרי בתכנים ללא אישור בכתב מראש.
        </p>
      </Section>

      <Section title="שיפוי">
        <p>
          אתה מסכים לשפות את QueueLess, מנהליה, עובדיה ושותפיה מפני כל תביעה, נזק, הפסד או
          הוצאה (לרבות שכ"ט עורכי דין) הנובעים מהפרת תנאי שימוש אלה.
        </p>
      </Section>

      <Section title="סיום שירות">
        <p>
          QueueLess רשאית להפסיק את השירות או לבטל חשבון בכל עת, עם הודעה מוקדמת סבירה. במקרה
          של הפרת תנאים חמורה, הביטול יכול להתבצע ללא הודעה מוקדמת.
        </p>
        <p>
          משתמש רשאי לסגור את חשבונו בכל עת על ידי פנייה לשירות הלקוחות.
        </p>
      </Section>

      <Section title="תיקון התנאים">
        <p>
          QueueLess רשאית לעדכן תנאים אלה מעת לעת. שינויים מהותיים יובאו לידיעתך לפחות 14 יום
          מראש. המשך השימוש בשירות לאחר כניסת השינוי לתוקף מהווה הסכמה לתנאים המעודכנים.
        </p>
      </Section>

      <Section title="סמכות שיפוט">
        <p>
          תנאים אלה כפופים לדיני מדינת ישראל. כל מחלוקת תובא בפני בתי המשפט המוסמכים בתל אביב
          — יפו, ישראל.
        </p>
      </Section>

      <Section title="יצירת קשר">
        <p>
          לכל שאלה הנוגעת לתנאי שימוש אלה, ניתן לפנות אלינו:
        </p>
        <p className="text-muted-foreground italic">[כתובת אימייל ליצירת קשר — למלא לפני השקה]</p>
      </Section>
    </div>
  );
}
