import { useState, useRef, useEffect, useId } from "react";
import { ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ISRAEL_CITIES_BY_REGION, ALL_ISRAEL_CITIES } from "@/lib/israelCities";

interface Props {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  placeholder?: string;
}

export function CityCombobox({ value, onChange, id, placeholder = "בחר עיר או הקלד ידנית" }: Props) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();

  const query = value.trim();
  const filtered = query ? ALL_ISRAEL_CITIES.filter((c) => c.includes(query)) : null;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (city: string) => {
    onChange(city);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Input
          id={id}
          role="combobox"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-label={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          autoComplete="off"
          className="pe-8"
        />
        <ChevronDown className="pointer-events-none absolute end-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      </div>

      {open && (
        <div
          id={listboxId}
          role="listbox"
          aria-label="ערים בישראל"
          className="absolute z-50 mt-1 w-full rounded-md border border-border bg-popover shadow-md max-h-72 overflow-y-auto py-1"
        >
          {filtered ? (
            filtered.length === 0 ? (
              <div className="px-3 py-2 text-sm text-muted-foreground text-center">
                לא נמצאה עיר — הערך שהקלדת ישמר כפי שהוא
              </div>
            ) : (
              filtered.map((city) => (
                <div
                  key={city}
                  role="option"
                  aria-selected={city === value ? true : false}
                  onClick={() => handleSelect(city)}
                  className={cn(
                    "cursor-pointer px-3 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground",
                    city === value && "bg-accent/50 font-medium",
                  )}
                >
                  {city}
                </div>
              ))
            )
          ) : (
            ISRAEL_CITIES_BY_REGION.map((group) => (
              <div key={group.region} role="group" aria-label={group.region}>
                <div className="px-3 pt-2 pb-0.5 text-xs font-semibold text-muted-foreground sticky top-0 bg-popover">
                  {group.region}
                </div>
                {group.cities.map((city) => (
                  <div
                    key={city}
                    role="option"
                    aria-selected={city === value ? true : false}
                    onClick={() => handleSelect(city)}
                    className={cn(
                      "cursor-pointer px-3 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground",
                      city === value && "bg-accent/50 font-medium",
                    )}
                  >
                    {city}
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
