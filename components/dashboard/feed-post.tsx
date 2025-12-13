"use client"

import { useState } from "react"
import { ProjectPost, ProjectAttachment } from "./data"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { 
    Clock, MessageSquare, Heart, FileText, Image as ImageIcon, 
    Video, File, User, Calendar, ExternalLink
} from "lucide-react"

interface FeedPostProps {
    post: ProjectPost
}

export function FeedPost({ post }: FeedPostProps) {
    const getIcon = () => {
        switch (post.type) {
            case 'history': return <Clock className="h-4 w-4" />
            case 'testimonial': return <MessageSquare className="h-4 w-4" />
            case 'acknowledgment': return <Heart className="h-4 w-4" />
            case 'report': return <FileText className="h-4 w-4" />
            default: return <FileText className="h-4 w-4" />
        }
    }

    const getBadgeColor = () => {
        switch (post.type) {
            case 'history': return 'bg-blue-100 text-blue-700 hover:bg-blue-100/80 dark:bg-blue-900/30 dark:text-blue-400'
            case 'testimonial': return 'bg-purple-100 text-purple-700 hover:bg-purple-100/80 dark:bg-purple-900/30 dark:text-purple-400'
            case 'acknowledgment': return 'bg-pink-100 text-pink-700 hover:bg-pink-100/80 dark:bg-pink-900/30 dark:text-pink-400'
            case 'report': return 'bg-orange-100 text-orange-700 hover:bg-orange-100/80 dark:bg-orange-900/30 dark:text-orange-400'
            default: return 'bg-gray-100 text-gray-700'
        }
    }

    const getBorderColorClass = () => {
        switch (post.type) {
            case 'history': return 'border-l-blue-500'
            case 'testimonial': return 'border-l-purple-500'
            case 'acknowledgment': return 'border-l-pink-500'
            case 'report': return 'border-l-orange-500'
            case 'update': return 'border-l-green-500'
            default: return 'border-l-gray-300'
        }
    }

    const getLabel = () => {
        switch (post.type) {
            case 'history': return 'Histórico'
            case 'testimonial': return 'Depoimento'
            case 'acknowledgment': return 'Agradecimento'
            case 'report': return 'Relatório'
            case 'update': return 'Atualização'
            default: return 'Geral'
        }
    }

    const [previewFile, setPreviewFile] = useState<ProjectAttachment | null>(null)
    const [isPreviewOpen, setIsPreviewOpen] = useState(false)

    const getFileExtension = (filename: string) => {
        return filename.split('.').pop()?.toLowerCase() || ''
    }

    const getFileIconAndColor = (att: ProjectAttachment) => {
        // If type is explicitly image or video, use that
        if (att.type === 'image') return { icon: <ImageIcon className="h-5 w-5" />, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20", borderColor: "border-blue-200 dark:border-blue-800" }
        if (att.type === 'video') return { icon: <Video className="h-5 w-5" />, color: "text-red-500", bg: "bg-red-50 dark:bg-red-900/20", borderColor: "border-red-200 dark:border-red-800" }

        // Guess based on extension
        const ext = getFileExtension(att.url)
        
        switch (ext) {
            case 'pdf': 
                return { icon: <FileText className="h-5 w-5" />, color: "text-red-600", bg: "bg-red-50 dark:bg-red-900/20", borderColor: "border-red-200 dark:border-red-800" }
            case 'doc': 
            case 'docx': 
                return { icon: <FileText className="h-5 w-5" />, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20", borderColor: "border-blue-200 dark:border-blue-800" }
            case 'xls': 
            case 'xlsx': 
            case 'csv':
                return { icon: <FileText className="h-5 w-5" />, color: "text-green-600", bg: "bg-green-50 dark:bg-green-900/20", borderColor: "border-green-200 dark:border-green-800" }
            case 'ppt':
            case 'pptx':
                return { icon: <FileText className="h-5 w-5" />, color: "text-orange-600", bg: "bg-orange-50 dark:bg-orange-900/20", borderColor: "border-orange-200 dark:border-orange-800" }
            default: 
                return { icon: <File className="h-5 w-5" />, color: "text-gray-600", bg: "bg-gray-50 dark:bg-gray-800", borderColor: "border-gray-200 dark:border-gray-700" }
        }
    }

    const handleAttachmentClick = (att: ProjectAttachment) => {
        if (att.type === 'image' || att.type === 'video') {
            setPreviewFile(att)
            setIsPreviewOpen(true)
        } else {
            window.open(att.url, '_blank')
        }
    }

    return (
        <div className="relative pl-12 pb-4 group last:pb-0">
            {/* Timeline Dot with Icon */}
            <div className={`absolute left-0 top-0 p-2 rounded-full border shadow-sm bg-background z-10 text-muted-foreground hover:scale-110 transition-transform hover:border-primary/50 cursor-default`}>
                {getIcon()}
            </div>

            <Card className={`shadow-sm hover:shadow-md transition-all border-l-4 ${getBorderColorClass()}`}>
                <CardContent className="p-4 space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h4 className="text-sm font-semibold leading-none">{post.author}</h4>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                {post.role && <span>{post.role}</span>}
                                <span>•</span>
                                <div className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {post.date}
                                </div>
                            </div>
                        </div>
                        <Badge variant="secondary" className={`border-0 font-normal ${getBadgeColor()}`}>
                            {getLabel()}
                        </Badge>
                    </div>

                    {/* Content */}
                    <div className="pl-1">
                        {post.title && <h3 className="font-semibold text-base mb-1.5">{post.title}</h3>}
                        <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
                            {post.content}
                        </p>
                    </div>

                    {/* Attachments */}
                    {post.attachments && post.attachments.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2 pl-1">
                            {post.attachments.map(att => {
                                const style = getFileIconAndColor(att)
                                return (
                                    <div 
                                        key={att.id} 
                                        onClick={() => handleAttachmentClick(att)}
                                        className={`flex items-center gap-2.5 p-2 rounded-md border cursor-pointer hover:bg-muted/50 transition-colors group/att ${style.borderColor} bg-background`}
                                    >
                                        <div className={`h-8 w-8 shrink-0 rounded flex items-center justify-center ${style.bg} ${style.color}`}>
                                            {style.icon}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium truncate group-hover/att:text-primary transition-colors">{att.title}</p>
                                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                                                <span className="uppercase tracking-wider">{att.type === 'document' ? getFileExtension(att.url) : att.type}</span>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}

                    {/* Footer Actions (Likes, etc - Optional) */}
                    {post.likes !== undefined && post.likes > 0 && (
                         <div className="flex items-center gap-1 text-xs text-muted-foreground pt-2 border-t mt-2">
                             <Heart className="h-3 w-3 text-red-500 fill-red-500" />
                             <span>{post.likes} curtiram</span>
                         </div>
                    )}
                </CardContent>
            </Card>

            <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                <DialogContent className="max-w-4xl w-full p-0 overflow-hidden bg-black/95 border-none text-white">
                     <DialogTitle className="sr-only">Visualização do Anexo</DialogTitle>
                     {previewFile && (
                        <div className="relative flex items-center justify-center min-h-[50vh] max-h-[85vh]">
                            {previewFile.type === 'image' ? (
                                <img src={previewFile.url} alt={previewFile.title} className="max-w-full max-h-[85vh] object-contain" />
                            ) : previewFile.type === 'video' ? (
                                <video src={previewFile.url} controls className="max-w-full max-h-[85vh]" />
                            ) : (
                                <div className="text-center p-8">
                                    <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                                    <p>Visualização não disponível para este formato.</p>
                                    <Button variant="outline" onClick={() => window.open(previewFile.url, '_blank')} className="mt-4 text-black border-white bg-white hover:bg-white/90">
                                        Abrir em nova aba
                                    </Button>
                                </div>
                            )}
                        </div>
                     )}
                     <div className="absolute top-4 left-4 flex gap-2 z-50">
                         {previewFile && (
                             <Button size="icon" variant="ghost" className="text-white hover:bg-white/20 rounded-full bg-black/50" onClick={() => window.open(previewFile.url, '_blank')}>
                                 <ExternalLink className="h-4 w-4" />
                                 <span className="sr-only">Abrir em nova aba</span>
                             </Button>
                         )}
                     </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
