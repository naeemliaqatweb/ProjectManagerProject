"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import axios from "axios"
import { Edit2 } from "lucide-react"
import { useSession } from "next-auth/react"
import { CommentsSection } from "../Comments/CommentsSection"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
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
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"

const formSchema = z.object({
    title: z.string().min(2, {
        message: "Title must be at least 2 characters.",
    }),
    description: z.string().optional(),
})

interface Task {
    id: string
    title: string
    description?: string
}

export function EditTaskModal({ task, onTaskUpdated }: { task: Task, onTaskUpdated: () => void }) {
    const [open, setOpen] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: task.title,
            description: task.description || "",
        },
    })

    const { data: session } = useSession()

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            await axios.patch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3200'}/tasks/${task.id}`, values, {
                headers: { 'x-user-id': (session?.user as any)?.id }
            })
            setOpen(false)
            onTaskUpdated()
        } catch (error) {
            console.error("Failed to update task:", error)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Edit2 className="mr-2 h-4 w-4" />
                    Edit
                </DropdownMenuItem>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Task</DialogTitle>
                    <DialogDescription>
                        Update the task details below.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Task Title</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. Design Landing Page" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Add some details..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="submit">Save Changes</Button>
                        </DialogFooter>
                    </form>
                </Form>

                <div className="mt-6 pt-6 border-t border-slate-800">
                    <CommentsSection taskId={task.id} />
                </div>
            </DialogContent>
        </Dialog >
    )
}
