"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import axios from "axios"
import { Plus } from "lucide-react"
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
import { Input } from "@/components/ui/input"

const formSchema = z.object({
    title: z.string().min(2, {
        message: "Title must be at least 2 characters.",
    }),
})

export function CreateColumnModal({ projectId, currentOrder, onColumnCreated }: { projectId: string, currentOrder: number, onColumnCreated: () => void }) {
    const [open, setOpen] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
        },
    })

    const { data: session } = useSession()

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3200'}/columns`, {
                ...values,
                projectId,
                order: currentOrder,
            }, {
                headers: { 'x-user-id': (session?.user as any)?.id }
            })
            setOpen(false)
            form.reset()
            onColumnCreated()
        } catch (error) {
            console.error("Failed to create column:", error)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    className="w-80 shrink-0 h-12 bg-muted/20 border-2 border-dashed hover:bg-muted/40 gap-2 font-medium"
                >
                    <Plus className="h-4 w-4" />
                    Add Another Column
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add New Column</DialogTitle>
                    <DialogDescription>
                        Give your new column a name.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Column Title</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. In Review" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="submit">Create Column</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
