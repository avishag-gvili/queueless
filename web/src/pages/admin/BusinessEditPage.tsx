import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMyBusinesses, useUpdateBusiness, useDeleteBusiness } from "@/hooks/useBusinesses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ErrorBanner } from "@/components/common/ErrorBanner";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { CategoryCombobox } from "@/components/common/CategoryCombobox";
import { CityCombobox } from "@/components/common/CityCombobox";
import { Scissors, Clock, CalendarDays, ExternalLink } from "lucide-react";
import { HEBREW_CATEGORY_LABELS, type BusinessCategory } from "@/types/api";

const CATEGORY_VALUES = Object.keys(HEBREW_CATEGORY_LABELS) as [BusinessCategory, ...BusinessCategory[]];

const schema = z.object({
  name: z.string().min(1, "שם חובה").max(200),
  city: z.string().max(100).optional(),
  description: z.string().max(1000).optional(),
  category: z.enum(CATEGORY_VALUES),
  customer_data_retention_days: z.coerce.number().int().min(0).default(0),
});

type FormValues = z.infer<typeof schema>;

export function BusinessEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: businesses, isLoading } = useMyBusinesses();
  const { mutateAsync: updateBusiness } = useUpdateBusiness(id!);
  const { mutateAsync: deleteBusiness } = useDeleteBusiness();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const business = businesses?.find((b) => b.id === id);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: business
      ? {
          name: business.name,
          city: business.city ?? "",
          description: business.description ?? "",
          category: business.category,
          customer_data_retention_days: business.customer_data_retention_days,
        }
      : undefined,
  });

  if (isLoading) return <LoadingSpinner fullPage />;
  if (!business) return <p className="text-muted-foreground py-8">עסק לא נמצא.</p>;

  const onSubmit = async (values: FormValues) => {
    setSubmitError(null);
    try {
      await updateBusiness({
        name: values.name,
        city: values.city || undefined,
        description: values.description || undefined,
        category: values.category,
        customer_data_retention_days: values.customer_data_retention_days,
      });
    } catch (err) {
      const e = err as { response?: { data?: { detail?: string } } };
      setSubmitError(e.response?.data?.detail ?? "שגיאה בשמירת הפרטים.");
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteBusiness(business.id);
      navigate("/admin/businesses", { replace: true });
    } catch {
      setDeleting(false);
      setDeleteOpen(false);
    }
  };

  return (
    <div className="max-w-lg flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{business.name}</h1>
        <Button variant="ghost" size="sm" asChild>
          <a href={`/businesses/${business.id}`} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4" />
            עמוד ציבורי
          </a>
        </Button>
      </div>

      {/* Quick nav */}
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link to={`/admin/businesses/${id}/services`}>
            <Scissors className="h-4 w-4" />
            שירותים
          </Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link to={`/admin/businesses/${id}/working-hours`}>
            <Clock className="h-4 w-4" />
            שעות פעילות
          </Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link to={`/admin/businesses/${id}/appointments`}>
            <CalendarDays className="h-4 w-4" />
            תורים
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>עריכת פרטים</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            {submitError && <ErrorBanner error={submitError} />}

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">שם *</Label>
              <Input id="name" {...form.register("name")} />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="city">עיר</Label>
              <Controller
                name="city"
                control={form.control}
                render={({ field }) => (
                  <CityCombobox id="city" value={field.value ?? ""} onChange={field.onChange} />
                )}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="description">כתובת</Label>
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

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="retention">ימי שמירת מידע לקוחות</Label>
              <Input
                id="retention"
                type="number"
                min={0}
                {...form.register("customer_data_retention_days")}
              />
              <p className="text-xs text-muted-foreground">
                לאחר כמה ימים ממועד התור להסיר את פרטי הלקוח. 0 = מחיקה מיידית לאחר השלמת התור.
              </p>
            </div>

            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "שומר..." : "שמור שינויים"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive text-base">מחיקת עסק</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">
            פעולה זו תמחק את העסק וכל הנתונים שלו לצמיתות.
          </p>
          <Button variant="destructive" size="sm" onClick={() => setDeleteOpen(true)}>
            מחק עסק
          </Button>
        </CardContent>
      </Card>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>מחיקת עסק</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            האם אתה בטוח? לא ניתן לבטל פעולה זו.
          </p>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              ביטול
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? "מוחק..." : "מחק"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
