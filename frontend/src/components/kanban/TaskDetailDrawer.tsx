"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import axios from "axios"
import { Calendar, User as UserIcon, Tag, MessageSquare, Loader2, Sparkles } from "lucide-react"
import { useRealTime } from "@/components/RealTimeProvider"
import { useSession } from "next-auth/react"
import { cn } from "@/lib/utils"
import { Paperclip, X, Image as ImageIcon, File as FileIcon, Clock, Play, TrendingUp, BarChart } from "lucide-react"
import { useTimer } from "./TimerProvider"
import { CommentsSection } from "../Comments/CommentsSection"

import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"

const formSchema = z.object({
    title: z.string().min(2, {
        message: "Title must be at least 2 characters.",
    }),
    description: z.string().optional(),
    priority: z.string(),
    estimatedHours: z.number().min(0).optional(),
    storyPoints: z.number().optional(),
})

import { Link as LinkIcon, Lock, CheckCircle2 } from "lucide-react"

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
    labelIds?: string[]
    dependsOn?: Task[]
    dependsOnIds?: string[]
    estimatedHours?: number
    actualHours?: number
    storyPoints?: number
    subtasks?: Subtask[]
}

interface Subtask {
    id: string
    title: string
    completed: boolean
}

export function TaskDetailDrawer({
    task,
    projectId,
    open,
    onOpenChange,
    onTaskUpdated
}: {
    task: Task,
    projectId: string,
    open: boolean,
    onOpenChange: (open: boolean) => void,
    onTaskUpdated: () => void
}) {
    const { editingTasks, startEditing, stopEditing, emitTaskTimeUpdate } = useRealTime()
    const editingUser = editingTasks[task.id]

    const { data: session } = useSession()
    const [uploading, setUploading] = useState(false)
    const [isDragOver, setIsDragOver] = useState(false)

    // Global Timer
    const { activeTask: globalActiveTask, startTimer, stopTimer, elapsedSeconds } = useTimer()
    const isTimerActiveForThisTask = globalActiveTask?.id === task.id

    const handleFileUpload = async (files: FileList | null) => {
        if (!files || files.length === 0) return

        setUploading(true)
        const formData = new FormData()
        Array.from(files).forEach(file => {
            formData.append('files', file)
        })

        try {
            await axios.post(
                `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3200'}/tasks/${task.id}/attachments`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'x-user-id': (session?.user as any)?.id
                    }
                }
            )
            onTaskUpdated()
        } catch (error) {
            console.error("Failed to upload files:", error)
        } finally {
            setUploading(false)
        }
    }

    const [allProjectTasks, setAllProjectTasks] = useState<Task[]>([])
    const [projectLabels, setProjectLabels] = useState<Label[]>([])
    const [selectedLabels, setSelectedLabels] = useState<string[]>(task.labels?.map(l => l.id) || [])
    const [selectedDeps, setSelectedDeps] = useState<string[]>(task.dependsOn?.map(d => d.id) || [])

    // Subtask State
    const [subtasks, setSubtasks] = useState<Subtask[]>(task.subtasks || [])
    const [generatingSubtasks, setGeneratingSubtasks] = useState(false)

    const handleGenerateSubtasks = async () => {
        setGeneratingSubtasks(true)
        try {
            const res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3200'}/ai/generate-subtasks`, {
                taskId: task.id,
                taskTitle: task.title,
                taskDescription: task.description
            })
            setSubtasks(prev => [...prev, ...res.data])
            onTaskUpdated()
        } catch (error) {
            console.error("Failed to generate subtasks", error)
        } finally {
            setGeneratingSubtasks(false)
        }
    }

    const handleToggleSubtask = async (subtaskId: string, completed: boolean) => {
        // Optimistic update
        setSubtasks(prev => prev.map(s => s.id === subtaskId ? { ...s, completed } : s))

        try {
            await axios.patch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3200'}/tasks/subtasks/${subtaskId}/toggle`)
            onTaskUpdated()
        } catch (error) {
            console.error("Failed to toggle subtask", error)
            // Revert on failure
            setSubtasks(prev => prev.map(s => s.id === subtaskId ? { ...s, completed: !completed } : s))
        }
    }

    const fetchProjectData = async () => {
        if (!projectId || projectId === "undefined") return
        try {
            const [tasksRes, labelsRes] = await Promise.all([
                axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3200'}/projects/${projectId}`),
                axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3200'}/labels/project/${projectId}`)
            ])

            // Flatten tasks from columns
            const tasks = tasksRes.data.columns.flatMap((col: any) => col.tasks).filter((t: any) => t.id !== task.id)
            setAllProjectTasks(tasks)
            setProjectLabels(labelsRes.data)
        } catch (error) {
            console.error("Failed to fetch project labels/tasks:", error)
        }
    }

    useEffect(() => {
        if (open) {
            startEditing(task.id)
            fetchProjectData()
        }
        return () => {
            if (open) {
                stopEditing(task.id)
            }
        }
    }, [open, task.id, startEditing, stopEditing])

    useEffect(() => {
        const labels = task.labels?.map(l => l.id) || (task as any).labelIds || []
        const deps = task.dependsOn?.map(d => d.id) || (task as any).dependsOnIds || []
        setSelectedLabels(labels)
        setSelectedDeps(deps)
        setSubtasks(task.subtasks || [])
    }, [task])

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: task.title,
            description: task.description || "",
            priority: task.priority || "MEDIUM",
            estimatedHours: task.estimatedHours || 0,
            storyPoints: task.storyPoints || 0,
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            await axios.patch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3200'}/tasks/${task.id}`, {
                ...values,
                labelIds: selectedLabels,
                dependsOnIds: selectedDeps,
                storyPoints: Number(values.storyPoints),
                estimatedHours: Number(values.estimatedHours)
            }, {
                headers: { 'x-user-id': (session?.user as any)?.id }
            })
            onTaskUpdated()
            onOpenChange(false)
        } catch (error) {
            console.error("Failed to update task:", error)
        }
    }

    const getPriorityColor = (priority?: string) => {
        switch (priority) {
            case "HIGH": return "bg-red-500/10 text-red-500 hover:bg-red-500/20"
            case "MEDIUM": return "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20"
            case "LOW": return "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20"
            default: return "bg-slate-500/10 text-slate-500 hover:bg-slate-500/20"
        }
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-xl overflow-y-auto">
                <SheetHeader className="text-left space-y-4 mx-6">
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className={getPriorityColor(task.priority)}>
                            {task.priority || "MEDIUM"}
                        </Badge>
                    </div>
                    <SheetTitle className="text-2xl font-bold">{task.title}</SheetTitle>
                    <SheetDescription className="flex items-center gap-2">
                        <span>Reference: {task.id.slice(-6)}</span>
                        {editingUser && editingUser.isEditing && (
                            <span className="flex items-center gap-1.5 text-xs text-amber-500 font-medium animate-pulse ml-4 bg-amber-500/10 px-2 py-0.5 rounded-full">
                                <Loader2 className="h-3 w-3 animate-spin" />
                                {editingUser.user.name} is editing...
                            </span>
                        )}
                    </SheetDescription>
                </SheetHeader>

                <div className="mt-8 space-y-8 mx-8">


                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="priority"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <Tag className="h-4 w-4" /> Priority
                                            </FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select priority" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="LOW">Low</SelectItem>
                                                    <SelectItem value="MEDIUM">Medium</SelectItem>
                                                    <SelectItem value="HIGH">High</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormItem>
                                    )}
                                />
                                <div className="space-y-2">
                                    <FormLabel className="flex items-center gap-2">
                                        <UserIcon className="h-4 w-4" /> Assignee
                                    </FormLabel>
                                    <div className="flex items-center gap-2 p-2 rounded-md border bg-muted/30">
                                        <Avatar className="h-6 w-6 border shadow-sm">
                                            <AvatarImage src={task.assignee?.image ? (task.assignee.image.startsWith('http') ? task.assignee.image : `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3200'}${task.assignee.image}`) : ""} alt={task.assignee?.name} />
                                            <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">
                                                {task.assignee?.name?.[0] || "?"}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="text-sm font-medium">{task.assignee?.name || "Unassigned"}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 bg-muted/30 p-4 rounded-lg border border-dashed">
                                <FormItem>
                                    <FormLabel className="flex items-center gap-2">
                                        <Clock className="h-4 w-4" /> Time Tracking
                                    </FormLabel>
                                    <div className="flex flex-col gap-2 mt-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-medium">Actual Time: {task.actualHours?.toFixed(2) || "0.00"}h</span>
                                            <Button
                                                type="button"
                                                variant={isTimerActiveForThisTask ? "destructive" : "secondary"}
                                                size="sm"
                                                className={cn("h-7 gap-1.5", isTimerActiveForThisTask && "animate-pulse")}
                                                onClick={() => {
                                                    if (isTimerActiveForThisTask) {
                                                        stopTimer()
                                                    } else {
                                                        startTimer(task.id, task.title)
                                                    }
                                                }}
                                            >
                                                {isTimerActiveForThisTask ? (
                                                    <>
                                                        <Loader2 className="h-3 w-3 animate-spin" /> Stop Timer
                                                    </>
                                                ) : (
                                                    <>
                                                        <Play className="h-3 w-3" /> Start Timer
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                        {isTimerActiveForThisTask && (
                                            <p className="text-[10px] text-muted-foreground italic animate-pulse">
                                                Active: {elapsedSeconds}s (Syncing...)
                                            </p>
                                        )}
                                    </div>
                                </FormItem>

                                <FormField
                                    control={form.control}
                                    name="storyPoints"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <TrendingUp className="h-4 w-4" /> Story Points
                                            </FormLabel>
                                            <Select
                                                onValueChange={(v) => field.onChange(Number(v))}
                                                defaultValue={field.value?.toString()}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="h-8">
                                                        <SelectValue placeholder="Points" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {[0, 1, 2, 3, 5, 8, 13].map(p => (
                                                        <SelectItem key={p} value={p.toString()}>{p}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                <FormField
                                    control={form.control}
                                    name="estimatedHours"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <BarChart className="h-4 w-4" /> Estimated Hours
                                            </FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Input
                                                        type="number"
                                                        step="0.5"
                                                        placeholder="e.g. 8.0"
                                                        {...field}
                                                        onChange={(e) => field.onChange(Number(e.target.value))}
                                                    />
                                                    <span className="absolute right-3 top-2.5 text-xs text-muted-foreground font-medium">hours</span>
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Task Title</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="space-y-4">
                                <FormLabel className="flex items-center gap-2">
                                    <Tag className="h-4 w-4" /> Labels
                                </FormLabel>
                                <div className="flex flex-wrap gap-2">
                                    {projectLabels.map(label => (
                                        <Badge
                                            key={label.id}
                                            variant="outline"
                                            className={cn(
                                                "cursor-pointer transition-all",
                                                selectedLabels.includes(label.id)
                                                    ? "ring-2 ring-primary ring-offset-2"
                                                    : "opacity-60 hover:opacity-100"
                                            )}
                                            style={{
                                                backgroundColor: selectedLabels.includes(label.id) ? label.color : 'transparent',
                                                color: selectedLabels.includes(label.id) ? '#fff' : label.color,
                                                borderColor: label.color
                                            }}
                                            onClick={() => {
                                                setSelectedLabels(prev =>
                                                    prev.includes(label.id)
                                                        ? prev.filter(id => id !== label.id)
                                                        : [...prev, label.id]
                                                )
                                            }}
                                        >
                                            {label.name}
                                        </Badge>
                                    ))}
                                    {projectLabels.length === 0 && (
                                        <p className="text-xs text-muted-foreground italic">No labels created for this project.</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <FormLabel className="flex items-center gap-2">
                                    <LinkIcon className="h-4 w-4" /> Linked Tasks (Blockers)
                                </FormLabel>
                                <div className="space-y-2">
                                    <Select
                                        onValueChange={(taskId) => {
                                            if (!selectedDeps.includes(taskId)) {
                                                setSelectedDeps(prev => [...prev, taskId])
                                            }
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Add a blocker task..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {allProjectTasks.map(t => (
                                                <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <div className="flex flex-col gap-2 mt-2">
                                        {selectedDeps.map(depId => {
                                            const depTask = allProjectTasks.find(t => t.id === depId)
                                            if (!depTask) return null
                                            return (
                                                <div key={depId} className="flex items-center justify-between p-2 rounded-md border bg-muted/30 group">
                                                    <div className="flex items-center gap-2">
                                                        <Lock className="h-3 w-3 text-rose-500" />
                                                        <span className="text-sm">{depTask.title}</span>
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        onClick={() => setSelectedDeps(prev => prev.filter(id => id !== depId))}
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Add more detailed information about this task..."
                                                className="min-h-[150px] resize-none"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="space-y-4">
                                <FormLabel className="flex items-center gap-2">
                                    <Paperclip className="h-4 w-4" /> Attachments
                                </FormLabel>

                                <div
                                    className={cn(
                                        "relative border-2 border-dashed rounded-xl p-8 transition-all flex flex-col items-center justify-center gap-2 group",
                                        isDragOver ? "border-primary bg-primary/5 scale-[1.01]" : "border-muted-foreground/20 hover:border-primary/50 hover:bg-muted/30",
                                        uploading && "opacity-50 cursor-not-allowed"
                                    )}
                                    onDragOver={(e) => {
                                        e.preventDefault()
                                        setIsDragOver(true)
                                    }}
                                    onDragLeave={() => setIsDragOver(false)}
                                    onDrop={(e) => {
                                        e.preventDefault()
                                        setIsDragOver(false)
                                        handleFileUpload(e.dataTransfer.files)
                                    }}
                                >
                                    <input
                                        type="file"
                                        multiple
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        disabled={uploading}
                                        onChange={(e) => handleFileUpload(e.target.files)}
                                    />
                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2 group-hover:scale-110 transition-transform">
                                        {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Paperclip className="h-5 w-5" />}
                                    </div>
                                    <p className="text-sm font-semibold">
                                        {uploading ? "Uploading..." : "Click or drag files to upload"}
                                    </p>
                                    <p className="text-xs text-muted-foreground">Images or documents up to 10MB</p>
                                </div>

                                {task.attachments && task.attachments.length > 0 && (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
                                        {task.attachments.map((url, index) => {
                                            const isImage = url.match(/\.(jpeg|jpg|gif|png|webp)$/i)
                                            return (
                                                <div key={index} className="group relative rounded-lg border overflow-hidden aspect-video bg-muted/30 flex items-center justify-center">
                                                    {isImage ? (
                                                        <img
                                                            src={`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3200'}${url}`}
                                                            alt="Attachment"
                                                            className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                                        />
                                                    ) : (
                                                        <div className="flex flex-col items-center gap-1">
                                                            <FileIcon className="h-8 w-8 text-muted-foreground" />
                                                            <span className="text-[10px] text-muted-foreground font-medium px-2 truncate w-full text-center">
                                                                {url.split('/').pop()}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>

                            <div className="mt-6 pt-6 border-t border-slate-800">
                                <CommentsSection taskId={task.id} />
                            </div>

                            <Separator />

                            <div className="flex gap-3 justify-end">
                                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit">
                                    Save Changes
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </SheetContent>
        </Sheet >
    )
}
