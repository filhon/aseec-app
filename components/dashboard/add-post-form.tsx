"use client"

import { useState, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ProjectPost, PostType, ProjectAttachment } from "./data"
import { Send, Paperclip, Plus, X, FileVideo, FileText, Sparkles, Wand2 } from "lucide-react"

const formSchema = z.object({
  type: z.enum(["history", "testimonial", "acknowledgment", "report", "update", "general"]),
  author: z.string().min(2, {
    message: "Nome do autor deve ter pelo menos 2 caracteres.",
  }),
  role: z.string().optional(),
  title: z.string().optional(),
  content: z.string().min(5, {
    message: "O conteúdo deve ter pelo menos 5 caracteres.",
  }),
})

interface AddPostFormProps {
  onPost: (post: ProjectPost) => void
}

export function AddPostForm({ onPost }: AddPostFormProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [attachments, setAttachments] = useState<ProjectAttachment[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "general",
      author: "",
      role: "",
      title: "",
      content: "",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    const newPost: ProjectPost = {
      // eslint-disable-next-line react-hooks/purity
      id: Math.random().toString(36).substr(2, 9),
      type: values.type as PostType,
      author: values.author,
      role: values.role || undefined,
      title: values.title || undefined,
      content: values.content,
      date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
      attachments: attachments
    }

    onPost(newPost)
    form.reset()
    setAttachments([])
    setIsExpanded(false)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files)
      const newAttachments: ProjectAttachment[] = files.map(file => {
        let type: 'image' | 'video' | 'document' = 'document'
        if (file.type.startsWith('image/')) type = 'image'
        else if (file.type.startsWith('video/')) type = 'video'

        return {
          id: Math.random().toString(36).substr(2, 9),
          type,
          url: URL.createObjectURL(file), 
          title: file.name
        }
      })
      setAttachments(prev => [...prev, ...newAttachments])
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  const simulateAIAction = (action: string) => {
    setIsGenerating(true)
    const currentContent = form.getValues("content")
    
    // Simulate API Delay
    setTimeout(() => {
        let newContent = currentContent
        if (action === "improve_grammar") {
            newContent = "Este é um exemplo de texto com correção gramatical aplicada pela IA."
        } else if (action === "make_formal") {
            newContent = "Prezados senhores, venho por meio desta comunicar que o projeto atingiu um marco significativo..."
        } else if (action === "summarize") {
            newContent = "Resumo: O projeto avançou bem."
        } else if (action === "generate_from_doc") {
            newContent = "Baseado no documento 'Relatório Anual.pdf', destacam-se os seguintes pontos:\n\n1. Aumento de 20% no alcance.\n2. Conclusão da fase 1.\n3. Próximos passos definidos para o Q3."
        }

        form.setValue("content", newContent)
        setIsGenerating(false)
    }, 1500)
  }

  if (!isExpanded) {
    return (
        <Card className="border-dashed shadow-sm hover:shadow-md transition-all cursor-pointer bg-muted/20 hover:bg-muted/40" onClick={() => setIsExpanded(true)}>
             <CardContent className="flex items-center gap-3 px-4 py-2 text-muted-foreground">
                 <div className="h-8 w-8 rounded-full bg-background border flex items-center justify-center">
                     <Plus className="h-4 w-4" />
                 </div>
                 <p className="font-medium text-sm">Adicionar nova publicação no mural...</p>
             </CardContent>
        </Card>
    )
  }

  const hasDocuments = attachments.some(a => a.type === 'document')

  return (
    <Card className="shadow-md border-l-4 border-l-primary relative animate-in fade-in zoom-in-95 duration-300">
      <Button 
        variant="ghost" 
        size="icon" 
        className="absolute right-2 top-2 h-8 w-8 text-muted-foreground hover:text-foreground" 
        onClick={() => setIsExpanded(false)}
      >
        <X className="h-4 w-4" />
      </Button>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
            Nova Publicação
            {isGenerating && <span className="text-xs font-normal text-muted-foreground animate-pulse ml-2 flex items-center gap-1"><Sparkles className="h-3 w-3" /> Gerando texto com IA...</span>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-4">
                 <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="history">Histórico</SelectItem>
                          <SelectItem value="testimonial">Depoimento</SelectItem>
                          <SelectItem value="acknowledgment">Agradecimento</SelectItem>
                          <SelectItem value="report">Relatório</SelectItem>
                          <SelectItem value="update">Atualização</SelectItem>
                          <SelectItem value="general">Geral</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-2">
                    <FormField
                      control={form.control}
                      name="author"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Autor</FormLabel>
                          <FormControl>
                            <Input placeholder="Quem enviou?" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cargo (Opcional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Diretor" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                </div>
            </div>

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título (Opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Título do post" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Conteúdo</FormLabel>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" type="button" className="h-6 gap-1.5 px-2 text-xs text-purple-600 hover:text-purple-700 hover:bg-purple-50">
                                <Sparkles className="h-3 w-3" />
                                aseecIA
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">

                            
                            <DropdownMenuSub>
                                <DropdownMenuSubTrigger>
                                    <Wand2 className="h-4 w-4 mr-2" />
                                    Melhorar Texto
                                </DropdownMenuSubTrigger>
                                <DropdownMenuSubContent>
                                    <DropdownMenuItem onClick={() => simulateAIAction("improve_grammar")}>
                                        Corrigir Gramática
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => simulateAIAction("make_formal")}>
                                        Tornar mais Formal
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => simulateAIAction("summarize")}>
                                        Resumir
                                    </DropdownMenuItem>
                                </DropdownMenuSubContent>
                            </DropdownMenuSub>

                            <DropdownMenuItem disabled={!hasDocuments} onClick={() => simulateAIAction("generate_from_doc")}>
                                <FileText className="h-4 w-4 mr-2" />
                                Gerar do Anexo
                                {!hasDocuments && <span className="ml-auto text-xs text-muted-foreground">(Sem anexo)</span>}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <FormControl>
                    <Textarea 
                      placeholder="Escreva os detalhes da publicação..." 
                      className="min-h-[100px]" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Attachments Preview */}
            {attachments.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {attachments.map((file, index) => (
                        <div key={index} className="relative group aspect-square rounded-md overflow-hidden border bg-muted flex items-center justify-center">
                            {file.type === 'image' ? (
                                <>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={file.url} alt={file.title} className="w-full h-full object-cover" />
                                </>
                            ) : file.type === 'video' ? (
                                <FileVideo className="h-8 w-8 text-muted-foreground" />
                            ) : (
                                <div className="flex flex-col items-center gap-1 p-2 text-center">
                                    <FileText className="h-8 w-8 text-muted-foreground" />
                                </div>
                            )}
                            
                            <button
                                type="button"
                                onClick={() => removeAttachment(index)}
                                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                            >
                                <X className="h-3 w-3" />
                            </button>
                            <div className="absolute bottom-0 w-full bg-black/60 text-white text-[10px] p-1 truncate px-2 text-center">
                                {file.title}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="flex items-center justify-between pt-2">
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    multiple 
                    accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.txt" 
                    onChange={handleFileSelect}
                />
                <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    className="gap-2 text-muted-foreground" 
                    onClick={() => fileInputRef.current?.click()}
                >
                    <Paperclip className="h-4 w-4" />
                    Adicionar Anexo {attachments.length > 0 && `(${attachments.length})`}
                </Button>
                <Button type="submit" className="gap-2" disabled={isGenerating}>
                    <Send className="h-4 w-4" />
                    Publicar
                </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
