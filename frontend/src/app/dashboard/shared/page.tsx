"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import axios from "axios"
import Link from "next/link"
import {
    Users,
    Calendar,
    ArrowRight,
    Layout,
    ExternalLink,
    User as UserIcon,
    Search
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

interface Project {
    id: string
    name: string
    description?: string
    owner: {
        id: string
        name?: string
        email: string
    }
    createdAt: string
}

interface SessionUser {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
}

export default function SharedProjectsPage() {
    const { data: session, status } = useSession()
    const user = session?.user as SessionUser
    const router = useRouter()
    const [projects, setProjects] = useState<Project[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")

    const fetchSharedProjects = async () => {
        if (!user?.id) return
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3200'}/projects/shared/${user.id}`)
            setProjects(response.data)
        } catch (error) {
            console.error("Failed to fetch shared projects:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login")
        } else if (status === "authenticated") {
            fetchSharedProjects()
        }
    }, [status, session])

    const filteredProjects = projects.filter(project =>
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.owner.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.owner.name?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div className="h-10 w-48 bg-muted animate-pulse rounded-md" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-48 bg-muted animate-pulse rounded-xl border" />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                        Shared With Me
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Projects where you are a collaborator
                    </p>
                </div>
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search shared projects..."
                        className="pl-9 h-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {filteredProjects.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-card/50 rounded-2xl border-2 border-dashed border-muted transition-colors hover:border-primary/20">
                    <div className="h-16 w-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
                        <Users className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h2 className="text-xl font-semibold">No shared projects found</h2>
                    <p className="text-muted-foreground mt-2 max-w-xs text-center">
                        When someone shares a project with you, it will appear here.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProjects.map((project) => (
                        <Link
                            href={`/dashboard/projects/${project.id}`}
                            key={project.id}
                            className="group block"
                        >
                            <Card className="h-full border border-muted hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-card overflow-hidden">
                                <CardHeader className="pb-3">
                                    <div className="flex justify-between items-start mb-2">
                                        <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                                            Collaborator
                                        </Badge>
                                        <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                    <CardTitle className="text-xl font-bold line-clamp-1 group-hover:text-primary transition-colors">
                                        {project.name}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pb-4">
                                    <p className="text-sm text-muted-foreground line-clamp-2 h-10 leading-relaxed mb-6">
                                        {project.description || "No description provided."}
                                    </p>
                                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-muted/50">
                                        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold ring-2 ring-background">
                                            {project.owner.name?.[0] || project.owner.email[0].toUpperCase()}
                                        </div>
                                        <div className="flex flex-col overflow-hidden">
                                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Owner</span>
                                            <span className="text-xs font-medium truncate">{project.owner.name || project.owner.email}</span>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="pt-0 flex justify-between items-center text-xs text-muted-foreground border-t border-muted/50 bg-muted/10 px-6 py-4">
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="h-3.5 w-3.5" />
                                        <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center gap-1 font-semibold text-primary/80 group-hover:text-primary transition-colors">
                                        Open Board
                                        <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </CardFooter>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}
