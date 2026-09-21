"use client";

import { cn } from "@/lib/utils/cn";
import { useEffect, useRef, useState } from "react";

export interface CourseComboboxProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  autoFocus?: boolean;
}

/**
 * Free-text course input with a live typeahead against the course catalogue.
 * Typing a value that matches nothing is still allowed — it's what feeds the
 * admin "unmatched" report that grows the catalogue over time.
 */
export function CourseCombobox({
  id,
  value,
  onChange,
  onBlur,
  placeholder,
  className,
  disabled,
  autoFocus,
}: CourseComboboxProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const query = value.trim();
    if (!isOpen || query.length === 0) {
      setSuggestions([]);
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => {
      fetch(`/api/courses/suggestions?q=${encodeURIComponent(query)}`, {
        signal: controller.signal,
      })
        .then((response) => (response.ok ? response.json() : null))
        .then((payload) => {
          setSuggestions(payload?.data?.suggestions ?? []);
        })
        .catch(() => {
          // Typeahead is a convenience; a failed lookup just shows no suggestions.
        });
    }, 250);

    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [value, isOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function selectSuggestion(suggestion: string) {
    onChange(suggestion);
    setIsOpen(false);
    setSuggestions([]);
  }

  const showMenu = isOpen && suggestions.length > 0;

  return (
    <div ref={containerRef} className="relative">
      <input
        id={id}
        type="text"
        value={value}
        disabled={disabled}
        autoFocus={autoFocus}
        autoComplete="off"
        role="combobox"
        aria-expanded={showMenu}
        aria-autocomplete="list"
        placeholder={placeholder}
        onChange={(event) => {
          onChange(event.target.value);
          setIsOpen(true);
          setActiveIndex(-1);
        }}
        onFocus={() => setIsOpen(true)}
        onBlur={onBlur}
        onKeyDown={(event) => {
          if (!showMenu) return;

          if (event.key === "ArrowDown") {
            event.preventDefault();
            setActiveIndex((current) => (current + 1) % suggestions.length);
          } else if (event.key === "ArrowUp") {
            event.preventDefault();
            setActiveIndex((current) =>
              current <= 0 ? suggestions.length - 1 : current - 1,
            );
          } else if (event.key === "Enter" && activeIndex >= 0) {
            event.preventDefault();
            selectSuggestion(suggestions[activeIndex]);
          } else if (event.key === "Escape") {
            setIsOpen(false);
          }
        }}
        className={className}
      />

      {showMenu ? (
        <div className="absolute z-50 mt-2 w-full min-w-[max-content] overflow-hidden rounded-xl border border-white/10 bg-[#121212] py-1 shadow-2xl">
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion}
              role="option"
              aria-selected={index === activeIndex}
              onMouseDown={(event) => {
                event.preventDefault();
                selectSuggestion(suggestion);
              }}
              onMouseEnter={() => setActiveIndex(index)}
              className={cn(
                "cursor-pointer select-none px-4 py-2.5 text-sm text-white/80 transition-colors",
                index === activeIndex ? "bg-white/10" : "hover:bg-white/10",
              )}
            >
              {suggestion}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
