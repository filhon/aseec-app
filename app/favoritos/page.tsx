"use client";

import { useFavorites, FavoriteItem, FavoriteType } from "@/hooks/use-favorites";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FavoriteButton } from "@/components/ui/favorite-button";
import { useState } from "react";
import Link from "next/link";
import { MapPin, Building2, Globe, FolderHeart, ChevronDown, ChevronUp, ExternalLink, Heart } from "lucide-react";

export default function FavoritesPage() {
  const { items, getItemsByType } = useFavorites();

  const projects = getItemsByType('project');
  const countries = getItemsByType('country');
  const entities = getItemsByType('entity');
  const addresses = getItemsByType('address');

  // Check if there are any favorites at all
  const hasFavorites = items.length > 0;

  return (
    <div className="space-y-6 pt-2 pb-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Favoritos</h1>
          <p className="text-muted-foreground mt-1">Gerencie seus projetos, locais e entidades favoritas.</p>
        </div>
      </div>

      {!hasFavorites ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed rounded-lg bg-muted/10 h-[50vh]">
            <div className="bg-muted p-4 rounded-full mb-4">
                <Heart className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Nenhum favorito ainda</h2>
            <p className="text-muted-foreground max-w-md mb-6">
                Você ainda não adicionou nenhum item aos favoritos. Navegue pelos projetos, países ou entidades e clique no ícone de coração para salvar o que é importante para você.
            </p>
            <div className="flex gap-4">
                <Link href="/projetos">
                    <Button>Explorar Projetos</Button>
                </Link>
                <Link href="/dashboard">
                    <Button variant="outline">Ir para Dashboard</Button>
                </Link>
            </div>
        </div>
      ) : (
        <div className="grid gap-6">
            <FavoritesSection 
                title="Projetos" 
                icon={FolderHeart} 
                items={projects} 
                description="Projetos missionários e sociais que você acompanha."
            />
            
            <FavoritesSection 
                title="Países" 
                icon={Globe} 
                items={countries} 
                description="Países com atuação missionária."
            />

            <FavoritesSection 
                title="Entidades" 
                icon={Building2} 
                items={entities} 
                description="Igrejas, ONGs e instituições parceiras."
            />

            <FavoritesSection 
                title="Endereços" 
                icon={MapPin} 
                items={addresses} 
                description="Locais específicos salvos."
            />
        </div>
      )}
    </div>
  );
}

function FavoritesSection({ 
    title, 
    icon: Icon, 
    items, 
    description
}: { 
    title: string; 
    icon: React.ElementType; 
    items: FavoriteItem[]; 
    description?: string;
}) {
    const [expanded, setExpanded] = useState(false);
    
    if (items.length === 0) return null;

    const visibleItems = expanded ? items : items.slice(0, 5);
    const hasMore = items.length > 5;

    // Helper to fix link path for entities if needed
    const getLink = (id: string, type: FavoriteType) => {
        if (type === 'entity') return `/dashboard/entidades/${id}`;
        if (type === 'project') return `/projetos/${id}`;
        if (type === 'country') return `/dashboard/paises/${id}`; // id here is usually the slug
        return '#';
    };

    return (
        <Card className="shadow-sm border-l-4 border-l-primary/20 hover:border-l-primary transition-all">
            <CardHeader className="pb-3 border-b bg-muted/20">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-background rounded-full shadow-sm">
                        <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <CardTitle className="text-lg">{title}</CardTitle>
                        {description && <CardDescription>{description}</CardDescription>}
                    </div>
                    <span className="ml-auto text-xs text-muted-foreground font-medium bg-background px-2 py-1 rounded-full border">
                        {items.length} {items.length === 1 ? 'item' : 'itens'}
                    </span>
                </div>
            </CardHeader>
            <CardContent className="pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {visibleItems.map((item) => (
                        <div key={item.id} className="group relative flex items-start gap-3 p-3 rounded-lg border hover:shadow-md transition-all hover:bg-muted/30 bg-card">
                            {item.image ? (
                                <div className="w-12 h-12 rounded-md bg-muted overflow-hidden shrink-0 border relative">
                                     {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                </div>
                            ) : (
                                <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center shrink-0 border">
                                    <Icon className="w-6 h-6 text-muted-foreground/50" />
                                </div>
                            )}
                            
                            <div className="flex-1 min-w-0">
                                <Link href={getLink(item.id, item.type)} className="block focus:outline-none">
                                    <h3 className="font-semibold text-sm truncate group-hover:text-primary transition-colors flex items-center gap-1">
                                        {item.title}
                                        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground" />
                                    </h3>
                                    {item.subtitle && (
                                        <p className="text-xs text-muted-foreground truncate">{item.subtitle}</p>
                                    )}
                                </Link>
                                
                                <div className="mt-2 flex items-center justify-between">
                                    <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                        {new Date().toLocaleDateString('pt-BR')}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity focus-within:opacity-100">
                                <FavoriteButton 
                                    id={item.id} 
                                    type={item.type} 
                                    title={item.title} 
                                    subtitle={item.subtitle}
                                    className="h-7 w-7" 
                                />
                            </div>
                        </div>
                    ))}
                </div>

                {hasMore && (
                    <div className="mt-4 flex justify-center">
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setExpanded(!expanded)}
                            className="text-muted-foreground hover:text-foreground text-xs gap-1"
                        >
                            {expanded ? (
                                <>Ver menos <ChevronUp className="w-3 h-3" /></>
                            ) : (
                                <>Ver mais {items.length - 5} itens <ChevronDown className="w-3 h-3" /></>
                            )}
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
