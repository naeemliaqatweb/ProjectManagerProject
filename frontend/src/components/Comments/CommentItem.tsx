"use client"

import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { MessageSquare, CornerDownRight, Edit2, Trash2 } from "lucide-react"
import { CommentInput } from "./CommentInput"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

interface CommentUser {
    id: string
    name: string | null
    image: string | null
}

export interface Comment {
    id: string
    text: string
    createdAt: string
    updatedAt: string
    userId: string
    user: CommentUser
    parentId: string | null
    replies?: Comment[]
}

interface CommentItemProps {
    comment: Comment
    taskId: string
    onReply: (text: string, parentId: string) => void
}

export function CommentItem({ comment, taskId, onReply }: CommentItemProps) {
    const [isReplying, setIsReplying] = useState(false)

    const handleReplySubmit = (text: string) => {
        onReply(text, comment.id)
        setIsReplying(false)
    }

    // Tree styling: if parentId exists, apply specific indentation and border
    const treeClasses = comment.parentId
        ? "border-l-2 border-slate-700 ml-6 pl-4"
        : ""

    return (
        <div className={`group animate-in fade-in slide-in-from-top-1 duration-300 ${treeClasses}`}>
            <div className="flex gap-3">
                <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.user.image || ""} />
                    <AvatarFallback>{comment.user.name?.[0] || "?"}</AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-200">
                            {comment.user.name || "Unknown User"}
                        </span>
                        <span className="text-xs text-slate-500">
                            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                        </span>
                    </div>

                    <div className="text-sm text-slate-300 leading-relaxed">
                        {comment.text}
                    </div>

                    <div className="flex items-center gap-2 pt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10"
                            onClick={() => setIsReplying(!isReplying)}
                        >
                            <MessageSquare className="w-3 h-3 mr-1.5" />
                            Reply
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10"
                        >
                            <Edit2 className="w-3 h-3 mr-1.5" />
                            Edit
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs text-slate-500 hover:text-red-400 hover:bg-red-500/10"
                        >
                            <Trash2 className="w-3 h-3 mr-1.5" />
                            Delete
                        </Button>
                    </div>

                    {isReplying && (
                        <div className="mt-3 pl-4 border-l-2 border-indigo-500/20">
                            <CommentInput
                                taskId={taskId}
                                onSubmit={handleReplySubmit}
                                placeholder={`Reply to ${comment.user.name}...`}
                                autoFocus
                                onCancel={() => setIsReplying(false)}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Nested Replies */}
            {comment.replies && comment.replies.length > 0 && (
                <div className="mt-4 space-y-4">
                    {comment.replies.map((reply) => (
                        <CommentItem
                            key={reply.id}
                            comment={reply}
                            taskId={taskId}
                            onReply={onReply}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
