"use client"

import { useState, useEffect } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Settings, Plus, Trash2, Tag, Check } from "lucide-react"
import axios from "axios"
import { toast } from "sonner"
import { useSession } from "next-auth/react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

interface ProjectLabel {
    id: string
    name: string
    color: string
}

const PRESET_COLORS = [
    "#ef4444", // Rose
    "#f59e0b", // Amber
    "#10b981", // Emerald
    "#3b82f6", // Blue
    "#8b5cf6", // Violet
    "#ec4899", // Pink
    "#64748b", // Slate
    "#000000", // Black
]

export function ProjectSettingsModal({ project, onRefresh }: { project: any, onRefresh: () => void }) {
    const [open, setOpen] = useState(false)
    const [labels, setLabels] = useState<ProjectLabel[]>([])
    const [newLabelName, setNewLabelName] = useState("")
    const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0])
    const [loading, setLoading] = useState(false)
    const { data: session } = useSession()
    const router = useRouter()

    const fetchLabels = async () => {
        if (!project?.id || project.id === "undefined") return
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3200'}/labels/project/${project.id}`)
            setLabels(response.data)
        } catch (error) {
            console.error("Failed to fetch labels:", error)
        }
    }

    useEffect(() => {
        if (open) {
            fetchLabels()
        }
    }, [open, project.id])

    const handleCreateLabel = async () => {
        if (!newLabelName.trim()) return

        setLoading(true)
        try {
            await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3200'}/labels`, {
                name: newLabelName,
                color: selectedColor,
                projectId: project.id
            })
            setNewLabelName("")
            fetchLabels()
            onRefresh()
            toast.success("Label created")
        } catch (error) {
            toast.error("Failed to create label")
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteLabel = async (id: string) => {
        try {
            await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3200'}/labels/${id}`)
            fetchLabels()
            onRefresh()
            toast.success("Label deleted")
        } catch (error) {
            toast.error("Failed to delete label")
        }
    }

    const handleDeleteProject = async () => {
        if (!confirm("Are you sure? This will permanently delete the project and all its data.")) return

        setLoading(true)
        try {
            await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3200'}/projects/${project.id}`)
            toast.success("Project deleted successfully")
            setOpen(false)
            router.push("/dashboard")
            router.refresh()
        } catch (error) {
            console.error("Failed to delete project:", error)
            toast.error("Failed to delete project")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    className="gap-2 h-10 bg-background/50 border-muted hover:bg-muted/50 transition-all font-medium"
                >
                    <Settings className="h-4 w-4" />
                    <span>Project Settings</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] overflow-hidden">
                <DialogHeader>
                    <DialogTitle>Project Settings</DialogTitle>
                    <DialogDescription>
                        Manage your project labels and general settings.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Tag className="h-4 w-4 text-primary" />
                            <h3 className="text-sm font-semibold">Labels</h3>
                        </div>

                        <div className="flex gap-2">
                            <div className="flex-1 space-y-1.5 focus-within:z-10">
                                <Input
                                    placeholder="Label name..."
                                    value={newLabelName}
                                    onChange={(e) => setNewLabelName(e.target.value)}
                                    className="h-9"
                                    onKeyDown={(e) => e.key === 'Enter' && handleCreateLabel()}
                                />
                            </div>
                            <Button
                                size="sm"
                                className="h-9"
                                onClick={handleCreateLabel}
                                disabled={loading || !newLabelName.trim()}
                            >
                                <Plus className="h-4 w-4 mr-1" />
                                Add
                            </Button>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {PRESET_COLORS.map(color => (
                                <button
                                    key={color}
                                    onClick={() => setSelectedColor(color)}
                                    className={cn(
                                        "h-6 w-6 rounded-full border-2 transition-all hover:scale-110 flex items-center justify-center",
                                        selectedColor === color ? "border-primary scale-110" : "border-transparent"
                                    )}
                                    style={{ backgroundColor: color }}
                                >
                                    {selectedColor === color && <Check className="h-3 w-3 text-white" />}
                                </button>
                            ))}
                        </div>

                        <div className="max-h-[200px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                            {labels.map(label => (
                                <div
                                    key={label.id}
                                    className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-muted/50"
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="h-3 w-3 rounded-full"
                                            style={{ backgroundColor: label.color }}
                                        />
                                        <span className="text-sm font-medium">{label.name}</span>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10"
                                        onClick={() => handleDeleteLabel(label.id)}
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            ))}
                            {labels.length === 0 && (
                                <div className="text-center py-4 text-xs text-muted-foreground italic">
                                    No labels created yet.
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="pt-4 border-t">
                        <div className="flex items-center gap-2 mb-4">
                            <Settings className="h-4 w-4 text-rose-500" />
                            <h3 className="text-sm font-semibold text-rose-500">Danger Zone</h3>
                        </div>
                        <Button
                            variant="destructive"
                            className="w-full text-xs"
                            onClick={handleDeleteProject}
                            disabled={loading}
                        >
                            {loading ? "Deleting..." : "Delete Project"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
