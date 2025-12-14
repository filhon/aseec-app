export type ProjectStatus = 'concluido' | 'em_andamento' | 'pendente' | 'cancelado';
export type ProjectExtension = 'parcial' | 'completo';

export type PostType = 'history' | 'testimonial' | 'acknowledgment' | 'report' | 'update' | 'general';

export interface ProjectAttachment {
  id: string;
  title: string;
  type: 'image' | 'video' | 'document';
  url: string;
}

export interface ProjectPost {
  id: string;
  type: PostType;
  title?: string;
  author: string;
  avatar?: string;
  role?: string; // e.g. "Responsável", "Doador", "Aluno"
  date: string; // ISO date string
  content: string;
  attachments?: ProjectAttachment[];
  likes?: number;
  prayers?: number;
  comments?: ProjectPostComment[];
}

export interface ProjectPostComment {
  id: string;
  author: string;
  avatar?: string;
  date: string;
  content: string;
}

export interface DashboardProject {
  id: string;
  title: string;
  responsible: string;
  institution: string;
  investment: number;
  country: string;
  state: string;
  municipality: string;
  category: string;
  tags: string[];
  status: ProjectStatus;
  extension: ProjectExtension;
  investmentByYear: { year: number; value: number }[];
  
  // New detailed fields
  description?: string;
  indication?: string; // Indicated by
  startDate?: string;
  endDate?: string;
  requestedValue?: number;
  approvedValue?: number;
  thanked?: boolean;
  reachedPeople?: number;
  lastVisit?: string; // ISO date string
  
  // Refactored to Mural/Feed
  feed?: ProjectPost[];
  
  // General project files that might not be in a specific post (optional)
  attachments?: ProjectAttachment[];
  observations?: string;
}

export const mockDashboardProjects: DashboardProject[] = [
  {
    id: "1",
    title: "Hebron Base 1",
    responsible: "Pr. João Silva",
    institution: "Missão Hebron",
    investment: 150000,
    country: "Brasil",
    state: "SP",
    municipality: "São Paulo",
    category: "Educação",
    tags: ["escola", "reforma"],
    status: "em_andamento",
    extension: "completo",
    investmentByYear: [
      { year: 2023, value: 50000 },
      { year: 2024, value: 60000 },
      { year: 2025, value: 40000 },
    ],
    description: "Reforma completa da estrutura da base missionária para atender melhor os alunos e a comunidade local. O projeto inclui a construção de novas salas de aula, renovação da cozinha e refeitório, e melhorias na área de lazer.",
    indication: "Diretor Marcos Oliveira",
    startDate: "2023-01-15",
    endDate: "2025-06-30",
    requestedValue: 180000,
    approvedValue: 150000,
    thanked: false,
    reachedPeople: 450,
    feed: [
       { 
         id: "p1", 
         type: "history", 
         title: "Início das Obras",
         author: "Pr. João Silva", 
         role: "Responsável",
         date: "2023-02-10", 
         content: "Demos início às obras de fundação das novas salas de aula. Um marco importante para o projeto!",
         attachments: [
             { id: "a1", title: "Fundação", type: "image", url: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=300&ixlib=rb-4.0.3" }
         ]
       },
       { 
         id: "p2", 
         type: "history",
         title: "Cobertura Concluída", 
         author: "Equipe Técnica", 
         role: "Engenharia",
         date: "2023-06-20", 
         content: "A cobertura do prédio principal foi finalizada hoje. Agora seguiremos para o acabamento interno.",
         attachments: [
             { id: "a2", title: "Telhado", type: "image", url: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&q=80&w=300&ixlib=rb-4.0.3" }
         ]
       },
       { 
         id: "p3", 
         type: "testimonial", 
         author: "Maria", 
         role: "Aluna",
         date: "2024-03-10", 
         content: "A nova sala de aula é maravilhosa, agora temos ar condicionado e cadeiras novas! Muito obrigada a todos que ajudaram.",
         likes: 12
       },
       {
         id: "p4",
         type: "acknowledgment",
         title: "Agradecimento Especial",
         author: "Diretoria",
         role: "Administração",
         date: "2024-01-15",
         content: "Gostaríamos de agradecer à empresa Parceira LTDA pela doação dos materiais elétricos.",
       }
    ],
    attachments: [
        { id: "doc1", title: "Planta Baixa Aprovada", type: "document", url: "/docs/planta.pdf" },
        { id: "doc2", title: "Memorial Descritivo", type: "document", url: "/docs/memorial.docx" },
        { id: "doc3", title: "Orçamento Detalhado", type: "document", url: "/docs/orcamento.xlsx" },
    ],
    observations: "Atraso de 2 semanas devido às chuvas em Março de 2024."
  },
  {
    id: "2",
    title: "Hebron Base 2",
    responsible: "Pra. Maria Souza",
    institution: "Missão Hebron",
    investment: 80000,
    country: "Brasil",
    state: "DF",
    municipality: "Brasília",
    category: "Saúde",
    tags: ["clinica", "atendimento"],
    status: "concluido",
    extension: "parcial",
    investmentByYear: [
      { year: 2023, value: 40000 },
      { year: 2024, value: 40000 },
    ],
    feed: [
       { id: "p1", type: "history", author: "Pra. Maria", date: "2023-01-05", content: "Projeto iniciado." }
    ]
  },
  {
    id: "3",
    title: "Projeto Esperança",
    responsible: "Carlos Eduardo",
    institution: "ONG Esperança",
    investment: 200000,
    country: "Moçambique",
    state: "Maputo",
    municipality: "Maputo",
    category: "Social",
    tags: ["alimentação", "moradia"],
    status: "em_andamento",
    extension: "completo",
    investmentByYear: [
      { year: 2023, value: 80000 },
      { year: 2024, value: 120000 },
    ],
    feed: []
  },
  {
    id: "4",
    title: "Casa de Apoio Vida",
    responsible: "Ana Clara",
    institution: "Instituto Vida",
    investment: 120000,
    country: "Angola",
    state: "Luanda",
    municipality: "Luanda",
    category: "Saúde",
    tags: ["vacinação", "prevenção"],
    status: "pendente",
    extension: "parcial",
    investmentByYear: [
        { year: 2024, value: 120000 },
    ],
    feed: []
  },
  {
    id: "5",
    title: "Centro Comunitário Luz",
    responsible: "Pedro Henrique",
    institution: "Igreja Local",
    investment: 50000,
    country: "Brasil",
    state: "RJ",
    municipality: "Rio de Janeiro",
    category: "Social",
    tags: ["comunidade", "lazer"],
    status: "concluido",
    extension: "parcial",
    investmentByYear: [
      { year: 2022, value: 50000 },
    ],
    feed: [
        { id: "p1", type: "history", author: "Pedro", date: "2022-12-20", content: "Inauguração do centro comunitário com festa para as crianças." }
    ]
  },
  {
    id: "6",
    title: "Escola do Amanhã",
    responsible: "Fernanda Lima",
    institution: "Fundação Educar",
    investment: 300000,
    country: "Brasil",
    state: "PE",
    municipality: "Recife",
    category: "Educação",
    tags: ["tecnologia", "inclusão"],
    status: "em_andamento",
    extension: "completo",
    investmentByYear: [
      { year: 2023, value: 100000 },
      { year: 2024, value: 100000 },
      { year: 2025, value: 100000 },
    ],
    feed: []
  },
  {
    id: "7",
    title: "Poços Artesianos",
    responsible: "Roberto Dias",
    institution: "Água Viva",
    investment: 45000,
    country: "Guiné-Bissau",
    state: "Bissau",
    municipality: "Bissau",
    category: "Infraestrutura",
    tags: ["água", "saneamento"],
    status: "concluido",
    extension: "completo",
    investmentByYear: [
      { year: 2023, value: 45000 },
    ],
    feed: []
  },
  {
    id: "8",
    title: "Hospital de Campanha",
    responsible: "Dr. Alberto",
    institution: "Médicos Sem Fronteiras",
    investment: 500000,
    country: "Ucrânia",
    state: "Kiev",
    municipality: "Kiev",
    category: "Saúde",
    tags: ["emergencia", "guerra"],
    status: "em_andamento",
    extension: "completo",
    investmentByYear: [
      { year: 2024, value: 250000 },
      { year: 2025, value: 250000 },
    ],
    feed: []
  }
];
