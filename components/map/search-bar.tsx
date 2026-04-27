"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  Menu,
  Locate,
  Loader2,
  MapPin,
  FolderOpen,
  Clock,
  X,
} from "lucide-react";
import {
  getSearchSuggestions,
  type SearchSuggestion,
} from "@/lib/search-service";
import { cn } from "@/lib/utils";

// ─── Recent searches (localStorage) ──────────────────────────────────────────

const STORAGE_KEY = "aseec_recent_searches";
const MAX_RECENT = 5;

function getRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveRecentSearch(query: string) {
  const recent = getRecentSearches().filter((q) => q !== query);
  recent.unshift(query);
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(recent.slice(0, MAX_RECENT)),
  );
}

// ─── Radius options ───────────────────────────────────────────────────────────

const RADIUS_OPTIONS = [10, 25, 50, 100] as const;

// ─── Component ────────────────────────────────────────────────────────────────

export interface SearchBarProps {
  onMenuClick: () => void;
  onSearch: (query: string) => void;
  onSuggestionSelect: (suggestion: SearchSuggestion) => void;
  onNearMeClick?: (radius: number) => void;
  isLocating?: boolean;
  isSearching?: boolean;
  isHidden?: boolean;
}

export function SearchBar({
  onMenuClick,
  onSearch,
  onSuggestionSelect,
  onNearMeClick,
  isLocating = false,
  isSearching = false,
  isHidden,
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [radius, setRadius] = useState<(typeof RADIUS_OPTIONS)[number]>(50);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ── Autocomplete fetch (debounced) ─────────────────────────────────────────

  const fetchSuggestions = useCallback((value: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setIsFetching(true);
      try {
        const results = await getSearchSuggestions(value);
        setSuggestions(results);
        setShowDropdown(results.length > 0);
      } finally {
        setIsFetching(false);
      }
    }, 350);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    if (value.trim().length < 2) {
      setSuggestions([]);
      setShowDropdown(value.trim().length === 0); // show recents when empty
    } else {
      fetchSuggestions(value);
    }
  };

  // ── Submit ─────────────────────────────────────────────────────────────────

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    saveRecentSearch(q);
    setRecentSearches(getRecentSearches());
    setShowDropdown(false);
    onSearch(q);
  };

  // ── Suggestion click ───────────────────────────────────────────────────────

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.title);
    setShowDropdown(false);
    saveRecentSearch(suggestion.title);
    setRecentSearches(getRecentSearches());
    onSuggestionSelect(suggestion);
  };

  // ── Recent search click ────────────────────────────────────────────────────

  const handleRecentClick = (term: string) => {
    setQuery(term);
    setShowDropdown(false);
    onSearch(term);
  };

  const handleClearRecent = (e: React.MouseEvent, term: string) => {
    e.stopPropagation();
    const updated = getRecentSearches().filter((q) => q !== term);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setRecentSearches(updated);
  };

  // ── Radius cycle ───────────────────────────────────────────────────────────

  const cycleRadius = () => {
    const idx = RADIUS_OPTIONS.indexOf(radius);
    setRadius(RADIUS_OPTIONS[(idx + 1) % RADIUS_OPTIONS.length]);
  };

  // ── Focus / blur ───────────────────────────────────────────────────────────

  const handleFocus = () => {
    const recent = getRecentSearches();
    setRecentSearches(recent);
    if (query.trim().length === 0 && recent.length > 0) {
      setShowDropdown(true);
    } else if (suggestions.length > 0) {
      setShowDropdown(true);
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Render ─────────────────────────────────────────────────────────────────

  if (isHidden) return null;

  const showRecents = query.trim().length === 0 && recentSearches.length > 0;
  const dropdownItems = showRecents ? [] : suggestions;
  const isLoading = isSearching || isFetching;

  return (
    <div
      ref={containerRef}
      className="absolute top-4 left-4 z-[400] w-full max-w-sm"
    >
      {/* Search form */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <Button
          type="button"
          variant="secondary"
          size="icon"
          className="shadow-md hidden sm:inline-flex flex-none"
          onClick={onMenuClick}
          aria-label="Abrir menu"
        >
          <Menu className="h-4 w-4" />
        </Button>

        <div className="relative flex-1">
          {/* Search / loading icon */}
          {isLoading ? (
            <Loader2 className="absolute left-2.5 top-2.5 h-4 w-4 animate-spin text-primary z-10 pointer-events-none" />
          ) : (
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground z-10 pointer-events-none" />
          )}

          <Input
            ref={inputRef}
            value={query}
            onChange={handleInputChange}
            onFocus={handleFocus}
            type="text"
            placeholder="Buscar endereço ou projeto..."
            aria-label="Buscar no mapa"
            aria-autocomplete="list"
            aria-expanded={showDropdown}
            className="w-full bg-background dark:bg-background pl-8 shadow-md pr-20"
            autoComplete="off"
          />

          {/* Right side: radius badge + locate button */}
          <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
            <button
              type="button"
              onClick={cycleRadius}
              title={`Raio: ${radius}km — clique para alterar`}
              className="text-[10px] font-semibold text-muted-foreground hover:text-primary px-1.5 py-0.5 rounded transition-colors tabular-nums"
            >
              {radius}km
            </button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={cn(
                "h-8 w-8 text-muted-foreground hover:text-primary",
                isLocating && "text-primary",
              )}
              onClick={() => onNearMeClick?.(radius)}
              disabled={isLocating}
              title={
                isLocating
                  ? "Obtendo localização..."
                  : `Projetos próximos (${radius}km)`
              }
              aria-label="Mostrar projetos próximos a mim"
            >
              {isLocating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Locate className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </form>

      {/* Dropdown: recents or autocomplete suggestions */}
      {showDropdown && (showRecents || dropdownItems.length > 0) && (
        <div
          className="absolute top-full mt-1 left-0 right-0 sm:left-[calc(2.5rem+8px)] bg-background rounded-lg border shadow-lg overflow-hidden z-[401]"
          role="listbox"
        >
          {showRecents ? (
            <>
              <p className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Buscas recentes
              </p>
              {recentSearches.map((term) => (
                <button
                  key={term}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleRecentClick(term);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-accent transition-colors group"
                  role="option"
                  aria-selected={false}
                >
                  <Clock className="h-3.5 w-3.5 flex-none text-muted-foreground" />
                  <span className="flex-1 text-sm truncate">{term}</span>
                  <span
                    role="button"
                    tabIndex={-1}
                    onMouseDown={(e) =>
                      handleClearRecent(e as unknown as React.MouseEvent, term)
                    }
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-muted"
                    title="Remover"
                    aria-label={`Remover ${term} do histórico`}
                  >
                    <X className="h-3 w-3 text-muted-foreground" />
                  </span>
                </button>
              ))}
            </>
          ) : (
            dropdownItems.map((s, i) => (
              <button
                key={i}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSuggestionClick(s);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-accent transition-colors"
                role="option"
                aria-selected={false}
              >
                <span className="flex-none text-muted-foreground">
                  {s.type === "project" ? (
                    <FolderOpen className="h-4 w-4" />
                  ) : (
                    <MapPin className="h-4 w-4" />
                  )}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-medium truncate">
                    {s.title}
                  </span>
                  {s.subtitle && (
                    <span className="block text-xs text-muted-foreground truncate">
                      {s.subtitle}
                    </span>
                  )}
                </span>
                {s.type === "project" && (
                  <span className="flex-none text-[10px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                    Projeto
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
