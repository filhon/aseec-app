import { notFound } from "next/navigation"
import { mockDashboardProjects } from "@/components/dashboard/data"
import { ProjectDetailsView } from "./project-details-view"

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const project = mockDashboardProjects.find(p => p.id === id)

    if (!project) {
        notFound()
    }

    // Since we're moving to a Client Component for the view, we pass the initial data
    return <ProjectDetailsView initialProject={project} />
}
