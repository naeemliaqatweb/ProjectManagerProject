"use client"

import { useState } from "react"
import { Users, UserPlus, Share2, Mail, Check, Copy } from "lucide-react"
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
import axios from "axios"
import { useSession } from "next-auth/react"

export function ShareProjectModal({ projectId, projectName }: { projectId: string, projectName: string }) {
    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)

    const { data: session } = useSession()

    const handleShare = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3200'}/projects/${projectId}/share`, {
                email
            }, {
                headers: { 'x-user-id': (session?.user as any)?.id }
            })
            alert(`Successfully shared "${projectName}" with ${email}`)
            setEmail("")
            setOpen(false)
        } catch (error: any) {
            console.error("Failed to share project:", error)
            alert(error.response?.data?.message || "Could not share project. Please check the email.")
        } finally {
            setLoading(false)
        }
    }

    const copyProjectLink = () => {
        const url = `${window.location.origin}/dashboard/projects/${projectId}`
        navigator.clipboard.writeText(url)
        alert("Project link has been copied to clipboard.")
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 h-9">
                    <UserPlus className="h-4 w-4" />
                    Share
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Share2 className="h-5 w-5 text-primary" />
                        Share Project
                    </DialogTitle>
                    <DialogDescription>
                        Invite collaborators to work on <strong>{projectName}</strong> with you.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleShare} className="space-y-6 pt-4">
                    <div className="space-y-4">
                        <div className="grid w-full items-center gap-1.5">
                            <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Collaborator Email</Label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        placeholder="colleague@example.com"
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="pl-9 h-11"
                                    />
                                </div>
                                <Button type="submit" disabled={loading} className="h-11 px-6">
                                    {loading ? "Sharing..." : "Invite"}
                                </Button>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground font-medium">Or copy link</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Input
                                readOnly
                                value={`${typeof window !== 'undefined' ? window.location.origin : ''}/dashboard/projects/${projectId}`}
                                className="h-9 text-xs bg-muted/50"
                            />
                            <Button type="button" variant="secondary" size="icon" onClick={copyProjectLink} className="shrink-0 h-9 w-9">
                                <Copy className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
