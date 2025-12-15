// Mock Types
export interface FinancialProject {
    id: string;
    description: string; // The "name" in the financial app
    costCenterCode: string;
    status: 'Active' | 'Inactive';
    approvedValue: number;
    investedValue: number;
    startDate: string;
    managerName: string;
}

const MOCK_FINANCIAL_PROJECTS: FinancialProject[] = [
    {
        id: "fin_1",
        description: "Projeto Educar Mais",
        costCenterCode: "CC-2024-001",
        status: 'Active',
        approvedValue: 250000,
        investedValue: 120000,
        startDate: "2024-01-10",
        managerName: "Carlos Silva"
    },
    {
        id: "fin_2",
        description: "Reforma Base 3 - Cozinha",
        costCenterCode: "CC-2024-005",
        status: 'Active',
        approvedValue: 80000,
        investedValue: 15000,
        startDate: "2024-03-01",
        managerName: "Ana Souza"
    },
    {
        id: "fin_3",
        description: "Ação Social Julho",
        costCenterCode: "CC-2024-012",
        status: 'Active',
        approvedValue: 45000,
        investedValue: 45000,
        startDate: "2024-07-01",
        managerName: "Roberto Dias"
    },
    {
        id: "fin_4",
        description: "Nova Sede Administrativa",
        costCenterCode: "CC-2025-001",
        status: 'Active',
        approvedValue: 1200000,
        investedValue: 0,
        startDate: "2025-01-01",
        managerName: "Diretoria"
    },
     {
        id: "fin_5",
        description: "Manutenção Frota 2024",
        costCenterCode: "CC-2024-099",
        status: 'Active',
        approvedValue: 60000,
        investedValue: 35000,
        startDate: "2024-01-01",
        managerName: "Logística"
    }
];

// Mock Service
export const financialService = {
    // Search projects by name (case insensitive)
    async searchFinancialProjects(query: string): Promise<FinancialProject[]> {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        if (!query) return [];
        
        const lowerQuery = query.toLowerCase();
        return MOCK_FINANCIAL_PROJECTS.filter(p => 
            p.description.toLowerCase().includes(lowerQuery) || 
            p.costCenterCode.toLowerCase().includes(lowerQuery)
        );
    },

    // Get projects that are "new" (simulate finding projects not yet in ASEEC)
    // In a real scenario, this would compare against the local DB or accept a flag from the API
    async getUnsyncedProjects(): Promise<FinancialProject[]> {
         await new Promise(resolve => setTimeout(resolve, 800));
         
         // Let's pretend fin_4 and fin_5 are new
         return MOCK_FINANCIAL_PROJECTS.filter(p => ["fin_4", "fin_5"].includes(p.id));
    },

    async getFinancialProjectById(id: string): Promise<FinancialProject | undefined> {
        await new Promise(resolve => setTimeout(resolve, 300));
        return MOCK_FINANCIAL_PROJECTS.find(p => p.id === id);
    }
};
