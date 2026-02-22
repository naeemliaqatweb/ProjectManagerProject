"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { io, Socket } from "socket.io-client"
import { Comment, CommentItem } from "./CommentItem"
import { CommentInput } from "./CommentInput"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

// Augment the Session type locally to avoid lint errors
declare module "next-auth" {
    interface Session {
        accessToken?: string;
    }
}

interface CommentsSectionProps {
    taskId: string
}

export function CommentsSection({ taskId }: CommentsSectionProps) {
    const { data: session } = useSession()
    const [comments, setComments] = useState<Comment[]>([])
    const [loading, setLoading] = useState(true)
    const [socket, setSocket] = useState<Socket | null>(null)

    // Fetch initial comments
    useEffect(() => {
        const fetchComments = async () => {
            console.log("CommentsSection Session Debug:", {
                sessionStatus: session ? 'present' : 'missing',
                accessToken: session?.accessToken,
                user: session?.user,
                fullSession: session
            });
            console.log("Fetching comments. TaskId:", taskId);
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3200'}/comments/${taskId}`, {
                    headers: {
                        "Authorization": `Bearer ${session?.accessToken || (session as any)?.accessToken}`
                    }
                })
                if (!res.ok) {
                    const errorText = await res.text()
                    console.error("Failed to fetch comments. Status:", res.status, "Body:", errorText)
                    throw new Error(`Failed to fetch comments: ${res.status}`)
                }
                const data = await res.json()
                setComments(data)
            } catch (error) {
                console.error("Error loading comments:", error)
                toast.error("Could not load comments")
            } finally {
                setLoading(false)
            }
        }

        if (taskId && session) {
            fetchComments()
        }
    }, [taskId, session])

    // Setup WebSocket
    useEffect(() => {
        // Determine WS URL
        const newSocket = io(process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3200", {
            path: '/socket.io', // Default NestJS gateway path
        })

        newSocket.emit('joinTask', taskId)

        newSocket.on('commentCreated', (newComment: Comment) => {
            // If it's a root comment, append. If reply, find parent and append.
            // Or simpler: just re-fetch or robust state update.
            // For optimisitic UI we might have already added it, so check ID.

            setComments(prev => {
                if (prev.find(c => c.id === newComment.id)) return prev; // Already exists (optimistic)

                // If root comment
                if (!newComment.parentId) {
                    return [...prev, newComment]
                }

                // If reply, we need to find parent. 
                // NOTE: This simple state update assumes 1-level depth for simplicity in this snippet.
                // For recursive deep updates, we need a recursive function.

                const addReply = (comments: Comment[]): Comment[] => {
                    return comments.map(c => {
                        if (c.id === newComment.parentId) {
                            return { ...c, replies: [...(c.replies || []), newComment] }
                        }
                        if (c.replies) {
                            return { ...c, replies: addReply(c.replies) }
                        }
                        return c
                    })
                }
                return addReply(prev)
            })
        })

        setSocket(newSocket)

        return () => {
            newSocket.emit('leaveTask', taskId)
            newSocket.disconnect()
        }
    }, [taskId])


    const handleCreateComment = async (text: string, parentId?: string) => {
        if (!session) return;

        // Optimistic Update (Optional, skipping for simplicity/robustness first)
        // To do optimistic, we need a fake ID and user object.

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3200'}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    "Authorization": `Bearer ${session?.accessToken || (session as any)?.accessToken}`
                },
                body: JSON.stringify({ taskId, text, parentId })
            })

            if (!res.ok) {
                const errorText = await res.text()
                console.error("Failed to post comment. Status:", res.status, "Body:", errorText)
                throw new Error("Failed to post comment")
            }

            // The socket event will handle the UI update for everyone including sender
            // But to be snappy, we can await response and update if socket hasn't yet.
            const savedComment = await res.json()

            // Manually update state if socket laggy? 
            // Socket is usually fast enough. Let's rely on socket for consistency.

        } catch (error) {
            toast.error("Failed to post comment")
        }
    }

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-slate-500" /></div>

    return (
        <div className="flex flex-col h-full bg-slate-950/30 rounded-xl border border-slate-800/50 overflow-hidden">
            <div className="p-4 border-b border-slate-800/50 bg-slate-900/20">
                <h3 className="font-semibold text-slate-200 flex items-center gap-2">
                    Discussion
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 text-xs text-slate-400">{comments.length}</span>
                </h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6 min-h-[300px] max-h-[500px]">
                {comments.length === 0 ? (
                    <div className="text-center py-10 text-slate-500 text-sm">
                        No comments yet. Start the conversation!
                    </div>
                ) : (
                    comments.filter(c => !c.parentId).map(comment => (
                        <CommentItem
                            key={comment.id}
                            comment={comment}
                            taskId={taskId}
                            onReply={(text, parentId) => handleCreateComment(text, parentId)}
                        />
                    ))
                )}
            </div>

            <div className="p-4 border-t border-slate-800/50 bg-slate-900/40">
                <CommentInput
                    taskId={taskId}
                    onSubmit={(text) => handleCreateComment(text)}
                />
            </div>
        </div>
    )
}
