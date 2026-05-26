import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateBusiness } from "@/hooks/useBusinesses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorBanner } from "@/components/common/ErrorBanner";
import { CategoryCombobox } from "@/components/common/CategoryCombobox";
import { CityCombobox } from "@/components/common/CityCombobox";
import { HEBREW_CATEGORY_LABELS, type BusinessCategory } from "@/types/api";

const CATEGORY_VALUES = Object.keys(HEBREW_CATEGORY_LABELS) as [BusinessCategory, ...BusinessCategory[]];

const schema = z.object({
  name: z.string().min(1, "שם חובה").max(200),
  city: z.string().min(1, "עיר חובה").max(100),
  description: z.string().max(1000).optional(),
  category: z.enum(CATEGORY_VALUES).default("other"),
});

type FormValues = z.infer<typeof schema>;

export function BusinessNewPage() {
  const navigate = useNavigate();
  const { mutateAsync: createBusiness } = useCreateBusiness();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", city: "", description: "", category: "other" },
  });

  const onSubmit = async (values: FormValues) => {
    setSubmitError(null);
    try {
      const business = await createBusiness({
        name: values.name,
        city: values.city,
        description: values.description || undefined,
        category: values.category,
      });
      navigate(`/admin/businesses/${business.id}`);
    } catch (err) {
      const e = err as { response?: { data?: { detail?: string } } };
      setSubmitError(e.response?.data?.detail ?? "שגיאה ביצירת העסק.");
    }
  };

  return (
    <div className="max-w-lg">
      <div className="mb-6 flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/admin/businesses">← חזרה</Link>
        </Button>
        <h1 className="text-2xl font-bold">עסק חדש</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>פרטי העסק</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            {submitError && <ErrorBanner error={submitError} />}

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">שם העסק *</Label>
              <Input id="name" {...form.register("name")} placeholder="מספרה רחל" />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="city">עיר *</Label>
              <Controller
                name="city"
                control={form.control}
                render={({ field }) => (
                  <CityCombobox id="city" value={field.value} onChange={field.onChange} />
                )}
              />
              {form.formState.errors.city && (
                <p className="text-sm text-destructive">{form.formState.errors.city.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="description">כתובת (לא חובה)</Label>
              <Input id="description" {...form.register("description")} placeholder="רחוב ומספר" />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="category">קטגוריה</Label>
              <Controller
                name="category"
                control={form.control}
                render={({ field }) => (
                  <CategoryCombobox
                    id="category"
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>

            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "יוצר..." : "צור עסק"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
