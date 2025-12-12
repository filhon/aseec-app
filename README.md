# ASEEC App

Aplicação desenvolvida com Next.js, Supabase e Tailwind CSS.

## Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
- **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
- **Estilização:** [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
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
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key_do_supabase
   ```

4. **Execute o servidor de desenvolvimento**
   ```bash
   npm run dev
   ```
   Acesse [http://localhost:3000](http://localhost:3000)

## Estrutura do Projeto

- `/app` - Páginas e layout (App Router)
- `/components`
  - `/ui` - Componentes do shadcn/ui
  - Outros componentes reutilizáveis
- `/lib`
  - `/supabase` - Configurações do cliente Supabase (Client e Server)
  - `utils.ts` - Utilitários gerais
- `/public` - Arquivos estáticos

## Scripts

- `npm run dev`: Inicia o ambiente de desenvolvimento
- `npm run build`: Cria a build de produção
- `npm run start`: Inicia o servidor de produção
- `npm run lint`: Executa o linting
