"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { MapPin } from "lucide-react";

export interface LocalityEntry {
  locality: string;
  districtNumber: number;
}

interface Props {
  entries: LocalityEntry[];
  prefix: string;       // "" or "/mt"
  placeholder: string;
  noResults: string;
}

function normalise(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // strip combining diacritics (ħ→h, ġ→g, ż→z, etc.)
    .replace(/['']/g, "")            // strip apostrophes
    .toLowerCase();
}

export default function LocalitySearch({ entries, prefix, placeholder, noResults }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const filtered = useMemo(() => {
    const q = normalise(query.trim());
    if (!q) return [];
    return entries
      .filter(e => normalise(e.locality).includes(q))
      .slice(0, 8);
  }, [query, entries]);

  const select = useCallback(
    (entry: LocalityEntry) => {
      router.push(`${prefix}/district/${entry.districtNumber}`);
      setQuery("");
      setIsOpen(false);
      setActiveIndex(-1);
    },
    [router, prefix]
  );

  function handleKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!isOpen || filtered.length === 0) {
      if (e.key === "ArrowDown" && filtered.length > 0) {
        setIsOpen(true);
        setActiveIndex(0);
        e.preventDefault();
      }
      return;
    }
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex(i => Math.min(i + 1, filtered.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex(i => Math.max(i - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        if (filtered.length > 0) {
          select(filtered[activeIndex >= 0 ? activeIndex : 0]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setActiveIndex(-1);
        break;
    }
  }

  return (
    <div className="relative w-full">
      <div className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 focus-within:ring-2 focus-within:ring-accent/40 transition-shadow">
        <MapPin size={14} className="shrink-0 text-[var(--muted)]" aria-hidden />
        <input
          type="search"
          value={query}
          onChange={e => {
            setQuery(e.target.value);
            setIsOpen(true);
            setActiveIndex(-1);
          }}
          onKeyDown={handleKey}
          onFocus={() => { if (query) setIsOpen(true); }}
          onBlur={() => setTimeout(() => setIsOpen(false), 150)}
          placeholder={placeholder}
          className="flex-1 min-w-0 bg-transparent text-base sm:text-sm outline-none placeholder:text-[var(--muted)]"
          role="combobox"
          aria-expanded={isOpen && filtered.length > 0}
          aria-autocomplete="list"
          aria-haspopup="listbox"
          autoComplete="off"
          spellCheck={false}
        />
      </div>

      {isOpen && query.trim() !== "" && (
        <ul
          role="listbox"
          className="absolute z-50 mt-1 w-full rounded-md border border-border bg-background shadow-lg overflow-hidden"
        >
          {filtered.length === 0 ? (
            <li className="px-3 py-2 text-sm text-[var(--muted)]" role="option" aria-selected={false}>
              {noResults}
            </li>
          ) : (
            filtered.map((e, i) => (
              <li
                key={`${e.districtNumber}-${e.locality}`}
                role="option"
                aria-selected={i === activeIndex}
                onMouseDown={() => select(e)}
                onMouseEnter={() => setActiveIndex(i)}
                className={[
                  "flex items-center justify-between px-3 py-2 text-sm cursor-pointer transition-colors",
                  i === activeIndex
                    ? "bg-muted-bg text-[var(--accent)]"
                    : "hover:bg-muted-bg/60",
                ].join(" ")}
              >
                <span>{e.locality}</span>
                <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-[var(--muted)] shrink-0 ml-3">
                  D{e.districtNumber}
                </span>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
