export interface ProjectLocation {
  id: string
  title: string
  responsible: string
  address: string
  lat: number
  lng: number
  type: "blue" | "green"
}

export const mockProjects: ProjectLocation[] = [
  {
    id: "1",
    title: "Hebron Base 1",
    responsible: "Pr. João Silva",
    address: "Rua das Oliveiras, 123 - São Paulo, SP",
    lat: -23.5505,
    lng: -46.6333,
    type: "green"
  },
  {
    id: "2",
    title: "Hebron Base 2",
    responsible: "Pra. Maria Souza",
    address: "Av. das Nações, 456 - Brasília, DF",
    lat: -15.7975,
    lng: -47.8919,
    type: "blue"
  },
  // Cluster in Rio de Janeiro
  {
    id: "3",
    title: "Projeto Esperança",
    responsible: "Carlos Eduardo",
    address: "Rua da Paz, 10 - Rio de Janeiro, RJ",
    lat: -22.9068,
    lng: -43.1729,
    type: "green"
  },
  {
    id: "4",
    title: "Casa de Apoio Vida",
    responsible: "Ana Clara",
    address: "Av. Atlântica, 500 - Rio de Janeiro, RJ",
    lat: -22.9100, // Close to prev
    lng: -43.1750,
    type: "blue"
  },
  {
    id: "5",
    title: "Centro Comunitário Luz",
    responsible: "Pedro Henrique",
    address: "Rua Voluntários, 88 - Rio de Janeiro, RJ",
    lat: -22.9080, // Close to prev
    lng: -43.1740,
    type: "green"
  },
  // Cluster in Recife
  {
    id: "6",
    title: "Missão Nordeste",
    responsible: "Felipe Santos",
    address: "Rua do Sol, 200 - Recife, PE",
    lat: -8.0476,
    lng: -34.8770,
    type: "blue"
  },
  {
    id: "7",
    title: "Projeto Criança Feliz",
    responsible: "Mariana Costa",
    address: "Av. Boa Viagem, 1500 - Recife, PE",
    lat: -8.0500,
    lng: -34.8800,
    type: "green"
  }
]
