"use client"

import { useState } from "react"
import { ProjectPost, ProjectPostComment } from "./data"
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Toggle } from "@/components/ui/toggle"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import {
    Heart, MessageSquare, MoreHorizontal,
    FileText, Video,
    Eye, Send, X, HandHeart
} from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { togglePostReaction, addPostComment, deletePostComment, updatePostComment } from "@/lib/services/project-service"
import { toast } from "sonner"

interface FeedPostProps {
    post: ProjectPost
    projectTitle?: string // Optional context for global feeds
}

export function FeedPost({ post, projectTitle }: FeedPostProps) {
    const [likes, setLikes] = useState(post.likes || 0)
    const [liked, setLiked] = useState(false)

    const [prayers, setPrayers] = useState(post.prayers || 0)
    const [prayed, setPrayed] = useState(false)

    const [comments, setComments] = useState<ProjectPostComment[]>(post.comments || [])
    const [showComments, setShowComments] = useState(false)
    const [newComment, setNewComment] = useState("")

    const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
    const [editedCommentContent, setEditedCommentContent] = useState("")

    const [previewFile, setPreviewFile] = useState<{ url: string, type: 'image' | 'video' | 'document', title: string } | null>(null)
    const [isPreviewOpen, setIsPreviewOpen] = useState(false)

    const handleLike = async (pressed: boolean) => {
        // Optimistic update
        setLiked(pressed)
        setLikes(prev => pressed ? prev + 1 : prev - 1)
        try {
            await togglePostReaction(post.id, 'like', pressed)
        } catch (error) {
            console.error("Failed to toggle like:", error)
            // Revert on failure
            setLiked(!pressed)
            setLikes(prev => !pressed ? prev + 1 : prev - 1)
            toast.error("Erro ao curtir a publicação.")
        }
    }

    const handlePray = async (pressed: boolean) => {
        // Optimistic update
        setPrayed(pressed)
        setPrayers(prev => pressed ? prev + 1 : prev - 1)
        try {
            await togglePostReaction(post.id, 'prayer', pressed)
        } catch (error) {
            console.error("Failed to toggle prayer:", error)
            // Revert on failure
            setPrayed(!pressed)
            setPrayers(prev => !pressed ? prev + 1 : prev - 1)
            toast.error("Erro ao orar pela publicação.")
        }
    }

    const handleComment = async () => {
        if (!newComment.trim()) return

        const commentText = newComment
        setNewComment("") // Clear input immediately for better UX

        try {
            const dbComment = await addPostComment(post.id, commentText)
            const comment: ProjectPostComment = {
                id: dbComment?.id || Math.random().toString(),
                author: dbComment?.author_name || "Você",
                avatar: "",
                date: dbComment?.created_at || new Date().toISOString(),
                content: commentText
            }
            setComments(prev => [...prev, comment])
            toast.success("Comentário adicionado!")
        } catch (error) {
            console.error("Failed to add comment:", error)
            setNewComment(commentText) // Restore input on failure
            toast.error("Erro ao adicionar comentário.")
        }
    }

    const handleEditCommentSubmit = async (commentId: string) => {
        if (!editedCommentContent.trim()) return

        try {
            await updatePostComment(commentId, editedCommentContent)
            setComments(prev => prev.map(c =>
                c.id === commentId ? { ...c, content: editedCommentContent, updatedAt: new Date().toISOString() } : c
            ))
            setEditingCommentId(null)
            toast.success("Comentário atualizado!")
        } catch (error) {
            console.error("Failed to edit comment:", error)
            toast.error("Erro ao atualizar comentário.")
        }
    }

    const handleDeleteComment = async (commentId: string) => {
        if (!confirm("Tem certeza que deseja excluir este comentário?")) return

        try {
            await deletePostComment(commentId, post.id)
            setComments(prev => prev.filter(c => c.id !== commentId))
            toast.success("Comentário excluído!")
        } catch (error) {
            console.error("Failed to delete comment:", error)
            toast.error("Erro ao excluir comentário.")
        }
    }

    const handlePreview = (file: { url: string; type: 'image' | 'video' | 'document'; title: string }) => {
        setPreviewFile({
            url: file.url,
            type: file.type,
            title: file.title // Use title from ProjectAttachment
        })
        setIsPreviewOpen(true)
    }

    const getBadgeVariant = (type: string) => {
        switch (type) {
            case 'history': return "secondary"
            case 'testimonial': return "outline"
            case 'acknowledgment': return "default"
            case 'report': return "destructive" // Or a specific color
            default: return "secondary"
        }
    }

    const getBadgeLabel = (type: string) => {
        const labels: Record<string, string> = {
            history: "Histórico",
            testimonial: "Depoimento",
            acknowledgment: "Agradecimento",
            report: "Relatório",
            update: "Atualização",
            general: "Geral"
        }
        return labels[type] || type
    }

    return (
        <Card className="mb-6 overflow-hidden shadow-sm hover:shadow-md transition-all hover:border-primary/50">
            {/* Header */}
            <CardHeader className="flex flex-row items-start justify-between space-y-0 px-6 pt-0 pb-3">
                <div className="flex gap-4">
                    <Avatar className="h-10 w-10 border">
                        <AvatarImage src="https://github.com/shadcn.png" />
                        <AvatarFallback>{post.author[0]}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                        <div className="flex flex-col">
                            {projectTitle && (
                                <span className="text-[10px] uppercase font-bold text-primary mb-0.5 tracking-wide">{projectTitle}</span>
                            )}
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-sm leading-none">{post.author}</span>
                                {post.role && <span className="text-xs text-muted-foreground">• {post.role}</span>}
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground">{new Date(post.date).toLocaleDateString()} às {new Date(post.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant={getBadgeVariant(post.type)} className="capitalize font-normal text-xs px-2.5 py-0.5">
                        {getBadgeLabel(post.type)}
                    </Badge>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>

            {/* Content */}
            <CardContent className="px-6 py-0 space-y-4">
                {post.title && (
                    <h3 className="font-semibold text-xl leading-snug tracking-tight">{post.title}</h3>
                )}
                <div className="text-sm text-foreground/90 whitespace-pre-wrap leading-7">
                    {post.content}
                </div>

                {/* Attachments */}
                {post.attachments && post.attachments.length > 0 && (
                    <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {post.attachments.map((file, index) => (
                            <div
                                key={index}
                                className="group relative aspect-video flex items-center justify-center rounded-lg border bg-muted/40 overflow-hidden cursor-pointer hover:bg-muted/60 transition-colors"
                                onClick={() => handlePreview(file)}
                            >
                                {file.type === 'image' ? (
                                    <div className="relative w-full h-full">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={file.url}
                                            alt={file.title}
                                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <Eye className="h-6 w-6 text-white" />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-2 p-2 text-muted-foreground">
                                        {file.type === 'video' ? <Video className="h-8 w-8" /> : <FileText className="h-8 w-8" />}
                                        <span className="text-xs font-medium truncate max-w-full px-2">{file.title}</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>

            {/* Footer / Actions */}
            <CardFooter className="p-0 flex flex-col bg-muted/5">
                <div className="flex items-center w-full px-6 py-2 gap-1">
                    <Toggle
                        pressed={liked}
                        onPressedChange={handleLike}
                        variant="outline"
                        className="h-8 gap-2 px-3 border-transparent bg-transparent hover:bg-muted hover:text-foreground data-[state=on]:bg-red-50 data-[state=on]:text-red-600 dark:data-[state=on]:bg-red-950/20"
                    >
                        <Heart className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} />
                        <span className="text-xs font-medium">{likes > 0 ? likes : 'Curtir'}</span>
                    </Toggle>

                    <Toggle
                        pressed={prayed}
                        onPressedChange={handlePray}
                        variant="outline"
                        title="Orar por este projeto"
                        className="h-8 gap-2 px-3 border-transparent bg-transparent hover:bg-muted hover:text-foreground data-[state=on]:bg-blue-50 data-[state=on]:text-blue-600 dark:data-[state=on]:bg-blue-950/20"
                    >
                        <HandHeart className={`h-4 w-4 ${prayed ? 'fill-current' : ''}`} />
                        <span className="text-xs font-medium">{prayers > 0 ? prayers : 'Orar'}</span>
                    </Toggle>

                    <Toggle
                        pressed={showComments}
                        onPressedChange={setShowComments}
                        variant="outline"
                        className="h-8 gap-2 px-3 border-transparent bg-transparent hover:bg-muted hover:text-foreground data-[state=on]:bg-primary/10 data-[state=on]:text-primary"
                    >
                        <MessageSquare className="h-4 w-4" />
                        <span className="text-xs font-medium">{comments.length > 0 ? comments.length : 'Comentar'}</span>
                    </Toggle>
                </div>

                {/* Comments Section */}
                {showComments && (
                    <div className="w-full border-t bg-background px-4 pt-6 pb-2 space-y-4 animate-in slide-in-from-top-1">
                        <div className="w-full space-y-4">
                            {comments.length > 0 && (
                                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
                                    {comments.map((comment) => (
                                        <div key={comment.id} className="flex gap-3 text-sm group">
                                            <Avatar className="h-8 w-8 shrink-0">
                                                <AvatarImage src="https://github.com/shadcn.png" />
                                                <AvatarFallback className="text-xs">{comment.author[0]}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 bg-muted/30 p-3 rounded-md rounded-tl-none">
                                                <div className="flex items-start justify-between mb-1 gap-2">
                                                    <span className="font-semibold text-xs text-primary">{comment.author}</span>
                                                    <div className="flex items-center gap-1.5 shrink-0">
                                                        {comment.updatedAt && (
                                                            <span className="text-[9px] text-muted-foreground italic">(editado)</span>
                                                        )}
                                                        <span className="text-[10px] text-muted-foreground">{new Date(comment.date).toLocaleDateString()}</span>

                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" className="h-4 w-4 p-0 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <MoreHorizontal className="h-3 w-3 text-muted-foreground" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem onClick={() => {
                                                                    setEditingCommentId(comment.id)
                                                                    setEditedCommentContent(comment.content)
                                                                }}>
                                                                    Editar
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive" onClick={() => handleDeleteComment(comment.id)}>
                                                                    Excluir
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </div>
                                                {editingCommentId === comment.id ? (
                                                    <div className="mt-2 flex gap-2">
                                                        <Input
                                                            className="h-7 text-xs flex-1"
                                                            value={editedCommentContent}
                                                            onChange={(e) => setEditedCommentContent(e.target.value)}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') handleEditCommentSubmit(comment.id)
                                                                if (e.key === 'Escape') setEditingCommentId(null)
                                                            }}
                                                            autoFocus
                                                        />
                                                        <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => setEditingCommentId(null)}>
                                                            <X className="h-3 w-3" />
                                                        </Button>
                                                        <Button size="sm" className="h-7 px-2 text-[10px]" onClick={() => handleEditCommentSubmit(comment.id)}>
                                                            Salvar
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <p className="text-muted-foreground text-xs leading-relaxed">{comment.content}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="flex gap-3 items-end">
                                <Avatar className="h-8 w-8 shrink-0">
                                    <AvatarImage src="https://github.com/shadcn.png" />
                                    <AvatarFallback className="bg-primary/10 text-primary text-xs">EU</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 relative">
                                    <Input
                                        placeholder="Escreva um comentário..."
                                        className="pr-10 min-h-[40px] py-2 text-sm bg-muted/20 border-transparent focus:bg-background focus:border-input transition-all"
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleComment()}
                                    />
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="absolute right-1 top-1 h-8 w-8 text-primary hover:bg-primary/10 hover:text-primary"
                                        onClick={handleComment}
                                        disabled={!newComment.trim()}
                                    >
                                        <Send className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </CardFooter>

            {/* Preview Dialog */}
            <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                <DialogContent className="max-w-4xl w-full p-0 overflow-hidden bg-black/95 border-none text-white ring-0 outline-none">
                    <DialogTitle className="sr-only">Visualização do Anexo</DialogTitle>
                    {previewFile && (
                        <div className="relative flex items-center justify-center min-h-[50vh] max-h-[85vh]">
                            {previewFile.type === 'image' ? (
                                <>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={previewFile.url} alt={previewFile.title} className="max-w-full max-h-[85vh] object-contain" />
                                </>
                            ) : previewFile.type === 'video' ? (
                                <video src={previewFile.url} controls className="max-w-full max-h-[85vh]" />
                            ) : null}
                            <div className="absolute top-4 right-4 z-50">
                                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-full" onClick={() => setIsPreviewOpen(false)}>
                                    <X className="h-6 w-6" />
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </Card>
    )
}


