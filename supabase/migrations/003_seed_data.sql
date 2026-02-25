-- ASEEC App - Seed Data for Projects
-- Generated: 2024-12-19
-- Description: Sample data for development and testing

-- =============================================================================
-- ENTITIES (Missionary Organizations)
-- =============================================================================

INSERT INTO entities (id, name, slug, description, contact_email, active) VALUES
  ('e1000000-0000-0000-0000-000000000001', 'Missão Hebron', 'missao-hebron', 'Organização missionária com foco em educação e assistência social.', 'contato@missaohebron.org', true),
  ('e1000000-0000-0000-0000-000000000002', 'ONG Esperança Viva', 'ong-esperanca-viva', 'ONG focada em projetos humanitários em países africanos.', 'contato@esperancaviva.org', true),
  ('e1000000-0000-0000-0000-000000000003', 'Instituto Vida Nova', 'instituto-vida-nova', 'Instituto dedicado à capacitação e desenvolvimento comunitário.', 'contato@vidanova.org', true),
  ('e1000000-0000-0000-0000-000000000004', 'Igreja Local Central', 'igreja-local-central', 'Igreja com diversos projetos sociais e missionários.', 'contato@igrejacentrallocal.org', true),
  ('e1000000-0000-0000-0000-000000000005', 'Fundação Educar Brasil', 'fundacao-educar-brasil', 'Fundação com foco em educação inclusiva e tecnologia.', 'contato@educarbrasil.org', true)
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- PROJECTS
-- =============================================================================

INSERT INTO projects (id, title, description, responsible, entity_id, country, state, municipality, address, latitude, longitude, status, extension, requested_value, approved_value, investment, start_date, end_date, indication, reached_people, thanked, featured_image_url, active) VALUES

-- === Brasil ===
('p1000000-0000-0000-0000-000000000001', 
 'Escola Comunitária Hebron', 
 'Construção e reforma de estrutura escolar para atender crianças de comunidades carentes. O projeto inclui salas de aula, refeitório e área de lazer.',
 'Pr. João Silva',
 'e1000000-0000-0000-0000-000000000001',
 'Brasil', 'SP', 'São Paulo',
 'Rua das Oliveiras, 123 - Zona Leste',
 -23.5505, -46.6333,
 'em_andamento', 'completo',
 180000, 150000, 95000,
 '2022-03-15', '2025-12-31',
 'Diretor Marcos Oliveira',
 450, false,
 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800',
 true),

('p1000000-0000-0000-0000-000000000002',
 'Centro de Saúde Esperança',
 'Clínica comunitária oferecendo atendimento médico básico e vacinação para população de baixa renda.',
 'Pra. Maria Souza',
 'e1000000-0000-0000-0000-000000000001',
 'Brasil', 'DF', 'Brasília',
 'Av. das Nações, 456 - Asa Norte',
 -15.7975, -47.8919,
 'concluido', 'parcial',
 100000, 80000, 80000,
 '2020-01-10', '2023-06-30',
 'Dra. Helena Costa',
 1200, true,
 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800',
 true),

('p1000000-0000-0000-0000-000000000003',
 'Projeto Criança Feliz',
 'Atividades recreativas e educacionais para crianças em situação de vulnerabilidade social.',
 'Carlos Eduardo',
 'e1000000-0000-0000-0000-000000000003',
 'Brasil', 'RJ', 'Rio de Janeiro',
 'Rua da Paz, 10 - Centro',
 -22.9068, -43.1729,
 'em_andamento', 'parcial',
 60000, 50000, 35000,
 '2023-06-01', '2025-06-30',
 'Pr. Roberto Almeida',
 280, false,
 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800',
 true),

('p1000000-0000-0000-0000-000000000004',
 'Casa de Apoio Vida',
 'Acolhimento e suporte para famílias em situação de vulnerabilidade temporária.',
 'Ana Clara Santos',
 'e1000000-0000-0000-0000-000000000003',
 'Brasil', 'RJ', 'Rio de Janeiro',
 'Av. Atlântica, 500 - Copacabana',
 -22.9100, -43.1750,
 'pendente', 'completo',
 200000, 150000, 0,
 '2025-01-01', '2027-12-31',
 'Dir. Paulo Mendes',
 0, false,
 NULL,
 true),

('p1000000-0000-0000-0000-000000000005',
 'Escola do Amanhã',
 'Projeto de tecnologia e inclusão digital para jovens de escolas públicas.',
 'Fernanda Lima',
 'e1000000-0000-0000-0000-000000000005',
 'Brasil', 'PE', 'Recife',
 'Rua do Sol, 200 - Boa Viagem',
 -8.0476, -34.8770,
 'em_andamento', 'completo',
 350000, 300000, 200000,
 '2021-08-15', '2026-08-15',
 'Sec. Municipal de Educação',
 850, false,
 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800',
 true),

('p1000000-0000-0000-0000-000000000006',
 'Centro Comunitário Luz',
 'Espaço multiuso para atividades culturais, esportivas e religiosas da comunidade.',
 'Pedro Henrique',
 'e1000000-0000-0000-0000-000000000004',
 'Brasil', 'RJ', 'Rio de Janeiro',
 'Rua Voluntários, 88 - Botafogo',
 -22.9080, -43.1740,
 'concluido', 'parcial',
 80000, 50000, 50000,
 '2019-03-01', '2022-12-31',
 'Pr. Antônio Ferreira',
 320, true,
 NULL,
 true),

-- === Moçambique ===
('p1000000-0000-0000-0000-000000000007',
 'Projeto Esperança Maputo',
 'Programa de segurança alimentar e moradia para famílias desabrigadas.',
 'Missionário João Baptista',
 'e1000000-0000-0000-0000-000000000002',
 'Moçambique', 'Maputo', 'Maputo',
 'Av. Eduardo Mondlane, 1500',
 -25.9653, 32.5892,
 'em_andamento', 'completo',
 250000, 200000, 145000,
 '2020-06-01', '2025-06-01',
 'Bispo Local',
 600, false,
 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=800',
 true),

-- === Angola ===
('p1000000-0000-0000-0000-000000000008',
 'Centro de Vacinação Luanda',
 'Campanha permanente de vacinação e prevenção de doenças transmissíveis.',
 'Dra. Mariana Costa',
 'e1000000-0000-0000-0000-000000000002',
 'Angola', 'Luanda', 'Luanda',
 'Rua da Missão, 300 - Sambizanga',
 -8.8383, 13.2344,
 'em_andamento', 'parcial',
 180000, 120000, 85000,
 '2022-01-15', '2025-12-31',
 'Min. da Saúde Angola',
 2500, false,
 'https://images.unsplash.com/photo-1584515933487-779824d29309?w=800',
 true),

-- === Guiné-Bissau ===
('p1000000-0000-0000-0000-000000000009',
 'Poços Artesianos Bissau',
 'Perfuração de poços artesianos para fornecimento de água potável em comunidades rurais.',
 'Roberto Dias',
 'e1000000-0000-0000-0000-000000000002',
 'Guiné-Bissau', 'Bissau', 'Bissau',
 'Bairro Militar, s/n',
 11.8636, -15.5977,
 'concluido', 'completo',
 60000, 45000, 45000,
 '2021-04-01', '2023-10-31',
 'ONG Água Viva',
 1800, true,
 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800',
 true),

-- === Ucrânia ===
('p1000000-0000-0000-0000-000000000010',
 'Hospital de Campanha Kiev',
 'Atendimento emergencial para vítimas do conflito e população deslocada.',
 'Dr. Alberto Mendes',
 'e1000000-0000-0000-0000-000000000002',
 'Ucrânia', 'Kiev', 'Kiev',
 'Khreshchatyk Street, 100',
 50.4501, 30.5234,
 'em_andamento', 'completo',
 600000, 500000, 320000,
 '2022-03-15', '2025-12-31',
 'Médicos Sem Fronteiras',
 4500, false,
 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=800',
 true),

-- === Projeto Histórico (1999) ===
('p1000000-0000-0000-0000-000000000011',
 'Missão Pioneira Amazônia',
 'Primeiro projeto missionário na região amazônica, estabelecendo bases para trabalho futuro.',
 'Missionário José da Silva',
 'e1000000-0000-0000-0000-000000000001',
 'Brasil', 'AM', 'Manaus',
 'Rio Negro, Comunidade Ribeirinha',
 -3.1190, -60.0217,
 'concluido', 'completo',
 25000, 20000, 20000,
 '1999-06-01', '2002-12-31',
 'Convenção Batista',
 150, true,
 NULL,
 true),

-- === Projeto 2005 ===
('p1000000-0000-0000-0000-000000000012',
 'Educação Rural Nordeste',
 'Programa de alfabetização para adultos em comunidades rurais do sertão.',
 'Profa. Lúcia Fernandes',
 'e1000000-0000-0000-0000-000000000005',
 'Brasil', 'CE', 'Fortaleza',
 'Sertão do Ceará',
 -3.7172, -38.5433,
 'concluido', 'parcial',
 35000, 30000, 30000,
 '2005-02-01', '2008-12-31',
 'Secretaria de Educação',
 280, true,
 NULL,
 true)

ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- PROJECT CATEGORIES (Many-to-Many links)
-- =============================================================================

INSERT INTO project_categories (project_id, category_id, active)
SELECT p.id, c.id, true FROM projects p, categories c
WHERE 
  (p.title = 'Escola Comunitária Hebron' AND c.slug = 'educacao') OR
  (p.title = 'Centro de Saúde Esperança' AND c.slug = 'saude') OR
  (p.title = 'Projeto Criança Feliz' AND c.slug = 'social') OR
  (p.title = 'Casa de Apoio Vida' AND c.slug = 'social') OR
  (p.title = 'Escola do Amanhã' AND c.slug = 'educacao') OR
  (p.title = 'Centro Comunitário Luz' AND c.slug = 'social') OR
  (p.title = 'Projeto Esperança Maputo' AND c.slug = 'social') OR
  (p.title = 'Centro de Vacinação Luanda' AND c.slug = 'saude') OR
  (p.title = 'Poços Artesianos Bissau' AND c.slug = 'infraestrutura') OR
  (p.title = 'Hospital de Campanha Kiev' AND c.slug = 'saude') OR
  (p.title = 'Missão Pioneira Amazônia' AND c.slug = 'evangelismo') OR
  (p.title = 'Educação Rural Nordeste' AND c.slug = 'educacao')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- PROJECT INVESTMENTS (Historical data since 1999)
-- =============================================================================

-- Escola Comunitária Hebron
INSERT INTO project_investments (project_id, year, value, description, active) VALUES
('p1000000-0000-0000-0000-000000000001', 2022, 25000, 'Início das obras - fundação', true),
('p1000000-0000-0000-0000-000000000001', 2023, 40000, 'Estrutura e cobertura', true),
('p1000000-0000-0000-0000-000000000001', 2024, 30000, 'Acabamento interno', true)
ON CONFLICT DO NOTHING;

-- Centro de Saúde Esperança
INSERT INTO project_investments (project_id, year, value, description, active) VALUES
('p1000000-0000-0000-0000-000000000002', 2020, 30000, 'Equipamentos médicos', true),
('p1000000-0000-0000-0000-000000000002', 2021, 25000, 'Reforma predial', true),
('p1000000-0000-0000-0000-000000000002', 2022, 15000, 'Medicamentos e insumos', true),
('p1000000-0000-0000-0000-000000000002', 2023, 10000, 'Manutenção', true)
ON CONFLICT DO NOTHING;

-- Projeto Esperança Maputo
INSERT INTO project_investments (project_id, year, value, description, active) VALUES
('p1000000-0000-0000-0000-000000000007', 2020, 35000, 'Infraestrutura inicial', true),
('p1000000-0000-0000-0000-000000000007', 2021, 40000, 'Construção de moradias', true),
('p1000000-0000-0000-0000-000000000007', 2022, 35000, 'Programa alimentar', true),
('p1000000-0000-0000-0000-000000000007', 2023, 20000, 'Capacitação profissional', true),
('p1000000-0000-0000-0000-000000000007', 2024, 15000, 'Manutenção e expansão', true)
ON CONFLICT DO NOTHING;

-- Hospital de Campanha Kiev
INSERT INTO project_investments (project_id, year, value, description, active) VALUES
('p1000000-0000-0000-0000-000000000010', 2022, 150000, 'Instalação emergencial', true),
('p1000000-0000-0000-0000-000000000010', 2023, 100000, 'Equipamentos e medicamentos', true),
('p1000000-0000-0000-0000-000000000010', 2024, 70000, 'Operação contínua', true)
ON CONFLICT DO NOTHING;

-- Missão Pioneira Amazônia (histórico desde 1999)
INSERT INTO project_investments (project_id, year, value, description, active) VALUES
('p1000000-0000-0000-0000-000000000011', 1999, 5000, 'Expedição inicial', true),
('p1000000-0000-0000-0000-000000000011', 2000, 8000, 'Construção de base', true),
('p1000000-0000-0000-0000-000000000011', 2001, 4000, 'Manutenção', true),
('p1000000-0000-0000-0000-000000000011', 2002, 3000, 'Finalização', true)
ON CONFLICT DO NOTHING;

-- Escola do Amanhã
INSERT INTO project_investments (project_id, year, value, description, active) VALUES
('p1000000-0000-0000-0000-000000000005', 2021, 50000, 'Laboratório de informática', true),
('p1000000-0000-0000-0000-000000000005', 2022, 60000, 'Equipamentos e software', true),
('p1000000-0000-0000-0000-000000000005', 2023, 50000, 'Expansão do programa', true),
('p1000000-0000-0000-0000-000000000005', 2024, 40000, 'Capacitação de professores', true)
ON CONFLICT DO NOTHING;

-- =============================================================================
-- PROJECT TAGS
-- =============================================================================

INSERT INTO project_tags (project_id, tag, active) VALUES
('p1000000-0000-0000-0000-000000000001', 'escola', true),
('p1000000-0000-0000-0000-000000000001', 'reforma', true),
('p1000000-0000-0000-0000-000000000001', 'crianças', true),
('p1000000-0000-0000-0000-000000000002', 'clínica', true),
('p1000000-0000-0000-0000-000000000002', 'vacinação', true),
('p1000000-0000-0000-0000-000000000003', 'crianças', true),
('p1000000-0000-0000-0000-000000000003', 'recreação', true),
('p1000000-0000-0000-0000-000000000005', 'tecnologia', true),
('p1000000-0000-0000-0000-000000000005', 'inclusão', true),
('p1000000-0000-0000-0000-000000000007', 'alimentação', true),
('p1000000-0000-0000-0000-000000000007', 'moradia', true),
('p1000000-0000-0000-0000-000000000008', 'vacinação', true),
('p1000000-0000-0000-0000-000000000008', 'prevenção', true),
('p1000000-0000-0000-0000-000000000009', 'água', true),
('p1000000-0000-0000-0000-000000000009', 'saneamento', true),
('p1000000-0000-0000-0000-000000000010', 'emergência', true),
('p1000000-0000-0000-0000-000000000010', 'guerra', true),
('p1000000-0000-0000-0000-000000000010', 'refugiados', true),
('p1000000-0000-0000-0000-000000000011', 'pioneiro', true),
('p1000000-0000-0000-0000-000000000011', 'missão', true)
ON CONFLICT DO NOTHING;

-- =============================================================================
-- PROJECT POSTS (Feed/Mural sample data)
-- =============================================================================

INSERT INTO project_posts (project_id, type, title, content, author_name, author_role, likes_count, prayers_count, active) VALUES
('p1000000-0000-0000-0000-000000000001', 'history', 'Início das Obras', 'Demos início às obras de fundação das novas salas de aula. Um marco importante para o projeto!', 'Pr. João Silva', 'Responsável', 12, 8, true),
('p1000000-0000-0000-0000-000000000001', 'history', 'Cobertura Concluída', 'A cobertura do prédio principal foi finalizada hoje. Agora seguiremos para o acabamento interno.', 'Equipe Técnica', 'Engenharia', 8, 3, true),
('p1000000-0000-0000-0000-000000000001', 'testimonial', 'Gratidão pelos estudos', 'A nova sala de aula é maravilhosa, agora temos ar condicionado e cadeiras novas! Muito obrigada a todos que ajudaram.', 'Maria', 'Aluna', 25, 15, true),
('p1000000-0000-0000-0000-000000000001', 'acknowledgment', 'Agradecimento Especial', 'Gostaríamos de agradecer à empresa Parceira LTDA pela doação dos materiais elétricos.', 'Diretoria', 'Administração', 5, 2, true),
('p1000000-0000-0000-0000-000000000002', 'history', 'Inauguração da Clínica', 'Após meses de trabalho, inauguramos oficialmente o Centro de Saúde Esperança!', 'Pra. Maria Souza', 'Responsável', 45, 30, true),
('p1000000-0000-0000-0000-000000000005', 'update', 'Novos Computadores', 'Recebemos 20 novos computadores para o laboratório de informática. Agora conseguiremos atender mais alunos!', 'Fernanda Lima', 'Responsável', 18, 5, true),
('p1000000-0000-0000-0000-000000000007', 'history', 'Primeira Casa Entregue', 'Entregamos a primeira casa do projeto para a família Silva. Momento de muita emoção!', 'Missionário João Baptista', 'Responsável', 52, 40, true),
('p1000000-0000-0000-0000-000000000010', 'update', 'Atendimento Ampliado', 'Com a chegada de novos médicos voluntários, ampliamos nossa capacidade de atendimento para 200 pacientes por dia.', 'Dr. Alberto Mendes', 'Responsável', 35, 28, true)
ON CONFLICT DO NOTHING;
