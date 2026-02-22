"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import axios from "axios"
import { Move } from "lucide-react"
import { useSession } from "next-auth/react"

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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"

const formSchema = z.object({
    columnId: z.string().min(1, {
        message: "Please select a column.",
    }),
})

interface Column {
    id: string
    title: string
}

export function MoveTaskModal({ taskId, columns, currentColumnId, onTaskMoved }: { taskId: string, columns: Column[], currentColumnId: string, onTaskMoved: () => void }) {
    const [open, setOpen] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            columnId: currentColumnId,
        },
    })

    const { data: session } = useSession()

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            await axios.patch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3200'}/tasks/${taskId}`, {
                columnId: values.columnId
            }, {
                headers: { 'x-user-id': (session?.user as any)?.id }
            })
            setOpen(false)
            onTaskMoved()
        } catch (error) {
            console.error("Failed to move task:", error)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Move className="mr-2 h-4 w-4" />
                    Move
                </DropdownMenuItem>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Move Task</DialogTitle>
                    <DialogDescription>
                        Select the destination column for this task.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="columnId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Target Column</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a column" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {columns.map((col) => (
                                                <SelectItem key={col.id} value={col.id}>
                                                    {col.title}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="submit">Move Task</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
