# ASEEC App

Aplicação desenvolvida com Next.js, Supabase e Tailwind CSS para gestão de projetos e controle financeiro.

## Funcionalidades Principais

### Dashboard de Projetos (`/projetos`)

- **Visualização de Mapa Interativo**:
  - Mapa com clustering para agrupamento de projetos próximos.
  - Filtro interativo: clique em pinos ou clusters para filtrar a lista de projetos.
  - Ícones personalizados indicando status.
- **Gráficos Dinâmicos**:
  - Gráfico de pizza interativo exibindo a distribuição por categoria.
  - Clique nas fatias ou legendas para filtrar a lista.
  - Filtros cruzados entre Mapa e Gráfico.
- **Listagem e Busca**:
  - Busca textual por nome, responsável, localidade, etc.
  - Visualização em cards com indicadores de status e investimento.
- **Página de Detalhes do Projeto (`/projetos/[id]`)**:
  - Visão geral completa com informações básicas, financeiras e categorização.
  - Linha do tempo (Histórico) de atualizações.
  - Galeria de anexos (fotos, vídeos, documentos).
  - Seção de depoimentos e observações.

### Gestão Financeira (Recursos Anteriores)

- **Contas a Pagar e Receber**: Controle de fluxo de caixa com permissões baseadas em funções.
- **Centros de Custo**: Dashboards específicos para análise financeira por centro de custo.
- **Importação em Massa**: Ferramenta para importação de transações via CSV/Excel.
- **Entidades**: Cadastro e visualização detalhada de entidades/fornecedores com dashboard financeiro.

### Sistema e Configurações

- **Autenticação**: Login com email/senha suportado por Supabase Auth.
- **Controle de Acesso (RBAC)**:
  - Admin (acesso total).
  - Gerente Financeiro (acesso à empresa vinculada).
  - Usuário Padrão (acesso restrito).
- **Feedback**: Sistema de feedback integrado para reporte de bugs e sugestões.
- **Layout Moderno**: Sidebar fixo, suporte a Tema Claro/Escuro (Dark Mode).

## Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
- **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
- **Estilização:** [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- **Mapas:** [React Leaflet](https://react-leaflet.js.org/)
- **Backend / Database:** [Supabase](https://supabase.com/) (Database, Auth, Storage)
- **Gerenciamento de Estado:** [Zustand](https://github.com/pmndrs/zustand)
- **Formulários:** [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Gráficos:** [Recharts](https://recharts.org/)
- **Ícones:** [Lucide React](https://lucide.dev/)

## Como Executar

1. **Clone o repositório**

2. **Instale as dependências**

   ```bash
   npm install
   ```

3. **Configure as Variáveis de Ambiente**
   Crie um arquivo `.env.local` na raiz do projeto com as chaves do Supabase:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
   NEXT_PUBLIC_SUPABASE_DEFAULT_KEY=sua_default_key_do_supabase
   ```

4. **Execute o servidor de desenvolvimento**
   ```bash
   npm run dev
   ```
   Acesse [http://localhost:3000](http://localhost:3000)

## Estrutura do Projeto

- `/app` - Páginas e layout (App Router)
  - `/dashboard` - Visão geral principal
  - `/projetos` - Módulo de Projetos
  - `/cadastros` - Entidades e Centros de Custo
  - `/financeiro` - Contas a Pagar/Receber
- `/components`
  - `/ui` - Componentes do shadcn/ui
  - `/map` - Componentes de Mapa (Leaflet)
  - `/dashboard` - Widgets e Gráficos
- `/lib`
  - `/supabase` - Configurações do cliente Supabase
  - `utils.ts` - Utilitários gerais
