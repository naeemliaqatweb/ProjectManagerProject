"use client"

import { MoreHorizontal, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { KanbanTask } from "./KanbanTask"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CreateTaskModal } from "./CreateTaskModal"
import axios from "axios"
import { EditColumnModal } from "./EditColumnModal"
import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { useSession } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"

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

export function KanbanColumn({
    column,
    onRefresh,
    allColumns,
    searchQuery,
    priorityFilter,
    selectedLabels,
    members,
    projectId
}: {
    column: Column,
    onRefresh: () => void,
    allColumns: any[],
    searchQuery?: string,
    priorityFilter?: string | null,
    selectedLabels?: string[],
    members: any[],
    projectId: string
}) {
    const {
        attributes,
        listeners,
        setNodeRef: setSortableNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({
        id: column.id,
        data: {
            type: "Column",
            column,
        }
    })

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
    }

    const { setNodeRef: setDroppableNodeRef } = useDroppable({
        id: column.id,
    })

    const setNodeRef = (node: HTMLElement | null) => {
        setSortableNodeRef(node)
        setDroppableNodeRef(node)
    }

    const { data: session } = useSession()

    const handleDeleteColumn = async () => {
        if (confirm("Are you sure you want to delete this column and all its tasks?")) {
            try {
                await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3200'}/columns/${column.id}`, {
                    headers: { 'x-user-id': (session?.user as any)?.id }
                })
                onRefresh()
            } catch (error) {
                console.error("Failed to delete column:", error)
            }
        }
    }

    const filteredTasks = column.tasks.filter(task => {
        const matchesSearch = !searchQuery ||
            task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (task.description?.toLowerCase().includes(searchQuery.toLowerCase()))

        const matchesPriority = !priorityFilter || task.priority === priorityFilter

        const matchesLabels = !selectedLabels || selectedLabels.length === 0 ||
            (task as any).labelIds?.some((id: string) => selectedLabels.includes(id)) ||
            (task as any).labels?.some((l: any) => selectedLabels.includes(l.id))

        return matchesSearch && matchesPriority && matchesLabels
    })

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`flex flex-col w-80 shrink-0 bg-muted/30 rounded-xl border p-3 min-h-[500px] transition-colors ${isDragging ? "opacity-30 border-primary/50" : "opacity-100"
                }`}
        >
            <div
                className="flex items-center justify-between mb-4 px-1 cursor-grab active:cursor-grabbing group"
                {...attributes}
                {...listeners}
            >
                <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm">{column.title}</h3>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                        {filteredTasks.length}
                    </span>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <EditColumnModal column={column} onColumnUpdated={onRefresh} />
                        <DropdownMenuItem className="text-destructive" onClick={handleDeleteColumn}>
                            <Trash className="mr-2 h-4 w-4" />
                            Delete Column
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <CreateTaskModal columnId={column.id} onTaskCreated={onRefresh} />

            <div className="flex-1 space-y-3 overflow-y-auto pr-1 custom-scrollbar min-h-[50px]">
                <SortableContext items={filteredTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                    <AnimatePresence mode="popLayout" initial={false}>
                        {filteredTasks.map((task) => (
                            <KanbanTask
                                key={task.id}
                                task={task}
                                onRefresh={onRefresh}
                                allColumns={allColumns}
                                currentColumnId={column.id}
                                members={members}
                                projectId={projectId}
                            />
                        ))}
                    </AnimatePresence>
                </SortableContext>
            </div>

        </div>
    )
}
