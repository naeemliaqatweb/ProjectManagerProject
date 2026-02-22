"use client"

import { useEffect, useRef, useState } from "react"
import { io, Socket } from "socket.io-client"
import { useSession } from "next-auth/react"
import { toast } from "sonner"

interface User {
    id: string
    name: string
    email: string
    image?: string
}

export const useSocket = (projectId?: string) => {
    const { data: session } = useSession()
    const user = session?.user as User | undefined
    const socketRef = useRef<Socket | null>(null)
    const [onlineUsers, setOnlineUsers] = useState<User[]>([])
    const [editingTasks, setEditingTasks] = useState<Record<string, { user: User, isEditing: boolean }>>({})
    const [lastMovedTask, setLastMovedTask] = useState<{ taskId: string, toColumnId: string } | null>(null)
    const [notifications, setNotifications] = useState<any[]>([])
    const [unreadCount, setUnreadCount] = useState(0)

    useEffect(() => {
        if (!user) return

        // Initialize socket connection
        const socket = io(process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3200")
        socketRef.current = socket

        // Join user room for private notifications
        socket.emit("joinUserRoom", { userId: user.id })

        if (projectId) {
            // Join project room
            socket.emit("joinProject", {
                projectId,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    image: user.image,
                },
            })
        }

        // Listen for notifications
        socket.on("new_notification", (notification: any) => {
            setNotifications((prev) => {
                const isDuplicate = prev.some(n => n.id === notification.id);
                if (isDuplicate) return prev;

                setUnreadCount((count) => count + 1);
                toast.info("New Notification", {
                    description: notification.message,
                    duration: 5000,
                });
                return [notification, ...prev];
            });
        })

        // Listen for presence updates
        socket.on("presenceUpdate", (users: User[]) => {
            setOnlineUsers(users)
        })

        // Listen for task editing updates
        socket.on("userEditingTask", (data: { taskId: string; isEditing: boolean; user: User }) => {
            setEditingTasks((prev) => ({
                ...prev,
                [data.taskId]: { user: data.user, isEditing: data.isEditing },
            }))
        })

        // Listen for task movement updates
        socket.on("taskMovedUpdate", (data: { taskId: string; fromColumnId: string; toColumnId: string }) => {
            setLastMovedTask({ taskId: data.taskId, toColumnId: data.toColumnId })
        })

        // Listen for column movement updates
        socket.on("columnMovedUpdate", () => {
            setLastMovedTask({ taskId: "refresh", toColumnId: "refresh" })
        })

        // Listen for task time updates
        socket.on("taskTimeUpdated", (data: { taskId: string; incrementMinutes: number }) => {
            // This is primarily for other clients to know they should refresh the specific task data
            // Or we could have a global task refresh trigger
            setLastMovedTask({ taskId: data.taskId, toColumnId: "time_updated" })
        })

        return () => {
            if (socket) {
                socket.emit("leaveProject", { projectId })
                socket.disconnect()
            }
        }
    }, [projectId, user])

    const startEditing = (taskId: string) => {
        if (socketRef.current && projectId && user) {
            socketRef.current.emit("editingTask", {
                projectId,
                taskId,
                isEditing: true,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    image: user.image,
                },
            })
        }
    }

    const stopEditing = (taskId: string) => {
        if (socketRef.current && projectId && user) {
            socketRef.current.emit("editingTask", {
                projectId,
                taskId,
                isEditing: false,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    image: user.image,
                },
            })
        }
    }

    const emitTaskMoved = (taskId: string, fromColumnId: string | undefined, toColumnId: string) => {
        if (socketRef.current && projectId) {
            socketRef.current.emit("taskMoved", {
                projectId,
                taskId,
                fromColumnId,
                toColumnId,
            })
        }
    }

    const emitColumnMoved = (columnId: string, fromOrder: number, toOrder: number) => {
        if (socketRef.current && projectId) {
            socketRef.current.emit("columnMoved", {
                projectId,
                columnId,
                fromOrder,
                toOrder,
            })
        }
    }

    const emitTaskTimeUpdate = (taskId: string, incrementMinutes: number) => {
        if (socketRef.current && projectId) {
            socketRef.current.emit("updateTaskTime", {
                projectId,
                taskId,
                incrementMinutes,
            })
        }
    }

    return {
        onlineUsers,
        editingTasks,
        lastMovedTask,
        notifications,
        unreadCount,
        setNotifications,
        setUnreadCount,
        startEditing,
        stopEditing,
        emitTaskMoved,
        emitColumnMoved,
        emitTaskTimeUpdate,
    }
}
