import { notFound } from "next/navigation"
import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import { getProjectPaidAmount } from "@/lib/actions/finance/sync-actions"
import { ProjectDetailsView } from "./project-details-view"

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params

    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    // Fetch project with entity
    const { data: project, error: projectError } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id)
        .eq("active", true)
        .single()

    if (projectError || !project) {
        notFound()
    }

    // Fetch entity if exists
    let entityName = "Sem entidade"
    if (project.entity_id) {
        const { data: entity } = await supabase
            .from("entities")
            .select("name, slug")
            .eq("id", project.entity_id)
            .single()
        if (entity) {
            entityName = entity.name
        }
    }

    // Fetch categories
    const { data: categoryLinks } = await supabase
        .from("project_categories")
        .select("category_id")
        .eq("project_id", id)
        .eq("active", true)

    let categoryName = "Sem categoria"
    if (categoryLinks && categoryLinks.length > 0) {
        const { data: category } = await supabase
            .from("categories")
            .select("name")
            .eq("id", categoryLinks[0].category_id)
            .single()
        if (category) {
            categoryName = category.name
        }
    }

    // Fetch tags
    const { data: tagsData } = await supabase
        .from("project_tags")
        .select("tags(name)")
        .eq("project_id", id)
        .eq("active", true)
    const tags = ((tagsData as unknown as Array<{ tags?: { name: string } | null }>)?.map((t) => t.tags?.name).filter(Boolean) as string[]) || []

    // Fetch investments
    const { data: investmentsData } = await supabase
        .from("project_investments")
        .select("*")
        .eq("project_id", id)
        .eq("active", true)
        .order("year", { ascending: true })

    // Fetch posts
    const { data: postsData } = await supabase
        .from("project_posts")
        .select("*")
        .eq("project_id", id)
        .eq("active", true)
        .order("created_at", { ascending: false })

    // Fetch paid amount from Finance API using the financial linked ID
    let paidAmount = 0
    if (project.financial_project_id) {
        paidAmount = await getProjectPaidAmount(project.financial_project_id)
    }

    // Transform to view format (compatible with DashboardProject)
    const projectData = {
        id: project.id,
        title: project.title,
        description: project.description || "",
        responsible: project.responsible,
        institution: entityName,
        investment: Number(project.investment) || 0,
        country: project.country || "",
        state: project.state || "",
        municipality: project.municipality || "",
        category: categoryName,
        tags: tags,
        status: project.status,
        extension: project.extension,
        investmentByYear: (investmentsData || []).map(inv => ({
            year: inv.year,
            value: Number(inv.value)
        })),
        indication: project.indication,
        startDate: project.start_date,
        endDate: project.end_date,
        requestedValue: Number(project.requested_value) || 0,
        approvedValue: Number(project.approved_value) || 0,
        paidAmount: paidAmount,
        thanked: project.thanked,
        reachedPeople: project.reached_people || 0,
        lastVisit: project.last_visit,
        feed: (postsData || []).map(post => ({
            id: post.id,
            type: post.type,
            title: post.title,
            author: post.author_name,
            role: post.author_role,
            date: post.created_at,
            content: post.content,
            likes: post.likes_count,
            prayers: post.prayers_count,
            comments: [],
        })),
        attachments: [],
        observations: project.observations,
    }

    return <ProjectDetailsView initialProject={projectData} />
}
