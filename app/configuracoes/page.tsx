"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Trash2, Edit2, Plus, Copy, RefreshCw, X } from "lucide-react"
import { toast } from "sonner" // Assuming sonner is installed as per list_dir

// --- Mock Data & Types ---

type Role = "admin" | "user" | "editor"

interface User {
  id: string
  name: string
  email: string
  role: Role
  status: "active" | "pending"
}

interface Tag {
  id: string
  name: string
  color: string
}

interface Category {
  id: string
  name: string
}

const initialUsers: User[] = [
  { id: "1", name: "Filipe Honório", email: "filipe@example.com", role: "admin", status: "active" },
  { id: "2", name: "Wendel Nascimento", email: "wendel@example.com", role: "admin", status: "active" },
  { id: "3", name: "Maria Silva", email: "maria@example.com", role: "user", status: "active" },
  { id: "4", name: "João Santos", email: "joao@example.com", role: "editor", status: "pending" },
]

const initialCategories: Category[] = [
  { id: "1", name: "Missões" },
  { id: "2", name: "Educação" },
  { id: "3", name: "Saúde" },
]

const initialTags: Tag[] = [
  { id: "1", name: "Urgente", color: "red" },
  { id: "2", name: "Em andamento", color: "blue" },
  { id: "3", name: "Concluído", color: "green" },
]

export default function SettingsPage() {
  const [users, setUsers] = useState<User[]>(initialUsers)
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [tags, setTags] = useState<Tag[]>(initialTags)

  // Invite Code State
  const [inviteCode, setInviteCode] = useState("")
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false)

  // Content Management State
  const [newCategory, setNewCategory] = useState("")
  const [newTag, setNewTag] = useState("")
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [editingTag, setEditingTag] = useState<Tag | null>(null)

  // --- Actions ---

  const generateInviteCode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase()
    setInviteCode(code)
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(inviteCode)
    toast.success("Código copiado!")
  }

  const handleDeleteUser = (id: string) => {
    setUsers(users.filter(u => u.id !== id))
    toast.success("Usuário removido")
  }

  const handleRoleChange = (id: string, newRole: Role) => {
    setUsers(users.map(u => u.id === id ? { ...u, role: newRole } : u))
    toast.success("Permissão atualizada")
  }

  const handleAddCategory = () => {
    if (!newCategory.trim()) return
    setCategories([...categories, { id: Date.now().toString(), name: newCategory }])
    setNewCategory("")
    toast.success("Categoria adicionada")
  }

  const handleDeleteCategory = (id: string) => {
    setCategories(categories.filter(c => c.id !== id))
    toast.success("Categoria removida")
  }

  const handleUpdateCategory = () => {
    if (!editingCategory || !editingCategory.name.trim()) return
    setCategories(categories.map(c => c.id === editingCategory.id ? editingCategory : c))
    setEditingCategory(null)
    toast.success("Categoria atualizada")
  }

  const handleAddTag = () => {
    if (!newTag.trim()) return
    setTags([...tags, { id: Date.now().toString(), name: newTag, color: "gray" }])
    setNewTag("")
    toast.success("Tag adicionada")
  }

  const handleDeleteTag = (id: string) => {
    setTags(tags.filter(t => t.id !== id))
    toast.success("Tag removida")
  }
  
  const handleUpdateTag = () => {
    if (!editingTag || !editingTag.name.trim()) return
     setTags(tags.map(t => t.id === editingTag.id ? editingTag : t))
     setEditingTag(null)
     toast.success("Tag atualizada")
  }


  return (
    <div className="container mx-auto py-10 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Configurações</h2>
          <p className="text-muted-foreground">
            Gerencie usuários, permissões e conteúdos do sistema.
          </p>
        </div>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="content">Conteúdo</TabsTrigger>
        </TabsList>

        {/* --- USERS TAB --- */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle>Gerenciamento de Usuários</CardTitle>
                <CardDescription>
                  Lista de usuários com acesso ao sistema.
                </CardDescription>
              </div>
              <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={generateInviteCode}>
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Usuário
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Gerar Código de Convite</DialogTitle>
                    <DialogDescription>
                      Envie este código para o novo usuário criar a conta.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex items-center space-x-2 py-4">
                    <div className="grid flex-1 gap-2">
                      <Input
                        readOnly
                        value={inviteCode}
                        className="text-center text-2xl font-mono tracking-widest uppercase"
                      />
                    </div>
                    <Button type="submit" size="sm" className="px-3" onClick={handleCopyCode}>
                      <span className="sr-only">Copiar</span>
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="px-3" onClick={generateInviteCode}>
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="secondary" onClick={() => setIsInviteDialogOpen(false)}>
                      Fechar
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Permissão</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={user.status === "active" ? "default" : "secondary"}>
                          {user.status === "active" ? "Ativo" : "Pendente"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Select
                          defaultValue={user.role}
                          onValueChange={(value) => handleRoleChange(user.id, value as Role)}
                        >
                          <SelectTrigger className="w-[130px] h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="editor">Editor</SelectItem>
                            <SelectItem value="user">User</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/20"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- CONTENT TAB --- */}
        <TabsContent value="content" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            
            {/* CATEGORIES */}
            <Card>
              <CardHeader>
                <CardTitle>Categorias</CardTitle>
                <CardDescription>Gerencie as categorias de projetos.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-2">
                  <Input 
                    placeholder="Nova categoria..." 
                    value={newCategory} 
                    onChange={(e) => setNewCategory(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                  />
                  <Button onClick={handleAddCategory}><Plus className="h-4 w-4" /></Button>
                </div>
                <div className="rounded-md border">
                  <Table>
                     <TableBody>
                        {categories.map((cat) => (
                           <TableRow key={cat.id}>
                              <TableCell className="font-medium py-2">
                                 {editingCategory?.id === cat.id ? (
                                    <div className="flex items-center gap-2">
                                       <Input 
                                          value={editingCategory.name} 
                                          onChange={(e) => setEditingCategory({...editingCategory, name: e.target.value})}
                                          className="h-8"
                                       />
                                       <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleUpdateCategory}>
                                          <RefreshCw className="h-3 w-3" />
                                       </Button>
                                       <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditingCategory(null)}>
                                          <X className="h-3 w-3" />
                                       </Button>
                                    </div>
                                 ) : (
                                    cat.name
                                 )}
                              </TableCell>
                              <TableCell className="py-2 text-right">
                                 {editingCategory?.id !== cat.id && (
                                    <div className="flex justify-end gap-1">
                                       <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditingCategory(cat)}>
                                          <Edit2 className="h-3 w-3" />
                                       </Button>
                                       <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700" onClick={() => handleDeleteCategory(cat.id)}>
                                          <Trash2 className="h-3 w-3" />
                                       </Button>
                                    </div>
                                 )}
                              </TableCell>
                           </TableRow>
                        ))}
                     </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* TAGS */}
            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
                <CardDescription>Gerencie etiquetas para identificação.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-2">
                  <Input 
                    placeholder="Nova tag..." 
                    value={newTag} 
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                  />
                  <Button onClick={handleAddTag}><Plus className="h-4 w-4" /></Button>
                </div>
                <div className="rounded-md border">
                   <Table>
                     <TableBody>
                        {tags.map((tag) => (
                           <TableRow key={tag.id}>
                              <TableCell className="font-medium py-2">
                                 {editingTag?.id === tag.id ? (
                                    <div className="flex items-center gap-2">
                                       <Input 
                                          value={editingTag.name} 
                                          onChange={(e) => setEditingTag({...editingTag, name: e.target.value})}
                                          className="h-8"
                                       />
                                       <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleUpdateTag}>
                                          <RefreshCw className="h-3 w-3" />
                                       </Button>
                                       <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditingTag(null)}>
                                          <X className="h-3 w-3" />
                                       </Button>
                                    </div>
                                 ) : (
                                    <div className="flex items-center gap-2">
                                       <Badge variant="outline">{tag.name}</Badge>
                                    </div>
                                 )}
                              </TableCell>
                              <TableCell className="py-2 text-right">
                                 {editingTag?.id !== tag.id && (
                                    <div className="flex justify-end gap-1">
                                       <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditingTag(tag)}>
                                          <Edit2 className="h-3 w-3" />
                                       </Button>
                                       <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700" onClick={() => handleDeleteTag(tag.id)}>
                                          <Trash2 className="h-3 w-3" />
                                       </Button>
                                    </div>
                                 )}
                              </TableCell>
                           </TableRow>
                        ))}
                     </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
