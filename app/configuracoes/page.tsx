"use client";

import { useState, useEffect, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit2, Plus, Copy, RefreshCw, X, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  getUsers,
  getInviteCodes,
  generateInviteCode as generateInviteCodeAction,
  deleteInviteCode,
  updateUserRole as updateUserRoleAction,
  deleteUser as deleteUserAction,
  getCurrentUser,
} from "@/lib/actions/auth";
import type { Profile, InviteCode as InviteCodeType } from "@/lib/types/database.types";

// --- Types ---
type Role = "admin" | "user" | "editor";

interface Tag {
  id: string;
  name: string;
  color: string;
}

interface Category {
  id: string;
  name: string;
}

// Keep categories and tags as local state for now (can be migrated later)
const initialCategories: Category[] = [
  { id: "1", name: "Missões" },
  { id: "2", name: "Educação" },
  { id: "3", name: "Saúde" },
];

const initialTags: Tag[] = [
  { id: "1", name: "Urgente", color: "red" },
  { id: "2", name: "Em andamento", color: "blue" },
  { id: "3", name: "Concluído", color: "green" },
];

export default function SettingsPage() {
  // Data from Supabase
  const [users, setUsers] = useState<Profile[]>([]);
  const [inviteCodes, setInviteCodes] = useState<InviteCodeType[]>([]);
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Local state for categories and tags (can be migrated to Supabase later)
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [tags, setTags] = useState<Tag[]>(initialTags);

  // Invite Code State
  const [generatedCode, setGeneratedCode] = useState("");
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Content Management State
  const [newCategory, setNewCategory] = useState("");
  const [newTag, setNewTag] = useState("");
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);

  // Fetch data on mount
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [usersResult, codesResult, user] = await Promise.all([
        getUsers(),
        getInviteCodes(),
        getCurrentUser(),
      ]);

      if (usersResult.success) setUsers(usersResult.data as Profile[]);
      if (codesResult.success) setInviteCodes(codesResult.data as InviteCodeType[]);
      setCurrentUser(user);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Erro ao carregar dados");
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- Actions ---

  const handleGenerateInviteCode = async () => {
    if (!currentUser) {
      toast.error("Você precisa estar logado");
      return;
    }

    setIsGenerating(true);
    const result = await generateInviteCodeAction(currentUser.id);
    
    if (result.success) {
      setGeneratedCode(result.code!);
      await fetchData(); // Refresh the list
    } else {
      toast.error(result.error || "Erro ao gerar código");
    }
    setIsGenerating(false);
  };

  const handleDeleteInviteCode = async (id: string) => {
    const result = await deleteInviteCode(id);
    if (result.success) {
      toast.success("Código excluído");
      await fetchData();
    } else {
      toast.error(result.error || "Erro ao excluir código");
    }
  };

  const calculateDaysRemaining = (expiresAt: string) => {
    const today = new Date();
    const expDate = new Date(expiresAt);
    const diffTime = expDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generatedCode);
    setIsCopied(true);
    toast.success("Código copiado!");
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDeleteUser = async (id: string) => {
    // Prevent self-deletion
    if (id === currentUser?.id) {
      toast.error("Você não pode excluir sua própria conta");
      return;
    }

    const result = await deleteUserAction(id);
    if (result.success) {
      toast.success("Usuário removido");
      await fetchData();
    } else {
      toast.error(result.error || "Erro ao remover usuário");
    }
  };

  const handleRoleChange = async (id: string, newRole: Role) => {
    // Prevent self-demotion from admin
    if (id === currentUser?.id && currentUser?.role === "admin" && newRole !== "admin") {
      toast.error("Você não pode remover sua própria permissão de admin");
      return;
    }

    const result = await updateUserRoleAction(id, newRole);
    if (result.success) {
      toast.success("Permissão atualizada");
      await fetchData();
    } else {
      toast.error(result.error || "Erro ao atualizar permissão");
    }
  };

  const handleAddCategory = () => {
    if (!newCategory.trim()) return;
    setCategories([
      ...categories,
      { id: Date.now().toString(), name: newCategory },
    ]);
    setNewCategory("");
    toast.success("Categoria adicionada");
  };

  const handleDeleteCategory = (id: string) => {
    setCategories(categories.filter((c) => c.id !== id));
    toast.success("Categoria removida");
  };

  const handleUpdateCategory = () => {
    if (!editingCategory || !editingCategory.name.trim()) return;
    setCategories(
      categories.map((c) => (c.id === editingCategory.id ? editingCategory : c))
    );
    setEditingCategory(null);
    toast.success("Categoria atualizada");
  };

  const handleAddTag = () => {
    if (!newTag.trim()) return;
    setTags([
      ...tags,
      { id: Date.now().toString(), name: newTag, color: "gray" },
    ]);
    setNewTag("");
    toast.success("Tag adicionada");
  };

  const handleDeleteTag = (id: string) => {
    setTags(tags.filter((t) => t.id !== id));
    toast.success("Tag removida");
  };

  const handleUpdateTag = () => {
    if (!editingTag || !editingTag.name.trim()) return;
    setTags(tags.map((t) => (t.id === editingTag.id ? editingTag : t)));
    setEditingTag(null);
    toast.success("Tag atualizada");
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 lg:py-10 flex items-center justify-center min-h-[50vh]">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Carregando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 lg:py-10 space-y-6 lg:space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl lg:text-3xl font-bold tracking-tight">
            Configurações
          </h2>
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
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle>Gerenciamento de Usuários</CardTitle>
                <CardDescription>
                  Lista de usuários com acesso ao sistema.
                </CardDescription>
              </div>
              <Dialog
                open={isInviteDialogOpen}
                onOpenChange={setIsInviteDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button
                    onClick={handleGenerateInviteCode}
                    size="sm"
                    className="w-auto gap-1 sm:gap-2"
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                    <span className="sm:hidden">Novo</span>
                    <span className="hidden sm:inline">Novo Usuário</span>
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
                        value={generatedCode}
                        className="text-center text-2xl font-mono tracking-widest uppercase"
                      />
                    </div>
                    <Button
                      type="submit"
                      size="sm"
                      className={`px-3 transition-all ${
                        isCopied
                          ? "bg-green-600 hover:bg-green-700 text-white"
                          : ""
                      }`}
                      onClick={handleCopyCode}
                    >
                      <span className="sr-only">Copiar</span>
                      {isCopied ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="px-3"
                      onClick={handleGenerateInviteCode}
                      disabled={isGenerating}
                    >
                      {isGenerating ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setIsInviteDialogOpen(false)}
                    >
                      Fechar
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {/* Desktop View */}
              <div className="hidden md:block overflow-x-auto">
                <Table className="min-w-[600px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Permissão</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.full_name}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {user.id === currentUser?.id ? "(você)" : ""}
                        </TableCell>
                        <TableCell>
                          <Select
                            defaultValue={user.role}
                            onValueChange={(value) =>
                              handleRoleChange(user.id, value as Role)
                            }
                            disabled={currentUser?.role !== "admin"}
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
                            disabled={user.id === currentUser?.id || currentUser?.role !== "admin"}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {users.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                          Nenhum usuário encontrado.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile View */}
              <div className="md:hidden space-y-4">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="border rounded-lg p-4 bg-card text-card-foreground shadow-sm space-y-3"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0">
                        <p className="font-medium truncate">{user.full_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {user.id === currentUser?.id && "(você)"}
                        </p>
                      </div>
                      <Badge variant="outline">{user.role}</Badge>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t gap-2">
                      <div className="flex items-center gap-2 flex-1">
                        <span className="text-sm font-medium text-muted-foreground shrink-0">
                          Role:
                        </span>
                        <Select
                          defaultValue={user.role}
                          onValueChange={(value) =>
                            handleRoleChange(user.id, value as Role)
                          }
                          disabled={currentUser?.role !== "admin"}
                        >
                          <SelectTrigger className="h-8 w-full max-w-[130px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="editor">Editor</SelectItem>
                            <SelectItem value="user">User</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/20 shrink-0"
                        onClick={() => handleDeleteUser(user.id)}
                        disabled={user.id === currentUser?.id || currentUser?.role !== "admin"}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Códigos de Convite</CardTitle>
              <CardDescription>
                Gerencie os códigos de acesso gerados para novos usuários.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Desktop View */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Expira em</TableHead>
                      <TableHead>Usado por</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inviteCodes.map((code) => {
                      const daysRemaining = calculateDaysRemaining(code.expires_at);
                      const isExpired = daysRemaining <= 0 && code.status !== "used";

                      return (
                        <TableRow key={code.id}>
                          <TableCell>
                            <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">
                              {code.code}
                            </code>
                          </TableCell>
                          <TableCell>
                            {code.status === "used" ? (
                              <Badge
                                variant="secondary"
                                className="bg-green-100 text-green-700 hover:bg-green-100"
                              >
                                Usado
                              </Badge>
                            ) : isExpired || code.status === "expired" ? (
                              <Badge variant="destructive">Expirado</Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="text-blue-600 border-blue-600"
                              >
                                Disponível
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {code.status === "used" ? (
                              <span className="text-muted-foreground text-sm">
                                -
                              </span>
                            ) : (
                              <span
                                className={`text-sm font-medium ${
                                  daysRemaining <= 5 ? "text-red-500" : ""
                                }`}
                              >
                                {daysRemaining}{" "}
                                {daysRemaining === 1 ? "dia" : "dias"}
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">
                              {code.used_by_email || "-"}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/20"
                              onClick={() => handleDeleteInviteCode(code.id)}
                              disabled={currentUser?.role !== "admin"}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {inviteCodes.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-center py-4 text-muted-foreground"
                        >
                          Nenhum código gerado ainda.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile View */}
              <div className="md:hidden space-y-4">
                {inviteCodes.map((code) => {
                  const daysRemaining = calculateDaysRemaining(code.expires_at);
                  const isExpired = daysRemaining <= 0 && code.status !== "used";

                  return (
                    <div
                      key={code.id}
                      className="border rounded-lg p-4 bg-card text-card-foreground shadow-sm space-y-3"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0">
                          <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">
                            {code.code}
                          </code>
                          {code.used_by_email && (
                            <p className="text-xs text-muted-foreground mt-1 truncate">
                              Usado por: {code.used_by_email}
                            </p>
                          )}
                        </div>
                        {code.status === "used" ? (
                          <Badge
                            variant="secondary"
                            className="bg-green-100 text-green-700 hover:bg-green-100 shrink-0"
                          >
                            Usado
                          </Badge>
                        ) : isExpired || code.status === "expired" ? (
                          <Badge variant="destructive" className="shrink-0">
                            Expirado
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-blue-600 border-blue-600 shrink-0"
                          >
                            Disponível
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t gap-2">
                        <div className="flex items-center gap-2 flex-1">
                          <span className="text-xs font-medium text-muted-foreground shrink-0">
                            Expiração:
                          </span>
                          {code.status === "used" ? (
                            <span className="text-sm text-muted-foreground">
                              -
                            </span>
                          ) : (
                            <span
                              className={`text-sm font-medium ${
                                daysRemaining <= 5 ? "text-red-500" : ""
                              }`}
                            >
                              {daysRemaining}{" "}
                              {daysRemaining === 1 ? "dia" : "dias"}
                            </span>
                          )}
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/20 shrink-0"
                          onClick={() => handleDeleteInviteCode(code.id)}
                          disabled={currentUser?.role !== "admin"}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
                {inviteCodes.length === 0 && (
                  <p className="text-center py-4 text-muted-foreground text-sm">
                    Nenhum código gerado ainda.
                  </p>
                )}
              </div>
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
                <CardDescription>
                  Gerencie as categorias de projetos.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Nova categoria..."
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
                  />
                  <Button onClick={handleAddCategory}>
                    <Plus className="h-4 w-4" />
                  </Button>
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
                                  onChange={(e) =>
                                    setEditingCategory({
                                      ...editingCategory,
                                      name: e.target.value,
                                    })
                                  }
                                  className="h-8"
                                />
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8"
                                  onClick={handleUpdateCategory}
                                >
                                  <RefreshCw className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8"
                                  onClick={() => setEditingCategory(null)}
                                >
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
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => setEditingCategory(cat)}
                                >
                                  <Edit2 className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-red-500 hover:text-red-700"
                                  onClick={() => handleDeleteCategory(cat.id)}
                                >
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
                <CardDescription>
                  Gerencie etiquetas para identificação.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Nova tag..."
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
                  />
                  <Button onClick={handleAddTag}>
                    <Plus className="h-4 w-4" />
                  </Button>
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
                                  onChange={(e) =>
                                    setEditingTag({
                                      ...editingTag,
                                      name: e.target.value,
                                    })
                                  }
                                  className="h-8"
                                />
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8"
                                  onClick={handleUpdateTag}
                                >
                                  <RefreshCw className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8"
                                  onClick={() => setEditingTag(null)}
                                >
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
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => setEditingTag(tag)}
                                >
                                  <Edit2 className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-red-500 hover:text-red-700"
                                  onClick={() => handleDeleteTag(tag.id)}
                                >
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
  );
}
