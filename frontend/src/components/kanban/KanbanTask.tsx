"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import axios from "axios"
import { EditTaskModal } from "./EditTaskModal"
import { MoveTaskModal } from "./MoveTaskModal"
import { TaskDetailDrawer } from "./TaskDetailDrawer"
import { Badge } from "@/components/ui/badge"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { MoreHorizontal, Trash2, UserPlus, Lock, Link as LinkIcon, AlertCircle, Sparkles } from "lucide-react"
import { useSearchParams } from "next/navigation"

interface Label {
    id: string
    name: string
    color: string
}

interface Task {
    id: string
    title: string
    description?: string
    priority?: string
    columnId?: string
    assignee?: {
        name?: string
        image?: string
    }
    attachments?: string[]
    labels?: Label[]
    dependsOn?: Task[]
    estimatedHours?: number
    actualHours?: number
    storyPoints?: number
}

interface Column {
    id: string
    title: string
}

export function KanbanTask({
    task,
    onRefresh,
    allColumns,
    currentColumnId,
    members,
    projectId
}: {
    task: Task,
    onRefresh: () => void,
    allColumns: Column[],
    currentColumnId: string,
    members: any[],
    projectId: string
}) {
    const [drawerOpen, setDrawerOpen] = useState(false)
    const searchParams = useSearchParams()
    const isHighlighted = searchParams.get("highlight") === task.id

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({
        id: task.id,
        data: {
            type: "Task",
            task,
        }
    })

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
    }

    const handleDelete = async () => {
        if (confirm("Are you sure you want to delete this task?")) {
            try {
                await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3200'}/tasks/${task.id}`)
                onRefresh()
            } catch (error) {
                console.error("Failed to delete task:", error)
            }
        }
    }

    const handleAssigneeUpdate = async (userId: string | null) => {
        try {
            await axios.patch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3200'}/tasks/${task.id}`, {
                assigneeId: userId
            })
            onRefresh()
        } catch (error) {
            console.error("Failed to update assignee:", error)
        }
    }

    const getPriorityColor = (priority?: string) => {
        switch (priority) {
            case "HIGH": return "bg-red-500/10 text-red-500 border-red-500/20"
            case "MEDIUM": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
            case "LOW": return "bg-blue-500/10 text-blue-500 border-blue-500/20"
            default: return "bg-slate-500/10 text-slate-500 border-slate-500/20"
        }
    }

    if (isDragging) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className="h-[100px] w-full rounded-xl border-2 border-dashed border-primary/20 bg-muted/30"
            />
        )
    }

    return (
        <>
            <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
            >
                <Card
                    ref={setNodeRef}
                    style={style}
                    {...attributes}
                    {...listeners}
                    {...attributes}
                    {...listeners}
                    className={cn(
                        "group relative bg-card hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-md cursor-grab active:cursor-grabbing overflow-hidden",
                        isHighlighted && "border-l-4 border-l-emerald-500 ring-1 ring-emerald-500/20 shadow-lg shadow-emerald-500/10 animate-pulse bg-emerald-50/10"
                    )}
                    onClick={() => setDrawerOpen(true)}
                >
                    {isHighlighted && (
                        <div className="absolute top-0 right-0 p-1 bg-emerald-500 text-white rounded-bl-lg z-10 shadow-sm">
                            <Sparkles className="h-3 w-3" />
                        </div>
                    )}
                    {task.attachments && task.attachments.length > 0 && task.attachments.find(url => url.match(/\.(jpeg|jpg|gif|png|webp)$/i)) && (
                        <div className="relative w-full h-32 overflow-hidden border-b bg-muted/50">
                            <img
                                src={`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3200'}${task.attachments.find(url => url.match(/\.(jpeg|jpg|gif|png|webp)$/i))}`}
                                alt="Task cover"
                                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                            />
                        </div>
                    )}
                    <CardContent className="p-3 space-y-3">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-1.5">
                                <Badge variant="outline" className={`px-1.5 py-0 text-[10px] font-bold ${getPriorityColor(task.priority)}`}>
                                    {task.priority || "MEDIUM"}
                                </Badge>
                                {task.storyPoints !== undefined && task.storyPoints > 0 && (
                                    <Badge variant="secondary" className="px-1.5 py-0 text-[10px] font-bold bg-indigo-500/10 text-indigo-500 border-indigo-500/20">
                                        {task.storyPoints} pts
                                    </Badge>
                                )}
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                        className="text-destructive"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handleDelete()
                                        }}
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        <div className="flex flex-wrap gap-1 mt-1">
                            {task.labels?.map(label => (
                                <div
                                    key={label.id}
                                    className="h-1 w-6 rounded-full"
                                    style={{ backgroundColor: label.color }}
                                    title={label.name}
                                />
                            ))}
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold leading-tight flex-1">{task.title}</span>
                            {task.dependsOn && task.dependsOn.length > 0 && (
                                <div className="flex items-center gap-0.5 text-rose-500" title={`Blocked by ${task.dependsOn.length} tasks`}>
                                    <Lock className="h-3 w-3" />
                                </div>
                            )}
                        </div>

                        {task.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                {task.description}
                            </p>
                        )}

                        {task.estimatedHours !== undefined && task.estimatedHours > 0 && (
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between text-[10px] text-muted-foreground font-medium">
                                    <span>Progress</span>
                                    <span>{Math.min(Math.round(((task.actualHours || 0) / task.estimatedHours) * 100), 100)}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden border shadow-inner flex">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min(((task.actualHours || 0) / (task.estimatedHours || 1)) * 100, 100)}%` }}
                                        className={cn(
                                            "h-full transition-all duration-500",
                                            ((task.actualHours || 0) / (task.estimatedHours || 1)) >= 1 ? "bg-rose-500" :
                                                ((task.actualHours || 0) / (task.estimatedHours || 1)) >= 0.7 ? "bg-amber-500" :
                                                    "bg-emerald-500"
                                        )}
                                    />
                                    {((task.actualHours || 0) / (task.estimatedHours || 1)) < 1 && (
                                        <motion.div
                                            initial={{ width: "100%" }}
                                            animate={{ width: `${100 - Math.min(((task.actualHours || 0) / (task.estimatedHours || 1)) * 100, 100)}%` }}
                                            className={cn(
                                                "h-full transition-all duration-500 opacity-30",
                                                ((task.actualHours || 0) / (task.estimatedHours || 1)) >= 0.7 ? "bg-amber-500" : "bg-emerald-500"
                                            )}
                                        />
                                    )}
                                </div>
                                <div className="flex items-center justify-between text-[9px] text-muted-foreground/60 italic">
                                    <span className="font-semibold text-primary/70">{(task.actualHours || 0).toFixed(2)}h actual</span>
                                    <span>{task.estimatedHours}h est.</span>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center justify-between pt-1">
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                            </div>
                            <div className="flex -space-x-2">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button
                                            className="h-6 w-6 rounded-full border-2 border-background ring-2 ring-primary/5 shadow-sm overflow-hidden hover:ring-primary/20 transition-all group/assignee"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <Avatar className="h-full w-full">
                                                <AvatarImage src={task.assignee?.image ? (task.assignee.image.startsWith('http') ? task.assignee.image : `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3200'}${task.assignee.image}`) : ""} alt={task.assignee?.name} />
                                                <AvatarFallback className="bg-primary/5 text-primary text-[8px] font-extrabold uppercase flex items-center justify-center">
                                                    {task.assignee ? (task.assignee.name?.[0] || "?") : <UserPlus className="h-3 w-3 text-muted-foreground group-hover/assignee:text-primary transition-colors" />}
                                                </AvatarFallback>
                                            </Avatar>
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-56">
                                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleAssigneeUpdate(null); }}>
                                            <UserPlus className="mr-2 h-4 w-4" />
                                            <span>Unassigned</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        {members.map((member) => (
                                            <DropdownMenuItem
                                                key={member.id}
                                                onClick={(e) => { e.stopPropagation(); handleAssigneeUpdate(member.id); }}
                                                className="flex items-center gap-2"
                                            >
                                                <Avatar className="h-6 w-6">
                                                    <AvatarImage src={member.image ? (member.image.startsWith('http') ? member.image : `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3200'}${member.image}`) : ""} />
                                                    <AvatarFallback className="text-[10px]">{member.name?.[0] || "?"}</AvatarFallback>
                                                </Avatar>
                                                <span>{member.name}</span>
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            <TaskDetailDrawer
                task={task}
                projectId={projectId}
                open={drawerOpen}
                onOpenChange={setDrawerOpen}
                onTaskUpdated={onRefresh}
            />
        </>
    )
}
