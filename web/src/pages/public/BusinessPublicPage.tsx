import { useState } from "react";
import { useParams } from "react-router-dom";
import { Clock, MapPin, Tag } from "lucide-react";
import { useBusiness } from "@/hooks/useBusinesses";
import { useBusinessServices } from "@/hooks/useServices";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ErrorBanner } from "@/components/common/ErrorBanner";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { BookingFlow } from "@/features/booking/BookingFlow";
import { HEBREW_CATEGORY_LABELS } from "@/types/api";
import type { Service } from "@/types/api";
import { CATEGORY_COLORS } from "@/lib/categoryColors";
import { cn } from "@/lib/utils";

function formatPrice(price: string | null): string {
  if (!price) return "ללא עלות";
  return `₪${parseFloat(price).toFixed(0)}`;
}

interface ServiceCardProps {
  service: Service;
  onBook: (service: Service) => void;
}

function ServiceCard({ service, onBook }: ServiceCardProps) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-card p-6 shadow-sm hover:shadow-card-hover hover:-translate-y-1 transition-all duration-200">
      <div className="flex flex-col gap-1.5 min-w-0">
        <p className="font-semibold text-foreground">{service.name}</p>
        {service.description && (
          <p className="text-sm text-muted-foreground leading-relaxed">{service.description}</p>
        )}
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {service.duration_minutes != null ? `${service.duration_minutes} דק'` : 'משך פתוח'}
          </span>
          <span className="flex items-center gap-1">
            <Tag className="h-3.5 w-3.5" />
            {formatPrice(service.price)}
          </span>
        </div>
      </div>
      <Button size="sm" onClick={() => onBook(service)} className="shrink-0">
        הזמן
      </Button>
    </div>
  );
}

export function BusinessPublicPage() {
  const { id } = useParams<{ id: string }>();
  const { data: business, isLoading: bizLoading, error: bizError } = useBusiness(id);
  const { data: services, isLoading: svcLoading, error: svcError } = useBusinessServices(id);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  if (bizLoading || svcLoading) return <LoadingSpinner fullPage />;
  if (bizError) return <ErrorBanner error={bizError} className="my-8" />;
  if (!business) return null;

  const activeServices = services?.filter((s) => s.active) ?? [];

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-8">
      {/* Business header */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-bold">{business.name}</h1>
          <span className={cn(
            "inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium border",
            CATEGORY_COLORS[business.category].bg,
            CATEGORY_COLORS[business.category].text,
            CATEGORY_COLORS[business.category].border,
          )}>
            {HEBREW_CATEGORY_LABELS[business.category]}
          </span>
        </div>
        {business.city && (
          <p className="flex items-center gap-1.5 text-muted-foreground font-medium">
            <MapPin className="h-4 w-4 shrink-0" />
            {business.city}
          </p>
        )}
        {business.description && (
          <p className="text-muted-foreground leading-relaxed">{business.description}</p>
        )}
      </div>

      {/* Services */}
      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">שירותים</h2>
        {svcError && <ErrorBanner error={svcError} />}
        {!svcError && activeServices.length === 0 ? (
          <EmptyState message="אין שירותים זמינים כרגע." />
        ) : (
          <div className="flex flex-col gap-3">
            {activeServices.map((service) => (
              <ServiceCard key={service.id} service={service} onBook={setSelectedService} />
            ))}
          </div>
        )}
      </section>

      {/* Booking flow dialog */}
      {selectedService && business && (
        <BookingFlow
          business={business}
          service={selectedService}
          onClose={() => setSelectedService(null)}
        />
      )}
    </div>
  );
}
