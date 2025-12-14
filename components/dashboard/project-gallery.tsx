"use client"

import { useState } from "react"
import { ProjectPost, ProjectAttachment } from "./data"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Image as ImageIcon, Video, X, Maximize2 } from "lucide-react"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

interface ProjectGalleryProps {
    feed: ProjectPost[]
}

interface GalleryItem {
    attachment: ProjectAttachment
    originalPost: ProjectPost
}

export function ProjectGallery({ feed }: ProjectGalleryProps) {
    const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null)

    // Extract all attachments with their source post
    const galleryItems: GalleryItem[] = feed.flatMap(post => 
        (post.attachments || []).map(attachment => ({
            attachment,
            originalPost: post
        }))
    ).filter(item => item.attachment.type === 'image' || item.attachment.type === 'video')

    if (galleryItems.length === 0) return null

    const renderItem = (item: GalleryItem, index: number) => (
        <div 
            key={`${item.originalPost.id}-${index}`}
            className="group relative aspect-square rounded-md overflow-hidden bg-muted cursor-pointer border hover:border-primary/50 transition-colors"
            onClick={() => setSelectedItem(item)}
        >
            {item.attachment.type === 'image' ? (
                <img 
                    src={item.attachment.url} 
                    alt={item.attachment.title} 
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted">
                    <Video className="h-8 w-8 text-muted-foreground" />
                </div>
            )}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <Maximize2 className="text-white h-6 w-6 drop-shadow-md" />
            </div>
        </div>
    )

    return (
        <>
            <Card className="h-fit">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <ImageIcon className="h-5 w-5 text-primary" />
                        Galeria do Projeto
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {galleryItems.length <= 3 ? (
                        <div className="grid grid-cols-3 gap-2">
                            {galleryItems.map((item, index) => renderItem(item, index))}
                        </div>
                    ) : (
                        <Carousel className="w-full" opts={{ align: "start" }}>
                            <CarouselContent className="-ml-2">
                                {galleryItems.map((item, index) => (
                                    <CarouselItem key={index} className="pl-2 basis-1/3">
                                        {renderItem(item, index)}
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                            <CarouselPrevious className="left-1 disabled:opacity-0" />
                            <CarouselNext className="right-1 disabled:opacity-0" />
                        </Carousel>
                    )}
                </CardContent>
            </Card>

            <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
                <DialogContent className="max-w-5xl w-[95vw] h-[90vh] p-0 overflow-hidden bg-black/95 border-none text-white ring-0 outline-none flex flex-col">
                    <DialogTitle className="sr-only">Visualização da Galeria</DialogTitle>
                    
                    <div className="relative flex-1 w-full h-full flex items-center justify-center bg-black">
                        {selectedItem && (
                            <>
                                {selectedItem.attachment.type === 'image' ? (
                                    <img 
                                        src={selectedItem.attachment.url} 
                                        alt={selectedItem.attachment.title} 
                                        className="max-w-full max-h-full object-contain"
                                    />
                                ) : (
                                     <video 
                                        src={selectedItem.attachment.url} 
                                        controls 
                                        className="max-w-full max-h-full" 
                                    />
                                )}

                                {/* Overlay Content */}
                                <div className="absolute bottom-0 left-0 right-0 p-8 pt-24 bg-gradient-to-t from-black via-black/80 to-transparent text-white">
                                    <h4 className="font-bold text-lg mb-2">{selectedItem.originalPost.title || "Sem título"}</h4>
                                    <p className="text-sm text-gray-200 line-clamp-3 md:line-clamp-none max-w-3xl">
                                        {selectedItem.originalPost.content}
                                    </p>
                                    <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
                                        <span>Postado por {selectedItem.originalPost.author}</span>
                                        <span>•</span>
                                        <span>{new Date(selectedItem.originalPost.date).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </>
                        )}

                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full z-50" 
                            onClick={() => setSelectedItem(null)}
                        >
                            <X className="h-6 w-6" />
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}
