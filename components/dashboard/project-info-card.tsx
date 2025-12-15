"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Pencil, Save, X, History, RotateCcw } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"



// We will use a context or compound component pattern to manage fields? 
// For simplicity, let's make a wrapper that just toggles "Edit Mode" and exposes a "Save" action 
// that the parent can use to update state. 
// Actually, the prompt implies specific fields are editable. 
// A generic "Form" might be too complex given the strict requirements.
// Let's make specific components for each section instead?
// Or a Generic Card that accepts "RenderView" and "RenderEdit" props?
// Let's go with "RenderView" and "RenderEdit".

interface GenericEditableCardProps {
    title: string | React.ReactNode
    icon?: React.ReactNode
    children: React.ReactNode
    editContent: React.ReactNode
    onSave: () => void
    onCancel?: () => void
    isEditing: boolean
    setIsEditing: (editing: boolean) => void
    hasHistory?: boolean
}

export function ProjectInfoCard({ 
    title, 
    icon, 
    children, 
    editContent, 
    onSave, 
    onCancel,
    isEditing,
    setIsEditing,
    hasHistory = false
}: GenericEditableCardProps) {
    const handleSave = () => {
        onSave()
        setIsEditing(false)
    }

    const handleCancel = () => {
        if (onCancel) onCancel()
        setIsEditing(false)
    }

    return (
        <Card className={`transition-all duration-300 ${isEditing ? 'ring-2 ring-primary border-primary' : ''}`}>
            <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                    {icon}
                    {title}
                </CardTitle>
                <div className="flex items-center gap-2">
                    {hasHistory && !isEditing && (
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-blue-500" title="Ver histórico de alterações">
                                    <History className="h-4 w-4" />
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Histórico de Alterações</DialogTitle>
                                </DialogHeader>
                                <div className="py-4 text-center text-muted-foreground">
                                    <div className="flex flex-col items-center gap-2 opacity-50">
                                        <RotateCcw className="h-10 w-10 mb-2" />
                                        <p>Simulação: Aqui seriam exibidas as versões anteriores deste bloco de dados.</p>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    )}
                    
                    {!isEditing ? (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => setIsEditing(true)}>
                            <Pencil className="h-4 w-4" />
                        </Button>
                    ) : (
                        <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-500" onClick={handleCancel}>
                                <X className="h-4 w-4" />
                            </Button>
                            <Button variant="default" size="icon" className="h-8 w-8 bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleSave}>
                                <Save className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {isEditing ? editContent : children}
            </CardContent>
        </Card>
    )
}
