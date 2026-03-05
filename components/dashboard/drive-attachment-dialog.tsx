"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { parseDriveLink, detectDriveType, isDriveUrl } from "@/lib/utils/drive"
import { ProjectAttachment } from "./data"
import { Link2, ImageIcon, Video, FileText, AlertCircle } from "lucide-react"

interface DriveAttachmentDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onAdd: (attachment: ProjectAttachment) => void
}

type FileType = "image" | "video" | "document"

export function DriveAttachmentDialog({ open, onOpenChange, onAdd }: DriveAttachmentDialogProps) {
    const [url, setUrl] = useState("")
    const [title, setTitle] = useState("")
    const [manualType, setManualType] = useState<FileType | "">("")
    const [error, setError] = useState<string | null>(null)

    // Reset when dialog opens
    const handleOpenChange = (open: boolean) => {
        if (!open) {
            setUrl("")
            setTitle("")
            setManualType("")
            setError(null)
        }
        onOpenChange(open)
    }

    // Live-detect type from URL as user types
    const autoDetectedType = url && isDriveUrl(url) ? detectDriveType(url) : null

    // The effective type (auto or manual)
    const effectiveType: FileType | null = (autoDetectedType ?? (manualType as FileType)) || null

    // Show the type selector only when we can't auto-detect
    const needsTypeSelection = url.length > 10 && isDriveUrl(url) && (autoDetectedType === null)

    const handleAdd = () => {
        setError(null)

        if (!url.trim()) {
            setError("Cole o link do Google Drive.")
            return
        }
        if (!isDriveUrl(url)) {
            setError("Este não parece ser um link do Google Drive ou Google Docs.")
            return
        }

        const resolvedType = autoDetectedType ?? (manualType as FileType | undefined)
        if (!resolvedType) {
            setError("Selecione o tipo do arquivo (Imagem, Vídeo ou Documento).")
            return
        }

        const driveFile = parseDriveLink(url, resolvedType, title || undefined)
        if (!driveFile) {
            setError("Não foi possível extrair o ID do arquivo. Verifique o link.")
            return
        }

        const attachment: ProjectAttachment = {
            id: driveFile.id,
            title: driveFile.title,
            type: driveFile.type,
            url: driveFile.previewUrl,
            // Store original URL and thumbnail for preview use
            originalUrl: driveFile.originalUrl,
            thumbnailUrl: driveFile.thumbnailUrl,
        }

        onAdd(attachment)
        handleOpenChange(false)
    }

    const typeIcon = {
        image: <ImageIcon className="h-4 w-4" />,
        video: <Video className="h-4 w-4" />,
        document: <FileText className="h-4 w-4" />,
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Link2 className="h-5 w-5 text-primary" />
                        Adicionar Anexo do Google Drive
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    <p className="text-sm text-muted-foreground">
                        Compartilhe o arquivo no Google Drive (<span className="font-medium">Qualquer pessoa com o link</span>), cole o link abaixo.
                    </p>

                    <div className="space-y-2">
                        <Label htmlFor="drive-url">Link do Google Drive</Label>
                        <Input
                            id="drive-url"
                            placeholder="https://drive.google.com/file/d/..."
                            value={url}
                            onChange={(e) => {
                                setUrl(e.target.value)
                                setError(null)
                                setManualType("")
                            }}
                            autoFocus
                        />
                    </div>

                    {/* Auto-detection feedback */}
                    {autoDetectedType && (
                        <div className="flex items-center gap-2 p-2 rounded-md bg-primary/5 border border-primary/20 text-sm text-primary">
                            {typeIcon[autoDetectedType]}
                            <span>Tipo detectado automaticamente: <strong className="capitalize">{autoDetectedType === 'document' ? 'Documento' : autoDetectedType === 'image' ? 'Imagem' : 'Vídeo'}</strong></span>
                        </div>
                    )}

                    {/* Manual type selection when needed */}
                    {needsTypeSelection && (
                        <div className="space-y-2">
                            <Label htmlFor="file-type">Tipo do arquivo</Label>
                            <Select value={manualType} onValueChange={(v) => { setManualType(v as FileType); setError(null) }}>
                                <SelectTrigger id="file-type">
                                    <SelectValue placeholder="Selecione o tipo..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="image">
                                        <span className="flex items-center gap-2"><ImageIcon className="h-4 w-4" /> Imagem</span>
                                    </SelectItem>
                                    <SelectItem value="video">
                                        <span className="flex items-center gap-2"><Video className="h-4 w-4" /> Vídeo</span>
                                    </SelectItem>
                                    <SelectItem value="document">
                                        <span className="flex items-center gap-2"><FileText className="h-4 w-4" /> Documento / PDF</span>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="drive-title">Título (opcional)</Label>
                        <Input
                            id="drive-title"
                            placeholder="Ex: Relatório de Atividades 2025"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 p-2 rounded-md bg-destructive/10 border border-destructive/20 text-sm text-destructive">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            {error}
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => handleOpenChange(false)}>Cancelar</Button>
                    <Button onClick={handleAdd} disabled={!url.trim() || (!effectiveType)}>
                        Adicionar Anexo
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
