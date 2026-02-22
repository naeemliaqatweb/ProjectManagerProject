"use client"

import { useEffect, useState, use } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import axios from "axios"
import { KanbanBoard } from "@/components/kanban/KanbanBoard"
import { KanbanSkeleton } from "@/components/kanban/KanbanSkeleton"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"

interface Task {
    id: string
    title: string
    description?: string
    priority?: string
    assignee?: {
        name?: string
        image?: string
    }
}

interface Column {
    id: string
    title: string
    tasks: Task[]
    order: number
}

interface Project {
    id: string
    name: string
    description?: string
    ownerId: string
    owner: {
        id: string
        name?: string
        image?: string
    }
    sharedWith: {
        id: string
        name?: string
        image?: string
    }[]
    columns: Column[]
}

import { ShareProjectModal } from "@/components/kanban/ShareProjectModal"

interface SessionUser {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
}

export default function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const { data: session, status } = useSession()
    const user = session?.user as SessionUser
    const router = useRouter()
    const searchParams = useSearchParams()
    const [project, setProject] = useState<Project | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    const fetchProject = async () => {
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3200'}/projects/${id}`)
            setProject(response.data)
        } catch (err: any) {
            console.error("Failed to fetch project:", err)
            setError(err.response?.data?.message || "Failed to load project details.")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login")
            return
        }

        if (status === "authenticated") {
            fetchProject()
        }
    }, [id, status, router, searchParams])

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="space-y-2">
                    <div className="h-8 w-64 bg-muted animate-pulse rounded-md" />
                    <div className="h-4 w-96 bg-muted animate-pulse rounded-md" />
                </div>
                <KanbanSkeleton />
            </div>
        )
    }

    if (error || !project) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-card rounded-xl border border-destructive/20 text-center">
                <h2 className="text-xl font-semibold text-destructive">Error Loading Project</h2>
                <p className="text-muted-foreground mt-2 mb-6">{error || "Project not found."}</p>
                <Link href="/dashboard">
                    <Button variant="outline">Back to Dashboard</Button>
                </Link>
            </div>
        )
    }

    const isOwner = user?.id === project.ownerId

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 -ml-1">
                        <Link href="/dashboard">
                            <Button variant="ghost" size="sm" className="h-8 gap-1 text-muted-foreground hover:text-foreground">
                                <ChevronLeft className="h-4 w-4" />
                                Back to Projects
                            </Button>
                        </Link>
                    </div>
                    {isOwner && (
                        <ShareProjectModal projectId={project.id} projectName={project.name} />
                    )}
                </div>
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
                    {project.description && (
                        <p className="text-muted-foreground text-sm max-w-3xl">
                            {project.description}
                        </p>
                    )}
                </div>
            </div>

            <KanbanBoard project={project} onRefresh={fetchProject} />
        </div>
    )
}
