import { Link } from "react-router-dom";
import { useMyBusinesses } from "@/hooks/useBusinesses";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ErrorBanner } from "@/components/common/ErrorBanner";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, ChevronLeft } from "lucide-react";

export function BusinessesListPage() {
  const { data: businesses, isLoading, error } = useMyBusinesses();

  if (isLoading) return <LoadingSpinner fullPage />;
  if (error) return <ErrorBanner error={error} className="my-8" />;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">העסקים שלי</h1>
        <Button asChild>
          <Link to="/admin/businesses/new">
            <Plus className="h-4 w-4" />
            עסק חדש
          </Link>
        </Button>
      </div>

      {!businesses || businesses.length === 0 ? (
        <EmptyState message="עוד אין לך עסקים. לחץ 'עסק חדש' כדי להתחיל." />
      ) : (
        <div className="flex flex-col gap-3">
          {businesses.map((business) => (
            <Card key={business.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{business.name}</CardTitle>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to={`/admin/businesses/${business.id}`}>
                      <ChevronLeft className="h-4 w-4" />
                      נהל
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              {business.description && (
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground">{business.description}</p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
