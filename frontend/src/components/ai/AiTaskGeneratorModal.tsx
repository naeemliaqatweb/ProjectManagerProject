import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"
import { Loader2, Sparkles, AlertCircle, CheckCircle2 } from "lucide-react"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { cn } from "@/lib/utils"

interface Project {
    id: string
    name: string
    columns: { id: string; title: string }[]
}

interface GeneratedTask {
    title: string
    description: string
    suggestedLabel: string
}

export function AiTaskGeneratorModal({
    open,
    onOpenChange
}: {
    open: boolean
    onOpenChange: (open: boolean) => void
}) {
    const router = useRouter()
    const { data: session } = useSession()
    const [step, setStep] = useState<"INPUT" | "PREVIEW">("INPUT")
    const [loading, setLoading] = useState(false)
    const [projects, setProjects] = useState<Project[]>([])

    // Input State
    const [prompt, setPrompt] = useState("")
    const [selectedProject, setSelectedProject] = useState<string>("")
    const [selectedColumn, setSelectedColumn] = useState<string>("")

    // Generated State
    const [generatedTask, setGeneratedTask] = useState<GeneratedTask | null>(null)
    const [error, setError] = useState<string | null>(null)

    // Fetch projects on open
    useEffect(() => {
        if (open && session?.user && (session.user as any).id) {
            const fetchProjects = async () => {
                try {
                    const userId = (session.user as any).id
                    const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3200'}/projects/user/${userId}`)
                    console.log("AI Modal: Fetched projects:", res.data)
                    setProjects(res.data)
                } catch (e) {
                    console.error("Failed to fetch projects", e)
                }
            }
            fetchProjects()
        }
    }, [open, session])

    // Reset state on close
    useEffect(() => {
        if (!open) {
            setStep("INPUT")
            setPrompt("")
            setGeneratedTask(null)
            setLoading(false)
        }
    }, [open])

    const handleGenerate = async () => {
        if (!prompt.trim() || !selectedProject) return;

        setError(null)
        setLoading(true)
        try {
            const res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3200'}/ai/generate-task`, {
                text: prompt,
                projectId: selectedProject
            })
            setGeneratedTask(res.data)
            setStep("PREVIEW")
            setStep("PREVIEW")
        } catch (error: any) {
            console.error("Failed to generate task", error)
            setError(error.response?.data?.message || "Failed to generate task. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    const handleCreateTask = async () => {
        if (!generatedTask || !selectedProject || !selectedColumn) return;

        setLoading(true)
        try {
            // 1. Check if label exists, if not create it (simplified: just use existing logic or create if backend supports)
            // For now, we'll assuming the backend handles label creation or we just pass the label name if the API supported it.
            // But our Create Task API expects labelIds.
            // Let's first try to find the label ID from the project labels.

            let labelId: string | undefined;
            try {
                const labelsRes = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3200'}/labels/project/${selectedProject}`);
                const existingLabel = labelsRes.data.find((l: any) => l.name.toLowerCase() === generatedTask.suggestedLabel.toLowerCase());

                if (existingLabel) {
                    labelId = existingLabel.id;
                } else {
                    // Create new label
                    const newLabelRes = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3200'}/labels`, {
                        name: generatedTask.suggestedLabel,
                        color: "#6366f1", // Default color
                        projectId: selectedProject
                    });
                    labelId = newLabelRes.data.id;
                }
            } catch (e) {
                console.error("Label processing failed", e);
            }

            const newTaskId = (await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3200'}/tasks`, {
                title: generatedTask.title,
                description: generatedTask.description,
                columnId: selectedColumn,
                priority: "MEDIUM",
                order: 0,
                labelIds: labelId ? [labelId] : []
            })).data.id

            onOpenChange(false)
            router.push(`/dashboard/projects/${selectedProject}?highlight=${newTaskId}`)
            router.refresh()

        } catch (error) {
            console.error("Failed to create task", error)
        } finally {
            setLoading(false)
        }
    }

    const activeProject = projects.find(p => p.id === selectedProject)
    console.log("AI Modal: Active Project:", activeProject)
    console.log("AI Modal: Project Columns:", activeProject?.columns)

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <Sparkles className="h-5 w-5 text-indigo-500" />
                        AI Task Architect
                    </DialogTitle>
                    <DialogDescription>
                        {step === "INPUT"
                            ? "Describe your task in plain English, and I'll structure it for you."
                            : "Review the generated task details before creating."}
                    </DialogDescription>
                </DialogHeader>

                {step === "INPUT" && (
                    <div className="space-y-6 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Project</Label>
                                <Select value={selectedProject} onValueChange={setSelectedProject}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Project" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {projects.map(p => (
                                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Column</Label>
                                <Select value={selectedColumn} onValueChange={setSelectedColumn} disabled={!selectedProject || !activeProject?.columns?.length}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={!activeProject?.columns?.length && selectedProject ? "No columns found" : "Select Column"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {activeProject?.columns?.map(c => (
                                            <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {selectedProject && activeProject?.columns?.length === 0 && (
                                    <p className="text-xs text-amber-600 flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" />
                                        Project has no columns. Create them in Board view.
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Task Description</Label>
                            <Textarea
                                placeholder="e.g. We need to fix the login bug on the staging environment where users get a 500 error when clicking 'Submit'. It seems related to the new auth middleware..."
                                className="h-32 resize-none"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                            />
                        </div>

                        <Alert className="bg-indigo-50 border-indigo-100 text-indigo-800">
                            <Sparkles className="h-4 w-4 stroke-indigo-500" />
                            <AlertTitle>Smart Analysis</AlertTitle>
                            <AlertDescription className="text-xs">
                                I will automatically suggest a title, refine the description, and pick the best label from your project.
                            </AlertDescription>
                        </Alert>
                        {error && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>
                                    {error}
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>
                )}

                {step === "PREVIEW" && generatedTask && (
                    <div className="space-y-4 py-4 animate-in fade-in zoom-in-95 duration-300">
                        <div className="space-y-2">
                            <Label>Title</Label>
                            <Input
                                value={generatedTask.title}
                                onChange={(e) => setGeneratedTask({ ...generatedTask, title: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea
                                className="h-32"
                                value={generatedTask.description}
                                onChange={(e) => setGeneratedTask({ ...generatedTask, description: e.target.value })}
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <Label>Suggested Label:</Label>
                            <div className="px-2 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold border border-indigo-200">
                                {generatedTask.suggestedLabel}
                            </div>
                        </div>
                    </div>
                )}

                <DialogFooter>
                    {step === "INPUT" ? (
                        <Button
                            onClick={handleGenerate}
                            disabled={!prompt || !selectedProject || loading}
                            className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="mr-2 h-4 w-4" /> Generate Task
                                </>
                            )}
                        </Button>
                    ) : (
                        <div className="flex gap-2 w-full sm:w-auto">
                            <Button variant="outline" onClick={() => setStep("INPUT")}>Back</Button>
                            <Button
                                onClick={handleCreateTask}
                                disabled={loading}
                                className="flex-1 bg-green-600 hover:bg-green-700"
                            >
                                {loading ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                )}
                                Create Task
                            </Button>
                        </div>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog >
    )
}
