"use client";

import { Button } from "@/components/ui/button";
import { useFavorites, FavoriteType } from "@/hooks/use-favorites";
import { cn } from "@/lib/utils";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState } from "react";

interface FavoriteButtonProps {
  id: string;
  type: FavoriteType;
  title: string;
  subtitle?: string;
  image?: string;
  metadata?: Record<string, any>;
  className?: string;
  variant?: "icon" | "full";
}

export function FavoriteButton({
  id,
  type,
  title,
  subtitle,
  image,
  metadata,
  className,
  variant = "icon",
}: FavoriteButtonProps) {
  const { isFavorite, addItem, removeItem } = useFavorites();
  const [favorited, setFavorited] = useState(false);

  // Sync with store on mount and updates
  useEffect(() => {
    setFavorited(isFavorite(id));
  }, [id, isFavorite]);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (favorited) {
      removeItem(id);
      toast.success("Removido dos favoritos");
    } else {
      addItem({ id, type, title, subtitle, image, metadata });
      toast.success("Adicionado aos favoritos", {
        description: `${title} foi salvo na sua lista.`
      });
    }
    // Optimistic update
    setFavorited(!favorited);
  };

  if (variant === "full") {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleToggle}
        className={cn("gap-2", className)}
      >
        <Heart
          className={cn(
            "h-4 w-4 transition-colors",
            favorited ? "fill-red-500 text-red-500" : "text-muted-foreground"
          )}
        />
        {favorited ? "Favorito" : "Favoritar"}
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      className={cn("h-8 w-8 hover:bg-transparent", className)}
      title={favorited ? "Remover dos favoritos" : "Adicionar aos favoritos"}
    >
      <Heart
        className={cn(
          "h-5 w-5 transition-all duration-300",
          favorited 
            ? "fill-red-500 text-red-500 scale-110" 
            : "text-muted-foreground hover:text-red-500 hover:scale-110"
        )}
      />
    </Button>
  );
}
