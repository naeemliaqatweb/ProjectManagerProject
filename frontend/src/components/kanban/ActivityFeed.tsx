"use client"

import { useEffect, useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import axios from "axios"
import { formatDistanceToNow } from "date-fns"
import { History, Move, Plus, Trash2, Edit } from "lucide-react"

interface Activity {
    id: string
    action: string
    details: string
    timestamp: string
    user: {
        name: string
        image: string
        email: string
    }
}

export function ActivityFeed({
    projectId,
    open,
    onOpenChange
}: {
    projectId: string
    open: boolean
    onOpenChange: (open: boolean) => void
}) {
    const [activities, setActivities] = useState<Activity[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (open && projectId) {
            fetchActivities()
        }
    }, [open, projectId])

    const fetchActivities = async () => {
        if (!projectId || projectId === "undefined") return
        setLoading(true)
        try {
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3200'}/activity/project/${projectId}`
            )
            setActivities(response.data)
        } catch (error) {
            console.error("Failed to fetch activities:", error)
        } finally {
            setLoading(false)
        }
    }

    const getActionIcon = (action: string) => {
        switch (action) {
            case "TASK_CREATED": return <Plus className="h-3 w-3 text-green-500" />
            case "TASK_MOVED": return <Move className="h-3 w-3 text-blue-500" />
            case "TASK_DELETED": return <Trash2 className="h-3 w-3 text-red-500" />
            case "TASK_UPDATED": return <Edit className="h-3 w-3 text-yellow-500" />
            default: return <History className="h-3 w-3 text-muted-foreground" />
        }
    }

    const getImageUrl = (imagePath: string | null) => {
        if (!imagePath) return ""
        if (imagePath.startsWith("http")) return imagePath
        return `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3200"}${imagePath}`
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-[400px] sm:w-[450px]">
                <SheetHeader className="mb-6">
                    <div className="flex items-center gap-2">
                        <History className="h-5 w-5 text-primary" />
                        <SheetTitle>Activity Feed</SheetTitle>
                    </div>
                </SheetHeader>
                <div className="h-[calc(100vh-120px)] overflow-y-auto pr-4 custom-scrollbar">
                    <div className="space-y-6">
                        {loading && activities.length === 0 ? (
                            <div className="flex items-center justify-center py-10">
                                <span className="text-sm text-muted-foreground">Loading history...</span>
                            </div>
                        ) : activities.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 text-center">
                                <History className="h-10 w-10 text-muted/30 mb-2" />
                                <p className="text-sm text-muted-foreground">No activity yet</p>
                            </div>
                        ) : (
                            activities.map((activity) => (
                                <div key={activity.id} className="flex gap-3 relative pb-6 border-l ml-3 pl-6 last:pb-0">
                                    <div className="absolute left-[-13px] top-0 bg-background border p-1 rounded-full shadow-sm z-10">
                                        {getActionIcon(activity.action)}
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-6 w-6 border">
                                                    <AvatarImage src={getImageUrl(activity.user.image)} />
                                                    <AvatarFallback className="text-[10px]">
                                                        {activity.user.name?.[0] || activity.user.email?.[0]}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span className="text-sm font-semibold truncate max-w-[120px]">
                                                    {activity.user.name || activity.user.email}
                                                </span>
                                            </div>
                                            <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                                {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                                            </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground leading-snug">
                                            {activity.details}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}
