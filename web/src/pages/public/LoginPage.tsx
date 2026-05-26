import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useLocation, Link, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ErrorBanner } from "@/components/common/ErrorBanner";

const schema = z.object({
  email: z.string().email("כתובת אימייל לא תקינה"),
  password: z.string().min(1, "סיסמה חובה"),
});

type FormValues = z.infer<typeof schema>;

export function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? null;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  // Redirect if already authenticated — after all hooks are called
  if (user) {
    const dest = from ?? (user.role === "business_owner" ? "/admin/businesses" : "/");
    return <Navigate to={dest} replace />;
  }

  const onSubmit = async (values: FormValues) => {
    setSubmitError(null);
    try {
      await login(values);
      navigate(from ?? "/", { replace: true });
    } catch (err) {
      const e = err as { response?: { data?: { detail?: string } } };
      setSubmitError(e.response?.data?.detail ?? "שגיאה בהתחברות. נסה שוב.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] -mt-8 -mb-12 bg-gradient-to-b from-primary-soft/50 to-muted/30 py-12">
      <div className="w-full max-w-sm px-4">
        {/* Brand mark */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-0.5 font-bold text-foreground text-2xl">
            <span className="text-primary font-extrabold">Q</span>
            <span>ueueLess</span>
          </Link>
          <h1 className="text-2xl font-bold mt-4 mb-1">ברוכים השבים</h1>
          <p className="text-sm text-muted-foreground">התחבר לחשבון שלך</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            {submitError && <ErrorBanner error={submitError} />}

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
                autoComplete="current-password"
                dir="ltr"
                {...form.register("password")}
              />
              {form.formState.errors.password && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>

            <Button type="submit" disabled={form.formState.isSubmitting} className="w-full mt-1">
              {form.formState.isSubmitting ? "מתחבר..." : "התחבר"}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          אין לך חשבון?{" "}
          <Link to="/register" className="text-primary font-medium hover:underline">
            הירשם בחינם
          </Link>
        </p>
      </div>
    </div>
  );
}
