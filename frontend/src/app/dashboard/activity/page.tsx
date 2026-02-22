"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { useSession } from "next-auth/react"
import { formatDistanceToNow } from "date-fns"
import {
    History,
    PlusCircle,
    ArrowRightLeft,
    Pencil,
    Trash2,
    Share2,
    Layout,
    CheckCircle2
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface Activity {
    id: string
    action: string
    details: string
    timestamp: string
    user: {
        name: string | null
        email: string
        image: string | null
    }
    project: {
        name: string
    }
}

export default function GlobalActivityPage() {
    const { data: session } = useSession()
    const [activities, setActivities] = useState<Activity[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (session?.user) {
            fetchActivities()
        }
    }, [session])

    const fetchActivities = async () => {
        setLoading(true)
        try {
            const userId = (session?.user as any)?.id
            if (!userId) return

            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3200'}/activity/user/${userId}`
            )
            setActivities(response.data)
        } catch (error) {
            console.error("Failed to fetch activities:", error)
        } finally {
            setLoading(false)
        }
    }

    const getImageUrl = (imagePath: string | null) => {
        if (!imagePath) return ""
        if (imagePath.startsWith('http')) return imagePath
        return `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3200'}${imagePath}`
    }

    const getActionIcon = (action: string) => {
        switch (action) {
            case 'TASK_CREATED':
                return <PlusCircle className="h-4 w-4 text-emerald-500" />
            case 'TASK_MOVED':
                return <ArrowRightLeft className="h-4 w-4 text-blue-500" />
            case 'TASK_UPDATED':
                return <Pencil className="h-4 w-4 text-amber-500" />
            case 'TASK_DELETED':
                return <Trash2 className="h-4 w-4 text-rose-500" />
            case 'COLUMN_CREATED':
                return <Layout className="h-4 w-4 text-purple-500" />
            case 'COLUMN_UPDATED':
                return <CheckCircle2 className="h-4 w-4 text-indigo-500" />
            case 'PROJECT_SHARED':
                return <Share2 className="h-4 w-4 text-cyan-500" />
            default:
                return <History className="h-4 w-4 text-muted-foreground" />
        }
    }

    const getActionColor = (action: string) => {
        if (action.includes('CREATED')) return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
        if (action.includes('UPDATED')) return "bg-amber-500/10 text-amber-500 border-amber-500/20"
        if (action.includes('DELETED')) return "bg-rose-500/10 text-rose-500 border-rose-500/20"
        if (action.includes('MOVED')) return "bg-blue-500/10 text-blue-500 border-blue-500/20"
        return "bg-muted text-muted-foreground"
    }

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <History className="h-6 w-6" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Recent Activity</h1>
                    <p className="text-muted-foreground">Keep track of updates across all your projects</p>
                </div>
            </div>

            <Card className="border-none shadow-none bg-transparent">
                <CardContent className="p-0">
                    <div className="space-y-6">
                        {loading && activities.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 bg-background rounded-2xl border border-dashed">
                                <span className="text-sm text-muted-foreground animate-pulse">Loading activity history...</span>
                            </div>
                        ) : activities.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center bg-background rounded-2xl border border-dashed">
                                <History className="h-12 w-12 text-muted/20 mb-4" />
                                <h3 className="font-semibold text-lg">No activity yet</h3>
                                <p className="text-sm text-muted-foreground max-w-[250px] mx-auto">
                                    Start working on your projects to see your activity feed here.
                                </p>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {activities.map((activity) => (
                                    <div
                                        key={activity.id}
                                        className="group relative bg-card hover:bg-muted/50 transition-all border rounded-2xl p-4 flex gap-4 items-start"
                                    >
                                        <div className="h-10 w-10 flex-shrink-0 bg-background rounded-xl border flex items-center justify-center shadow-sm">
                                            {getActionIcon(activity.action)}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                                                <div className="flex items-center gap-2">
                                                    <Avatar className="h-5 w-5 border">
                                                        <AvatarImage src={getImageUrl(activity.user.image)} />
                                                        <AvatarFallback className="text-[8px]">
                                                            {activity.user.name?.[0] || activity.user.email?.[0]}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <span className="text-sm font-semibold truncate">
                                                        {activity.user.name || activity.user.email}
                                                    </span>
                                                </div>
                                                <span className="hidden sm:inline text-muted-foreground text-sm">•</span>
                                                <Badge variant="outline" className={cn("text-[10px] w-fit", getActionColor(activity.action))}>
                                                    {activity.action.replace('_', ' ')}
                                                </Badge>
                                                <span className="text-xs text-muted-foreground sm:ml-auto">
                                                    {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                                                </span>
                                            </div>

                                            <p className="text-sm text-muted-foreground leading-relaxed mb-2">
                                                {activity.details}
                                            </p>

                                            <div className="flex items-center gap-1 text-[11px] font-medium text-primary/60">
                                                <Layout className="h-3 w-3" />
                                                {activity.project.name}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
