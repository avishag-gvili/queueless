import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ErrorBanner } from "@/components/common/ErrorBanner";
import { cn } from "@/lib/utils";

const schema = z
  .object({
    full_name: z.string().min(1, "שם מלא חובה").max(200),
    email: z.string().email("כתובת אימייל לא תקינה"),
    password: z.string().min(8, "סיסמה חייבת להכיל לפחות 8 תווים"),
    confirm_password: z.string().min(1, "אישור סיסמה חובה"),
    role: z.enum(["customer", "business_owner"]),
    terms_accepted: z
      .boolean()
      .refine((v) => v === true, "יש לאשר את תנאי השימוש ומדיניות הפרטיות כדי להמשיך"),
  })
  .refine((v) => v.password === v.confirm_password, {
    message: "הסיסמאות אינן תואמות",
    path: ["confirm_password"],
  });

type FormValues = z.infer<typeof schema>;

export function RegisterPage() {
  const { register, user } = useAuth();
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      full_name: "",
      email: "",
      password: "",
      confirm_password: "",
      role: "customer",
      terms_accepted: false,
    },
  });

  // Redirect if already authenticated — after all hooks are called
  if (user) {
    return <Navigate to={user.role === "business_owner" ? "/admin/businesses" : "/"} replace />;
  }

  const onSubmit = async (values: FormValues) => {
    setSubmitError(null);
    try {
      await register({
        email: values.email,
        password: values.password,
        full_name: values.full_name,
        role: values.role,
      });
      navigate(values.role === "business_owner" ? "/admin/businesses" : "/", { replace: true });
    } catch (err) {
      const e = err as { response?: { data?: { detail?: string } } };
      setSubmitError(e.response?.data?.detail ?? "שגיאה בהרשמה. נסה שוב.");
    }
  };

  const selectedRole = form.watch("role");

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] -mt-8 -mb-12 bg-gradient-to-b from-primary-soft/50 to-muted/30 py-12">
      <div className="w-full max-w-sm px-4">
        {/* Brand mark */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-0.5 font-bold text-foreground text-2xl">
            <span className="text-primary font-extrabold">Q</span>
            <span>ueueLess</span>
          </Link>
          <h1 className="text-2xl font-bold mt-4 mb-1">יצירת חשבון</h1>
          <p className="text-sm text-muted-foreground">הצטרפו בחינם, ללא כרטיס אשראי</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            {submitError && <ErrorBanner error={submitError} />}

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="full_name">שם מלא</Label>
              <Input
                id="full_name"
                type="text"
                autoComplete="name"
                placeholder="ישראל ישראלי"
                {...form.register("full_name")}
              />
              {form.formState.errors.full_name && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.full_name.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">אימייל</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="your@email.com"
                dir="ltr"
                {...form.register("email")}
              />
              {form.formState.errors.email && (
                <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">סיסמה</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                dir="ltr"
                {...form.register("password")}
              />
              {form.formState.errors.password && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="confirm_password">אישור סיסמה</Label>
              <Input
                id="confirm_password"
                type="password"
                autoComplete="new-password"
                dir="ltr"
                {...form.register("confirm_password")}
              />
              {form.formState.errors.confirm_password && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.confirm_password.message}
                </p>
              )}
            </div>

            {/* Role selector */}
            <div className="flex flex-col gap-2">
              <Label>סוג חשבון</Label>
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    { value: "customer", label: "לקוח" },
                    { value: "business_owner", label: "בעל עסק" },
                  ] as const
                ).map(({ value, label }) => (
                  <label
                    key={value}
                    className={cn(
                      "flex items-center justify-center gap-2 rounded-md border px-3 py-2.5 text-sm font-medium cursor-pointer transition-colors",
                      selectedRole === value
                        ? "border-primary bg-primary/5 text-foreground"
                        : "border-border text-muted-foreground hover:bg-accent",
                    )}
                  >
                    <input
                      type="radio"
                      value={value}
                      {...form.register("role")}
                      className="sr-only"
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>

            {/* Terms acceptance */}
            <div className="flex flex-col gap-1.5">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 rounded border-border accent-primary"
                  {...form.register("terms_accepted")}
                />
                <span className="text-sm text-muted-foreground leading-snug">
                  קראתי ואני מסכים ל
                  <Link to="/terms" className="text-primary hover:underline mx-0.5" target="_blank">
                    תנאי השימוש
                  </Link>
                  ו
                  <Link
                    to="/privacy-policy"
                    className="text-primary hover:underline mx-0.5"
                    target="_blank"
                  >
                    מדיניות הפרטיות
                  </Link>
                </span>
              </label>
              {form.formState.errors.terms_accepted && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.terms_accepted.message}
                </p>
              )}
            </div>

            <Button type="submit" disabled={form.formState.isSubmitting} className="w-full mt-1">
              {form.formState.isSubmitting ? "נרשם..." : "הירשם"}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          כבר יש לך חשבון?{" "}
          <Link to="/login" className="text-primary font-medium hover:underline">
            התחבר
          </Link>
        </p>
      </div>
    </div>
  );
}
