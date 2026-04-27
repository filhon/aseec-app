# ASEEC App - Status do Projeto

Este documento apresenta uma análise exaustiva do estado atual do sistema, separando o que já foi construído (Frontend e Backend) do que ainda precisa ser implementado para completar o escopo inicial.

---

## ✅ O que já foi desenvolvido (Feito)

### 1. Estrutura e Interface Base (Frontend)

- **Framework e Estilização:** Projeto Next.js 16 (App Router) e React 19 configurado.
- **Design System:** Implementação avançada utilizando `shadcn/ui` e Tailwind CSS 4, com suporte nativo a Dark Mode e componentes responsivos.
- **Navegação:** Sidebar, Breadcrumbs dinâmicos e estrutura de rotas protegidas implementados.
- **Busca Global:** Sistema de pesquisa (`/busca`) interligando Projetos e Entidades.
- **Favoritos:** Funcionalidade rudimentar de favoritar Projetos/Entidades.

### 2. Gestão de Projetos e Mapa

- **Mapa Interativo (Home):** Visualização de projetos hospedada no Leaflet, incluindo clusterização, filtro "Perto de Mim" (raio 50km) e modo Fullscreen.
- **Detalhes do Projeto:** Página rica (`/projetos/[id]`) exibindo informações, metadados e localização.
- **Mural de Atualizações (Feed):** Linha do tempo de posts do projeto (Histórias, Testemunhos, Relatórios).

### 3. Banco de Dados e Backend (Supabase)

- **Autenticação:** Integração com Auth do Supabase incluindo gatilhos (triggers) para criação de Perfis.
- **Tabelas do Core:** Esquema inicial 100% criado para Projetos, Categorias, Entidades e Postagens.
- **Storage:** Buckets configurados e com políticas de acesso (RLS) aplicadas para imagens de projetos, anexos e ícones de entidades.
- **ASEEC IA (Schema):** Tabelas provisionadas para armazenar o histórico de mensagens da Inteligência Artificial.
- **RLS (Row Level Security):** Políticas de acesso aos dados já parametrizadas para diferenciar Admin, Editor e User.

### 4. Entidades e Cadastros

- **Gestão de Entidades:** Área (`/dashboard/entidades`) desenvolvida para visão geral da entidade, dados bancários e informações de contato.

### 5. Inteligência Artificial (ASEEC IA)

- **Interface Conversacional:** Módulo de chat criado na rota `/aseec-ia`, permitindo requisições ao assistente (Frontend concluído).

### 6. Módulo Financeiro (Apenas Interface / Mocks)

- **Dashboard:** Visão gráfica de Fluxo de Caixa, Orçamento vs Realizado e Lista de Transações construída na rota `/financeiro`.
- **Simulador de Despesas:** Calculadora interativa de parcelamento.
- **Nota:** Atualmente todas as visualizações financeiras (dashboard) operam com **dados mockados** de demonstração (`generateMockTransactions`, `mockCostCenters` em `lib/services/financial-service.ts` e Mocks UI).

---

## 🚧 O que ainda há de ser (A Fazer)

### 1. Módulo Financeiro (Backend e Fluxo Real)

- **Esquema de Banco de Dados:** Criar tabelas no Supabase para Contas a Pagar, Contas a Receber, Centros de Custo e Transações Financeiras (Atualmente Inexistente).
- **Integração Real:** Substituir toda a geração de Mocks (`mockFinancialMetrics`, transações) em `app/financeiro/page.tsx` por chamadas reais aos dados inseridos no Supabase.
- **CRUD de Transações:** Desenvolver os formulários para cadastrar individualmente despesas e receitas, com controle de status (Pendente, Pago).
- **Importação em Massa:** Criar o mecanismo para upload, validação em linha e persistência de planilhas/CSV diretamente para a base contábil do sistema.

### 2. Módulo de IA e Arquivos

- **Integração LLM da ASEEC IA:** Conectar os endpoints da interface do chat à verdadeira API de IA (ex: OpenAI, Anthropic), utilizando o contexto do sistema para responder dúvidas reais sobre os projetos.
- **Gestão de Anexos no Projeto (Upload):** Garantir que a lógica de upload de fotos e documentos no front-end acesse corretamente, envie as files aos buckets criados (`project-images`, `documents`) e vincule aos relatórios/feed.

### 3. Sistema de Utilitários e Finalização

- **Feedback System:** Implementar a captura de bug reports e sugestões dos usuários (prometido no README mas ainda não estruturado na UI/DB).
- **Consolidação de Permissões:** O sistema de RBAC deve ser rigorosamente testado nas páginas e nos hooks de interface para renderização condicional (ocultar botões e páginas não-autorizadas).
- **Formulários de Entidade/Projetos (Create/Edit):** Finalizar ou revisar a criação dinâmica de projetos do zero com endereço exato sendo convertido em Lat/Long via serviço de mapas estruturado.
