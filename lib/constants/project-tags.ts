export const projectTags = [
    { id: "reforma", label: "Reforma" },
    { id: "ampliacao", label: "Ampliação" },
    { id: "manutencao", label: "Manutenção" },
    { id: "eletrica", label: "Elétrica" },
    { id: "hidraulica", label: "Hidráulica" },
    { id: "pintura", label: "Pintura" },
    { id: "acabamento", label: "Acabamento" },
    { id: "estrutura", label: "Estrutura" },
    { id: "telhado", label: "Telhado" },
    { id: "mobiliario", label: "Mobiliário" },
    { id: "ti", label: "TI / Tecnologia" },
    { id: "seguranca", label: "Segurança" },
] as const

export type ProjectTag = typeof projectTags[number]["id"]
