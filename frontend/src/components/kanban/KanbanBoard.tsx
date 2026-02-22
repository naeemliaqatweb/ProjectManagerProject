import { ProjectSettingsModal } from "./ProjectSettingsModal"

import { useState } from "react"
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
    DragStartEvent,
    defaultDropAnimationSideEffects,
} from "@dnd-kit/core"
import {
    SortableContext,
    sortableKeyboardCoordinates,
    horizontalListSortingStrategy,
} from "@dnd-kit/sortable"
import axios from "axios"
import { useEffect } from "react"
import { KanbanColumn } from "./KanbanColumn"
import { KanbanTask } from "./KanbanTask"
import { CreateColumnModal } from "./CreateColumnModal"
import { useRealTime } from "@/components/RealTimeProvider"
import { ActivityFeed } from "./ActivityFeed"
import { Button } from "@/components/ui/button"
import { Search, Filter, X, History, Tag, Settings } from "lucide-react"
import { useSession } from "next-auth/react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

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
    labels?: Label[]
    dependsOn?: Task[]
    estimatedHours?: number
    actualHours?: number
    storyPoints?: number
}

interface Column {
    id: string
    title: string
    tasks: Task[]
}

interface Project {
    id: string
    name: string
    description?: string
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

export function KanbanBoard({ project, onRefresh }: { project: Project, onRefresh: () => void }) {
    const [activeTask, setActiveTask] = useState<Task | null>(null)
    const [activeColumn, setActiveColumn] = useState<Column | null>(null)
    const [showActivity, setShowActivity] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [priorityFilter, setPriorityFilter] = useState<string | null>(null)
    const [selectedLabels, setSelectedLabels] = useState<string[]>([])
    const [projectLabels, setProjectLabels] = useState<Label[]>([])

    const { data: session } = useSession()
    const { emitTaskMoved, emitColumnMoved, lastMovedTask } = useRealTime()

    const fetchLabels = async () => {
        if (!project?.id || project.id === "undefined") return
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3200'}/labels/project/${project.id}`)
            setProjectLabels(response.data)
        } catch (error) {
            console.error("Failed to fetch labels:", error)
        }
    }

    useEffect(() => {
        fetchLabels()
    }, [project.id])

    useEffect(() => {
        if (lastMovedTask) {
            onRefresh()
        }
    }, [lastMovedTask, onRefresh])

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    const sortedColumns = [...project.columns].sort((a: any, b: any) => (a.order || 0) - (b.order || 0));

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event
        const data = active.data.current

        if (data?.type === "Task") {
            setActiveTask(data.task)
            return
        }

        if (data?.type === "Column") {
            setActiveColumn(data.column)
            return
        }
    }

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event
        setActiveTask(null)
        setActiveColumn(null)

        if (!over) return

        const activeId = active.id as string
        const overId = over.id as string

        if (activeId === overId) return

        const activeType = active.data.current?.type
        const overType = over.data.current?.type

        // Handle Column Movement
        if (activeType === "Column") {
            let actualOverId = overId;
            if (overType === "Task") {
                const overTask = sortedColumns
                    .flatMap(c => c.tasks)
                    .find(t => t.id === overId);
                if (overTask && overTask.columnId) {
                    actualOverId = overTask.columnId;
                }
            }

            if (activeId === actualOverId) return;

            const activeColumnIndex = sortedColumns.findIndex(c => c.id === activeId)
            const overColumnIndex = sortedColumns.findIndex(c => c.id === actualOverId)

            if (activeColumnIndex !== -1 && overColumnIndex !== -1) {
                const newColumns = [...sortedColumns]
                const [movedColumn] = newColumns.splice(activeColumnIndex, 1)
                newColumns.splice(overColumnIndex, 0, movedColumn)

                try {
                    const updatePromises = newColumns.map((col, index) =>
                        axios.patch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3200'}/columns/${col.id}`, {
                            order: index
                        }, {
                            headers: { 'x-user-id': (session?.user as any)?.id }
                        })
                    )
                    await Promise.all(updatePromises)
                    emitColumnMoved(activeId, activeColumnIndex, overColumnIndex)
                    onRefresh()
                } catch (error) {
                    console.error("Failed to reorder columns:", error)
                }
            }
            return
        }

        // Handle Task Movement
        const activeTask = sortedColumns
            .flatMap((col) => col.tasks)
            .find((t) => t.id === activeId)

        let overColumnId = ""
        const overColumn = sortedColumns.find((col) => col.id === overId)
        if (overColumn) {
            overColumnId = overColumn.id
        } else {
            const overTask = sortedColumns
                .flatMap((col) => col.tasks)
                .find((t) => t.id === overId)
            if (overTask) {
                const col = sortedColumns.find((c) => c.tasks.some((t) => t.id === overId))
                if (col) overColumnId = col.id
            }
        }

        if (activeTask && overColumnId && activeTask.columnId !== overColumnId) {
            // Blocker check
            const targetColumn = sortedColumns.find(col => col.id === overColumnId)
            if (targetColumn && targetColumn.title.toLowerCase() === "done") {
                const isBlocked = (activeTask.dependsOn?.length || 0) > 0
                if (isBlocked) {
                    toast.error("Task is blocked!", {
                        description: `You must complete ${activeTask.dependsOn?.length} blocker task(s) before moving this to Done.`,
                    })
                    return
                }
            }

            try {
                await axios.patch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3200'}/tasks/${activeId}`, {
                    columnId: overColumnId
                }, {
                    headers: { 'x-user-id': (session?.user as any)?.id }
                })
                emitTaskMoved(activeId, activeTask.columnId || "", overColumnId)
                onRefresh()
            } catch (error) {
                console.error("Failed to move task:", error)
            }
        }
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="flex flex-col gap-4 mb-8">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                    <div className="flex flex-1 items-center gap-4 w-full max-w-2xl">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search tasks..."
                                className="pl-10 h-10 w-full bg-background/50 border-muted transition-all focus:ring-2 focus:ring-primary/20"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            {searchQuery && (
                                <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                                    <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                                </button>
                            )}
                        </div>
                        <div className="flex items-center gap-2 p-1 bg-muted/30 rounded-lg border border-muted shrink-0">
                            {['LOW', 'MEDIUM', 'HIGH'].map((priority) => (
                                <Button
                                    key={priority}
                                    variant={priorityFilter === priority ? "secondary" : "ghost"}
                                    size="sm"
                                    className={cn(
                                        "h-8 px-3 text-[10px] font-bold tracking-wider",
                                        priorityFilter === priority && priority === 'HIGH' && "bg-rose-500/10 text-rose-500 hover:bg-rose-500/20",
                                        priorityFilter === priority && priority === 'MEDIUM' && "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20",
                                        priorityFilter === priority && priority === 'LOW' && "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20",
                                        priorityFilter !== priority && "text-muted-foreground"
                                    )}
                                    onClick={() => setPriorityFilter(priorityFilter === priority ? null : priority)}
                                >
                                    {priority}
                                </Button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <ProjectSettingsModal project={project} onRefresh={onRefresh} />
                        <Button
                            variant="outline"
                            className="gap-2 h-10 bg-background/50 border-muted hover:bg-muted/50 transition-all"
                            onClick={() => setShowActivity(true)}
                        >
                            <History className="h-4 w-4" />
                            <span>Activity</span>
                        </Button>
                    </div>
                </div>

                <div className="flex items-center gap-2 p-2 bg-muted/20 rounded-xl border border-muted/50 overflow-x-auto no-scrollbar">
                    <Tag className="h-4 w-4 ml-2 text-muted-foreground shrink-0" />
                    <div className="flex gap-2">
                        {projectLabels.map((label) => (
                            <Button
                                key={label.id}
                                variant="ghost"
                                size="sm"
                                className={cn(
                                    "h-7 px-3 text-xs font-medium transition-all rounded-full border shrink-0",
                                    selectedLabels.includes(label.id)
                                        ? "ring-2 ring-offset-2 ring-primary"
                                        : "bg-background/40 hover:bg-background/80"
                                )}
                                style={{
                                    borderColor: label.color,
                                    color: selectedLabels.includes(label.id) ? '#fff' : label.color,
                                    backgroundColor: selectedLabels.includes(label.id) ? label.color : 'transparent'
                                }}
                                onClick={() => setSelectedLabels(prev =>
                                    prev.includes(label.id)
                                        ? prev.filter(id => id !== label.id)
                                        : [...prev, label.id]
                                )}
                            >
                                {label.name}
                            </Button>
                        ))}
                        {projectLabels.length === 0 && (
                            <span className="text-xs text-muted-foreground italic px-2">No project labels</span>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex gap-6 overflow-x-auto pb-6 scroll-smooth custom-scrollbar min-h-[calc(100vh-12rem)]">
                <SortableContext items={sortedColumns.map(c => c.id)} strategy={horizontalListSortingStrategy}>
                    {sortedColumns.map((column) => (
                        <KanbanColumn
                            key={column.id}
                            column={column}
                            onRefresh={onRefresh}
                            allColumns={sortedColumns}
                            searchQuery={searchQuery}
                            priorityFilter={priorityFilter}
                            selectedLabels={selectedLabels}
                            members={[project.owner, ...project.sharedWith]}
                            projectId={project.id}
                        />
                    ))}
                </SortableContext>

                <CreateColumnModal
                    projectId={project.id}
                    currentOrder={project.columns.length}
                    onColumnCreated={onRefresh}
                />
            </div>

            <DragOverlay dropAnimation={{
                sideEffects: defaultDropAnimationSideEffects({
                    styles: {
                        active: { opacity: "0.5" },
                    },
                }),
            }}>
                {activeTask ? (
                    <div className="w-80 opacity-90 scale-105 transition-transform rotate-2 pointer-events-none">
                        <KanbanTask
                            task={activeTask}
                            onRefresh={onRefresh}
                            allColumns={sortedColumns}
                            currentColumnId={activeTask.columnId || ""}
                            members={[project.owner, ...project.sharedWith]}
                            projectId={project.id}
                        />
                    </div>
                ) : activeColumn ? (
                    <div className="w-80 opacity-90 scale-105 transition-transform rotate-1 pointer-events-none">
                        <KanbanColumn
                            column={activeColumn}
                            onRefresh={onRefresh}
                            allColumns={sortedColumns}
                            searchQuery={searchQuery}
                            priorityFilter={priorityFilter}
                            selectedLabels={selectedLabels}
                            members={[project.owner, ...project.sharedWith]}
                            projectId={project.id}
                        />
                    </div>
                ) : null}
            </DragOverlay>

            <ActivityFeed
                projectId={project.id}
                open={showActivity}
                onOpenChange={setShowActivity}
            />
        </DndContext>
    )
}
