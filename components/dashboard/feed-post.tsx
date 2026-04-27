"use client";

import { useState } from "react";
import { ProjectPost, ProjectPostComment } from "./data";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  Heart,
  MessageSquare,
  MoreHorizontal,
  FileText,
  Video,
  Eye,
  Send,
  X,
  HandHeart,
  Loader2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  togglePostReaction,
  addPostComment,
  deletePostComment,
  updatePostComment,
} from "@/lib/services/project-service";
import { toast } from "sonner";

interface FeedPostProps {
  post: ProjectPost;
  projectTitle?: string; // Optional context for global feeds
}

export function FeedPost({ post, projectTitle }: FeedPostProps) {
  const [likes, setLikes] = useState(post.likes || 0);
  const [liked, setLiked] = useState(false);

  const [prayers, setPrayers] = useState(post.prayers || 0);
  const [prayed, setPrayed] = useState(false);

  const [comments, setComments] = useState<ProjectPostComment[]>(
    post.comments || [],
  );
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");

  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editedCommentContent, setEditedCommentContent] = useState("");

  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [savingCommentId, setSavingCommentId] = useState<string | null>(null);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(
    null,
  );

  const [previewFile, setPreviewFile] = useState<{
    id: string;
    url: string;
    type: "image" | "video" | "document";
    title: string;
    originalUrl?: string;
  } | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleLike = async (pressed: boolean) => {
    // Optimistic update
    setLiked(pressed);
    setLikes((prev) => (pressed ? prev + 1 : prev - 1));
    try {
      await togglePostReaction(post.id, "like", pressed);
    } catch (error) {
      console.error("Failed to toggle like:", error);
      // Revert on failure
      setLiked(!pressed);
      setLikes((prev) => (!pressed ? prev + 1 : prev - 1));
      toast.error("Erro ao curtir a publicação.");
    }
  };

  const handlePray = async (pressed: boolean) => {
    // Optimistic update
    setPrayed(pressed);
    setPrayers((prev) => (pressed ? prev + 1 : prev - 1));
    try {
      await togglePostReaction(post.id, "prayer", pressed);
    } catch (error) {
      console.error("Failed to toggle prayer:", error);
      // Revert on failure
      setPrayed(!pressed);
      setPrayers((prev) => (!pressed ? prev + 1 : prev - 1));
      toast.error("Erro ao orar pela publicação.");
    }
  };

  const handleComment = async () => {
    if (!newComment.trim() || isSubmittingComment) return;

    const commentText = newComment;
    const tempId = `temp-${Date.now()}`;

    // Optimistic: show immediately with a temp id
    const optimisticComment: ProjectPostComment = {
      id: tempId,
      author: "Você",
      date: new Date().toISOString(),
      content: commentText,
    };
    setComments((prev) => [...prev, optimisticComment]);
    setNewComment("");
    setIsSubmittingComment(true);

    try {
      const dbComment = await addPostComment(post.id, commentText);
      // Replace the optimistic entry with the real one from DB
      setComments((prev) =>
        prev.map((c) =>
          c.id === tempId
            ? {
                id: dbComment?.id || tempId,
                author: dbComment?.author_name || "Você",
                date: dbComment?.created_at || new Date().toISOString(),
                content: commentText,
              }
            : c,
        ),
      );
    } catch (error) {
      console.error("Failed to add comment:", error);
      // Remove optimistic comment on failure
      setComments((prev) => prev.filter((c) => c.id !== tempId));
      setNewComment(commentText);
      toast.error("Erro ao adicionar comentário.");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleEditCommentSubmit = async (commentId: string) => {
    if (!editedCommentContent.trim()) return;

    // Optimistic: update immediately
    const previousContent = comments.find((c) => c.id === commentId)?.content;
    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId
          ? {
              ...c,
              content: editedCommentContent,
              updatedAt: new Date().toISOString(),
            }
          : c,
      ),
    );
    setEditingCommentId(null);
    setSavingCommentId(commentId);

    try {
      await updatePostComment(commentId, editedCommentContent);
    } catch (error) {
      console.error("Failed to edit comment:", error);
      // Revert on failure
      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId
            ? {
                ...c,
                content: previousContent ?? c.content,
                updatedAt: undefined,
              }
            : c,
        ),
      );
      toast.error("Erro ao atualizar comentário.");
    } finally {
      setSavingCommentId(null);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("Tem certeza que deseja excluir este comentário?")) return;

    // Optimistic: mark as deleting for fade-out, then remove
    setDeletingCommentId(commentId);

    try {
      await deletePostComment(commentId, post.id);
      // Small delay so transition plays
      setTimeout(() => {
        setComments((prev) => prev.filter((c) => c.id !== commentId));
        setDeletingCommentId(null);
      }, 300);
    } catch (error) {
      console.error("Failed to delete comment:", error);
      setDeletingCommentId(null);
      toast.error("Erro ao excluir comentário.");
    }
  };

  const handlePreview = (file: {
    id: string;
    url: string;
    type: "image" | "video" | "document";
    title: string;
    originalUrl?: string;
  }) => {
    setPreviewFile({
      id: file.id,
      url: file.url,
      type: file.type,
      title: file.title,
      originalUrl: file.originalUrl,
    });
    setIsPreviewOpen(true);
  };

  const getBadgeVariant = (type: string) => {
    switch (type) {
      case "history":
        return "secondary";
      case "testimonial":
        return "outline";
      case "acknowledgment":
        return "default";
      case "report":
        return "destructive"; // Or a specific color
      default:
        return "secondary";
    }
  };

  const getBadgeLabel = (type: string) => {
    const labels: Record<string, string> = {
      history: "Histórico",
      testimonial: "Depoimento",
      acknowledgment: "Agradecimento",
      report: "Relatório",
      update: "Atualização",
      general: "Geral",
    };
    return labels[type] || type;
  };

  return (
    <Card className="mb-6 overflow-hidden shadow-sm border border-border/50 rounded-3xl hover:shadow-md transition-all">
      {/* Header */}
      <CardHeader className="flex flex-row items-start justify-between space-y-0 px-6 pt-6 pb-4">
        <div className="flex gap-4">
          <Avatar className="h-12 w-12 border-0">
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>{post.author[0]}</AvatarFallback>
          </Avatar>
          <div className="space-y-0.5">
            <div className="flex flex-col">
              {projectTitle && (
                <span className="text-[10px] uppercase font-bold text-primary mb-0.5 tracking-wide">
                  {projectTitle}
                </span>
              )}
              <div className="flex items-center gap-2">
                <span className="font-bold text-base leading-none text-foreground">
                  {post.author}
                </span>
                <Badge
                  variant={getBadgeVariant(post.type)}
                  className="capitalize font-normal text-[10px] px-1.5 py-0 h-4"
                >
                  {getBadgeLabel(post.type)}
                </Badge>
                {post.role && (
                  <span className="text-xs text-muted-foreground hidden sm:inline-block">
                    • {post.role}
                  </span>
                )}
              </div>
            </div>
            <p className="text-sm text-muted-foreground font-medium mt-1">
              Postado em {new Date(post.date).toLocaleDateString()} às{" "}
              {new Date(post.date).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-muted-foreground rounded-full hover:bg-muted"
          >
            <MoreHorizontal className="h-5 w-5" />
          </Button>
        </div>
      </CardHeader>

      {/* Content */}
      <CardContent className="px-6 py-0 space-y-4">
        {post.title && (
          <h3 className="font-semibold text-xl leading-snug tracking-tight">
            {post.title}
          </h3>
        )}
        <div className="text-[15px] sm:text-base text-foreground/90 whitespace-pre-wrap leading-relaxed">
          {post.content}
        </div>

        {/* Attachments */}
        {post.attachments && post.attachments.length > 0 && (
          <div
            className={`mt-4 grid gap-3 ${post.attachments.length > 1 ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-1"}`}
          >
            {post.attachments.map((file, index) => (
              <div
                key={index}
                className={`group relative flex items-center justify-center rounded-2xl sm:rounded-[24px] border border-muted-foreground/10 bg-muted/10 overflow-hidden cursor-pointer hover:opacity-90 transition-opacity ${post.attachments?.length === 1 ? "aspect-video" : "aspect-square"}`}
                onClick={() => handlePreview(file)}
              >
                {file.type === "image" ? (
                  <div className="relative w-full h-full">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={file.thumbnailUrl || file.url}
                      alt={file.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        // Fallback to default drive icon if image blocks us
                        e.currentTarget.style.display = "none";
                        e.currentTarget.parentElement!.innerHTML =
                          '<div class="absolute inset-0 flex flex-col items-center justify-center bg-muted/60 text-muted-foreground gap-2"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-image"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg><span class="text-[10px] font-medium px-2 truncate w-full text-center">Abrir Imagem</span></div>';
                      }}
                    />
                    <div className="absolute top-4 right-4 bg-black/40 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                      <Eye className="h-5 w-5 text-white" />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 p-2 text-muted-foreground">
                    {file.type === "video" ? (
                      <Video className="h-8 w-8" />
                    ) : (
                      <FileText className="h-8 w-8" />
                    )}
                    <span className="text-xs font-medium truncate max-w-[80%] px-2 text-center">
                      {file.title}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Footer / Actions */}
      <CardFooter className="p-0 flex flex-col pt-5 pb-5">
        <div className="flex items-center justify-between w-full px-6">
          <div className="flex items-center gap-6">
            <button
              onClick={() => handleLike(!liked)}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
            >
              <Heart
                className={`h-[22px] w-[22px] transition-colors group-hover:text-red-500 ${liked ? "fill-red-500 text-red-500" : ""}`}
              />
              <span className="text-[15px] font-bold text-foreground">
                {likes > 0 ? likes : "Curtir"}
              </span>
            </button>

            <button
              onClick={() => handlePray(!prayed)}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
              title="Orar por este projeto"
            >
              <HandHeart
                className={`h-[22px] w-[22px] transition-colors group-hover:text-blue-500 ${prayed ? "fill-blue-500 text-blue-500" : ""}`}
              />
              <span className="text-[15px] font-bold text-foreground">
                {prayers > 0 ? prayers : "Orar"}
              </span>
            </button>

            <button
              onClick={() => setShowComments(!showComments)}
              className={`flex items-center gap-2 transition-colors group ${showComments ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
            >
              <MessageSquare
                className={`h-[22px] w-[22px] transition-colors group-hover:text-primary ${showComments ? "fill-primary text-primary" : ""}`}
              />
              <span className="text-[15px] font-bold text-foreground">
                {comments.length > 0 ? comments.length : "Comentar"}
              </span>
            </button>
          </div>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="w-full border-t bg-background px-4 pt-6 pb-2 space-y-4 animate-in slide-in-from-top-1">
            <div className="w-full space-y-4">
              {comments.length > 0 && (
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
                  {comments.map((comment) => (
                    <div
                      key={comment.id}
                      className={`flex gap-3 text-sm group transition-all duration-300 ${
                        deletingCommentId === comment.id
                          ? "opacity-0 scale-95 pointer-events-none"
                          : "opacity-100"
                      } ${comment.id.startsWith("temp-") ? "opacity-60" : ""}`}
                    >
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarImage src="https://github.com/shadcn.png" />
                        <AvatarFallback className="text-xs">
                          {comment.author[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 bg-muted/30 p-3 rounded-md rounded-tl-none">
                        <div className="flex items-start justify-between mb-1 gap-2">
                          <span className="font-semibold text-xs text-primary">
                            {comment.author}
                          </span>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {comment.updatedAt && (
                              <span className="text-[9px] text-muted-foreground italic">
                                (editado)
                              </span>
                            )}
                            <span className="text-[10px] text-muted-foreground">
                              {new Date(comment.date).toLocaleDateString()}
                            </span>

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  className="h-4 w-4 p-0 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <MoreHorizontal className="h-3 w-3 text-muted-foreground" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => {
                                    setEditingCommentId(comment.id);
                                    setEditedCommentContent(comment.content);
                                  }}
                                >
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                                  onClick={() =>
                                    handleDeleteComment(comment.id)
                                  }
                                >
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
                              onChange={(e) =>
                                setEditedCommentContent(e.target.value)
                              }
                              onKeyDown={(e) => {
                                if (e.key === "Enter")
                                  handleEditCommentSubmit(comment.id);
                                if (e.key === "Escape")
                                  setEditingCommentId(null);
                              }}
                              autoFocus
                            />
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 px-2"
                              onClick={() => setEditingCommentId(null)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              className="h-7 px-2 text-[10px] min-w-[52px]"
                              onClick={() =>
                                handleEditCommentSubmit(comment.id)
                              }
                              disabled={savingCommentId === comment.id}
                            >
                              {savingCommentId === comment.id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                "Salvar"
                              )}
                            </Button>
                          </div>
                        ) : (
                          <p className="text-muted-foreground text-xs leading-relaxed">
                            {comment.content}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-3 items-end">
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    EU
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 relative">
                  <Input
                    placeholder="Escreva um comentário..."
                    className="pr-10 min-h-[40px] py-2 text-sm bg-muted/20 border-transparent focus:bg-background focus:border-input transition-all"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleComment()}
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute right-1 top-1 h-8 w-8 text-primary hover:bg-primary/10 hover:text-primary"
                    onClick={handleComment}
                    disabled={!newComment.trim() || isSubmittingComment}
                  >
                    {isSubmittingComment ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
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
              {previewFile.type === "image" ? (
                previewFile.originalUrl &&
                previewFile.originalUrl.includes("drive.google") ? (
                  <div className="flex flex-col items-center gap-4 w-full h-full p-4">
                    <iframe
                      src={`https://drive.google.com/file/d/${previewFile.id}/preview`}
                      className="w-full min-h-[70vh] bg-neutral-900 rounded border-0"
                      allowFullScreen
                    />
                    <a
                      href={previewFile.originalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-white/70 hover:text-white underline"
                    >
                      Abrir no Google Drive
                    </a>
                  </div>
                ) : (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={previewFile.url}
                    alt={previewFile.title}
                    className="max-w-full max-h-[85vh] object-contain"
                    referrerPolicy="no-referrer"
                  />
                )
              ) : previewFile.type === "video" ? (
                <iframe
                  src={
                    previewFile.originalUrl?.replace("/view", "/preview") ||
                    previewFile.url
                  }
                  className="w-full min-h-[60vh] border-0"
                  allow="autoplay"
                  allowFullScreen
                />
              ) : (
                // Document: show embedded + link to open in Drive
                <div className="flex flex-col items-center gap-4 w-full h-full p-4">
                  <iframe
                    src={
                      previewFile.originalUrl?.replace("/view", "/preview") ||
                      previewFile.url
                    }
                    className="w-full min-h-[60vh] bg-white rounded border-0"
                    allowFullScreen
                  />
                  <a
                    href={previewFile.url.replace("/preview", "/view")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-white/70 hover:text-white underline"
                  >
                    Abrir no Google Drive
                  </a>
                </div>
              )}
              <div className="absolute top-4 right-4 z-50">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20 rounded-full"
                  onClick={() => setIsPreviewOpen(false)}
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
