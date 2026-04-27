"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const FOCUSABLE_SELECTORS =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  content?: React.ReactNode;
  className?: string;
}

export function Sidebar({
  isOpen,
  onClose,
  title = "Detalhes",
  content,
  className,
}: SidebarProps) {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const titleId = "sidebar-title";

  useEffect(() => {
    if (!isOpen) return;

    // Move focus to the first focusable element on open
    const firstFocusable =
      sidebarRef.current?.querySelector<HTMLElement>(FOCUSABLE_SELECTORS);
    firstFocusable?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }

      if (e.key !== "Tab") return;

      const focusable = Array.from(
        sidebarRef.current?.querySelectorAll<HTMLElement>(
          FOCUSABLE_SELECTORS,
        ) ?? [],
      );
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "absolute inset-0 z-[490] bg-black/40 backdrop-blur-sm transition-opacity duration-300",
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none",
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={sidebarRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        className={cn(
          "absolute top-0 left-0 z-[500] flex h-full w-full max-w-sm flex-col bg-background shadow-xl transition-transform duration-300 ease-in-out md:w-80",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {title && (
          <div className="flex items-center justify-between border-b p-4 shrink-0">
            <h2 id={titleId} className="text-lg font-semibold">
              {title}
            </h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
              <span className="sr-only">Fechar</span>
            </Button>
          </div>
        )}

        <div className={cn("flex-1 overflow-y-auto p-4", className)}>
          {content || (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Selecione um local no mapa para ver mais detalhes.
              </p>
              <div className="h-32 rounded-lg bg-muted/50" />
              <div className="h-8 w-3/4 rounded bg-muted/50" />
              <div className="h-8 w-1/2 rounded bg-muted/50" />
            </div>
          )}
        </div>

        {!title && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute top-2 right-2 z-10"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Fechar</span>
          </Button>
        )}
      </div>
    </>
  );
}
