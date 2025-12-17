# ASEEC App

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?style=for-the-badge&logo=tailwind-css)
![Supabase](https://img.shields.io/badge/Supabase-Database-green?style=for-the-badge&logo=supabase)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
![Leaflet](https://img.shields.io/badge/Leaflet-Maps-199900?style=for-the-badge&logo=leaflet)

Aplicação moderna desenvolvida para gestão de projetos missionários e controle financeiro robusto.

## Status do Desenvolvimento

| Área          | Status        | Progresso                                                         |
| ------------- | ------------- | ----------------------------------------------------------------- |
| **Frontend**  | 🟢 Avançado   | Interface polida com shadcn/ui, responsiva e suporte a Dark Mode. |
| **Navegação** | 🟢 Completo   | App Router estruturado, Breadcrumbs dinâmicos e Sidebar fixa.     |
| **Backend**   | 🟡 Integração | Supabase configurado, algumas integrações pendentes (IA/Anexos).  |

## Funcionalidades Principais

### 🗺️ Gestão de Projetos e Mapa

- **Mapa Interativo (`/`)**:
  - Clustering para agrupamento de projetos.
  - **Filtro "Perto de Mim"**: Localiza projetos em um raio de 50km.
  - Navegação integrada: Rotas diretas para o endereço do projeto.
  - Modo Fullscreen imersivo com controles flutuantes.
- **Detalhes do Projeto (`/projetos/[id]`)**:
  - **Mural de Atualizações**: Feed estilo timeline substituindo abas antigas.
  - Galeria multimídia e gestão de anexos.
  - Integração direta com Entidades responsáveis.

### 💰 Módulo Financeiro

- **Dashboard Financeiro**:
  - Gráfico de **Fluxo de Caixa Interativo**: Filtre transações clicando nas barras do gráfico.
  - Indicadores de Saldo, Receitas e Despesas.
- **Transações**:
  - Contas a Pagar e Receber com suporte a Centros de Custo.
  - **Importação em Massa**: Ferramenta para upload de CSV/Excel com pré-visualização e edição em linha.
- **Simulador de Despesas**: Calculadora de parcelamento e impacto no saldo futuro.

### 🏢 Entidades e Cadastros

- **Perfil da Entidade (`/dashboard/entidades/[id]`)**:
  - Layout em abas: "Visão Geral" (KPIs financeiros) e "Informações" (Dados bancários/Contato).
  - Upload de ícones/logos personalizados.
- **Centros de Custo**: Gestão hierárquica para alocação financeira.

### 🤖 ASEEC IA

- **Assistente Inteligente (`/aseec-ia`)**:
  - Chat conversacional para dúvidas e insights sobre projetos.
  - **Modo Flutuante**: Acesso ao chat de qualquer tela do sistema.
  - Sugestões de prompts e contexto inteligente.

### ⚙️ Sistema e Utilitários

- **Feedback System**: Reporte de bugs e sugestões com capturas de tela e anexos.
- **Autenticação e RBAC**: Controle de acesso granular (Admin, Gerente, Usuário).
- **Busca Global**: Pesquisa rápida de projetos e entidades.
- **Favoritos**: Acesso rápido a itens prioritários.

## Tech Stack

- **Core**: [Next.js 16](https://nextjs.org/) (App Router), [React 19](https://react.dev/)
- **Linguagem**: [TypeScript](https://www.typescriptlang.org/)
- **Estilo**: [Tailwind CSS 4](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/), [Lucide Icons](https://lucide.dev/)
- **Dados & Auth**: [Supabase](https://supabase.com/)
- **Mapas**: [React Leaflet](https://react-leaflet.js.org/)
- **Estado**: [Zustand](https://github.com/pmndrs/zustand)
- **Validação**: [Zod](https://zod.dev/) + [React Hook Form](https://react-hook-form.com/)
- **Visualização de Dados**: [Recharts](https://recharts.org/)

## Estrutura do Projeto

```
/app
 ├── (home)/           # Página inicial com Mapa
 ├── aseec-ia/         # Módulo de Inteligência Artificial
 ├── dashboard/        # Área administrativa
 │   ├── entidades/    # Gestão de Entidades
 │   └── ...
 ├── projetos/         # Listagem e Detalhes de Projetos
 ├── financeiro/       # Módulo Financeiro (Contas, Relatórios)
 ├── busca/            # Página de resultados de busca
 ├── favoritos/        # Projetos/Entidades favoritos
 ├── configuracoes/    # Ajustes do usuário e sistema
 └── login/            # Autenticação
```

## Como Executar

1. **Instale as dependências**:

   ```bash
   npm install
   ```

2. **Configure o ambiente**:
   Crie um arquivo `.env.local` com as credenciais do Supabase:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_DEFAULT_KEY=...
   ```

3. **Inicie o servidor**:
   ```bash
   npm run dev
   ```
   Acesse [http://localhost:3000](http://localhost:3000)
