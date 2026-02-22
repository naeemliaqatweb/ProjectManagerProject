"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Send, X, CornerDownLeft } from "lucide-react"
import TextareaAutosize from "react-textarea-autosize"
import { cn } from "@/lib/utils"

interface CommentInputProps {
    taskId: string
    onSubmit: (text: string) => void
    onCancel?: () => void
    placeholder?: string
    autoFocus?: boolean
}

export function CommentInput({
    taskId,
    onSubmit,
    onCancel,
    placeholder = "Write a comment...",
    autoFocus = false
}: CommentInputProps) {
    const [text, setText] = useState("")
    const [isExpanded, setIsExpanded] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    useEffect(() => {
        if (autoFocus) {
            setIsExpanded(true)
            // small delay to allow render
            setTimeout(() => textareaRef.current?.focus(), 50)
        }
    }, [autoFocus])

    // Click outside to collapse if empty
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                if (!text.trim()) {
                    setIsExpanded(false)
                    onCancel?.()
                }
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [text, onCancel])

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault()
        if (!text.trim()) return

        onSubmit(text)
        setText("")
        setIsExpanded(false)
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSubmit()
        }
        if (e.key === 'Escape') {
            setIsExpanded(false)
            onCancel?.()
        }
    }

    return (
        <div
            ref={containerRef}
            className={cn(
                "relative transition-all duration-200 rounded-xl border",
                isExpanded
                    ? "bg-slate-900 border-indigo-500/50 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500/50 p-4"
                    : "bg-slate-900/50 border-slate-800 hover:border-slate-700 p-0"
            )}
        >
            <div className={cn("relative", !isExpanded && "cursor-text")} onClick={() => setIsExpanded(true)}>
                <TextareaAutosize
                    ref={textareaRef}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    minRows={isExpanded ? 3 : 1}
                    className={cn(
                        "w-full bg-transparent resize-none text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none transition-all",
                        !isExpanded && "h-10 py-2.5 px-4 truncate"
                    )}
                />
            </div>

            {isExpanded && (
                <div className="flex items-center justify-between mt-3 animate-in fade-in slide-in-from-top-1">
                    <div className="text-xs text-slate-500 flex items-center gap-2">
                        <span className="hidden sm:inline"><b>Enter</b> to save</span>
                        <span className="hidden sm:inline"><b>Esc</b> to cancel</span>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            variant="ghost"
                            className="text-slate-400 hover:text-slate-200"
                            onClick={() => {
                                setText("")
                                setIsExpanded(false)
                                onCancel?.()
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            size="sm"
                            className="bg-indigo-600 hover:bg-indigo-500 text-white"
                            onClick={() => handleSubmit()}
                            disabled={!text.trim()}
                        >
                            Save
                        </Button>
                    </div>
                </div>
            )}

            {!isExpanded && (
                <div
                    className="absolute inset-0 cursor-text"
                    onClick={() => {
                        setIsExpanded(true)
                        setTimeout(() => textareaRef.current?.focus(), 50)
                    }}
                />
            )}
        </div>
    )
}
