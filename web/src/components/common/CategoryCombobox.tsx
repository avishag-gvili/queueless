import { useState, useRef, useEffect } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { HEBREW_CATEGORY_LABELS, type BusinessCategory } from "@/types/api";

const ALL_CATEGORIES = Object.keys(HEBREW_CATEGORY_LABELS) as BusinessCategory[];

interface Props {
  value: BusinessCategory;
  onChange: (value: BusinessCategory) => void;
  id?: string;
}

export function CategoryCombobox({ value, onChange, id }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = ALL_CATEGORIES.filter((cat) =>
    HEBREW_CATEGORY_LABELS[cat].includes(query) || cat.includes(query.toLowerCase()),
  );

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (cat: BusinessCategory) => {
    onChange(cat);
    setOpen(false);
    setQuery("");
  };

  return (
    <div ref={containerRef} className="relative" id={id}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm",
          "ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring",
          "disabled:cursor-not-allowed disabled:opacity-50",
        )}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span>{HEBREW_CATEGORY_LABELS[value]}</span>
        <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-popover shadow-md">
          {/* Search input */}
          <div className="flex items-center gap-2 border-b border-border px-3 py-2">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <Input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="חפש קטגוריה..."
              className="h-7 border-0 p-0 text-sm shadow-none focus-visible:ring-0"
            />
          </div>

          {/* Options */}
          <ul role="listbox" className="max-h-64 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-sm text-muted-foreground text-center">לא נמצאו תוצאות</li>
            ) : (
              filtered.map((cat) => (
                <li
                  key={cat}
                  role="option"
                  aria-selected={cat === value}
                  onClick={() => handleSelect(cat)}
                  className={cn(
                    "flex cursor-pointer items-center justify-between px-3 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground",
                    cat === value && "bg-accent/50",
                  )}
                >
                  {HEBREW_CATEGORY_LABELS[cat]}
                  {cat === value && <Check className="h-4 w-4 shrink-0" />}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
