import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { MapPin, Search, SearchX, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePublicBusinesses } from "@/hooks/usePublicBusinesses";
import { CityCombobox } from "@/components/common/CityCombobox";
import { HEBREW_CATEGORY_LABELS, type BusinessCategory, type BusinessPublicRead } from "@/types/api";
import { CATEGORY_COLORS } from "@/lib/categoryColors";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 12;

// ── BusinessCard ──────────────────────────────────────────────────────────────

function BusinessCard({ business, index }: { business: BusinessPublicRead; index: number }) {
  const colors = CATEGORY_COLORS[business.category];
  return (
    <div
      style={{ animationDelay: `${Math.min(index * 60, 300)}ms` }}
      className={cn(
        "flex flex-col rounded-lg border border-border bg-card p-6 gap-4 cursor-pointer",
        "animate-in fade-in slide-in-from-bottom-2 duration-400",
        "shadow-sm hover:shadow-card-hover hover:-translate-y-1 transition-all duration-200 border-t-2",
        colors.cardAccent,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base font-semibold text-foreground leading-snug">{business.name}</h3>
        <span className={cn(
          "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border shrink-0",
          colors.bg, colors.text, colors.border,
        )}>
          {HEBREW_CATEGORY_LABELS[business.category]}
        </span>
      </div>
      {business.city && (
        <p className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3 shrink-0" />
          {business.city}
        </p>
      )}
      {business.description && (
        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
          {business.description}
        </p>
      )}
      <div className="mt-auto">
        <Button asChild size="sm" className="w-full">
          <Link to={`/businesses/${business.id}`}>צפה בעסק</Link>
        </Button>
      </div>
    </div>
  );
}

function BusinessCardSkeleton() {
  return (
    <div className="flex flex-col rounded-lg border border-border bg-card p-6 gap-4">
      <div className="flex items-start justify-between gap-3">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      <Skeleton className="h-9 w-full" />
    </div>
  );
}

// ── BusinessesIndexPage ───────────────────────────────────────────────────────

export function BusinessesIndexPage() {
  const [inputValue, setInputValue] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [activeCategory, setActiveCategory] = useState<BusinessCategory | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [priceMinInput, setPriceMinInput] = useState("");
  const [priceMaxInput, setPriceMaxInput] = useState("");
  const [debouncedPriceMin, setDebouncedPriceMin] = useState<number | null>(null);
  const [debouncedPriceMax, setDebouncedPriceMax] = useState<number | null>(null);
  const [offset, setOffset] = useState(0);

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const priceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce search query
  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setDebouncedQ(inputValue.trim());
      setOffset(0);
    }, 300);
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current); };
  }, [inputValue]);

  // Debounce price inputs
  useEffect(() => {
    if (priceTimer.current) clearTimeout(priceTimer.current);
    priceTimer.current = setTimeout(() => {
      setDebouncedPriceMin(priceMinInput ? Number(priceMinInput) : null);
      setDebouncedPriceMax(priceMaxInput ? Number(priceMaxInput) : null);
      setOffset(0);
    }, 300);
    return () => { if (priceTimer.current) clearTimeout(priceTimer.current); };
  }, [priceMinInput, priceMaxInput]);

  const { data, isLoading, isError } = usePublicBusinesses({
    q: debouncedQ || undefined,
    category: activeCategory,
    city: selectedCity,
    priceMin: debouncedPriceMin,
    priceMax: debouncedPriceMax,
    limit: PAGE_SIZE,
    offset,
  });


  const hasFilters = !!debouncedQ || !!activeCategory || !!selectedCity || !!debouncedPriceMin || !!debouncedPriceMax;

  const clearFilters = () => {
    setInputValue("");
    setActiveCategory(null);
    setSelectedCity(null);
    setPriceMinInput("");
    setPriceMaxInput("");
    setOffset(0);
  };

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 0;
  const currentPage = Math.floor(offset / PAGE_SIZE);

  return (
    <div className="flex flex-col gap-8">
      {/* Page header */}
      <div className="text-center">
        <h1 className="mb-2">מצא את העסק שלך</h1>
        <p className="text-muted-foreground">חפש מבין מגוון עסקים וקבע תור בקלות</p>
      </div>

      {/* Search bar */}
      <div className="relative max-w-xl mx-auto w-full">
        <Search className="absolute end-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="חפש לפי שם או תיאור..."
          className="h-11 pe-10 text-base"
        />
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Category select */}
        <Select
          value={activeCategory ?? "__all__"}
          onValueChange={(v) => {
            setActiveCategory(v === "__all__" ? null : v as BusinessCategory);
            setOffset(0);
          }}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="כל הקטגוריות" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">כל הקטגוריות</SelectItem>
            {(Object.keys(HEBREW_CATEGORY_LABELS) as BusinessCategory[]).map((cat) => (
              <SelectItem key={cat} value={cat}>{HEBREW_CATEGORY_LABELS[cat]}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* City filter */}
        <div className="w-44">
          <CityCombobox
            value={selectedCity ?? ""}
            onChange={(v) => {
              setSelectedCity(v || null);
              setOffset(0);
            }}
            placeholder="כל הערים"
          />
        </div>

        {/* Price range */}
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={0}
            value={priceMinInput}
            onChange={(e) => setPriceMinInput(e.target.value)}
            placeholder='ממחיר ₪'
            className="w-28 h-9 text-sm"
            dir="ltr"
          />
          <span className="text-muted-foreground text-sm">—</span>
          <Input
            type="number"
            min={0}
            value={priceMaxInput}
            onChange={(e) => setPriceMaxInput(e.target.value)}
            placeholder='עד מחיר ₪'
            className="w-28 h-9 text-sm"
            dir="ltr"
          />
        </div>

        {/* Clear filters button */}
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1.5">
            <X className="h-4 w-4" />
            נקה סינון
          </Button>
        )}
      </div>

      {/* Results */}
      {isError ? (
        <p className="text-center text-destructive py-8">שגיאה בטעינת העסקים. נסה שוב מאוחר יותר.</p>
      ) : isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <BusinessCardSkeleton key={i} />
          ))}
        </div>
      ) : !data || data.items.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <SearchX className="h-10 w-10 text-muted-foreground/50" />
          <div>
            <p className="font-medium text-foreground mb-1">לא נמצאו עסקים</p>
            <p className="text-sm text-muted-foreground">נסה לשנות את מילות החיפוש או הסינון</p>
          </div>
          {hasFilters && (
            <Button variant="outline" onClick={clearFilters}>
              נסה לאפס סינון
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.items.map((biz, i) => (
            <BusinessCard key={biz.id} business={biz} index={i} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {data && data.total > PAGE_SIZE && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <Button
            variant="outline"
            size="sm"
            disabled={offset === 0}
            onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
          >
            הקודם
          </Button>
          <span className="text-sm text-muted-foreground">
            עמוד {currentPage + 1} מתוך {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={offset + PAGE_SIZE >= data.total}
            onClick={() => setOffset(offset + PAGE_SIZE)}
          >
            הבא
          </Button>
        </div>
      )}
    </div>
  );
}
