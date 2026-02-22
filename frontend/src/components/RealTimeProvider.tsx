"use client"

import React, { createContext, useContext, ReactNode } from "react"
import { useSocket } from "@/hooks/useSocket"
import { useParams } from "next/navigation"

interface User {
    id: string
    name: string
    email: string
    image?: string
}

interface RealTimeContextType {
    onlineUsers: User[]
    editingTasks: Record<string, { user: User, isEditing: boolean }>
    lastMovedTask: { taskId: string, toColumnId: string } | null
    startEditing: (taskId: string) => void
    stopEditing: (taskId: string) => void
    emitTaskMoved: (taskId: string, fromColumnId: string | undefined, toColumnId: string) => void
    emitColumnMoved: (columnId: string, fromOrder: number, toOrder: number) => void
    emitTaskTimeUpdate: (taskId: string, incrementMinutes: number) => void
    notifications: any[]
    unreadCount: number
    setNotifications: React.Dispatch<React.SetStateAction<any[]>>
    setUnreadCount: React.Dispatch<React.SetStateAction<number>>
}

const RealTimeContext = createContext<RealTimeContextType | undefined>(undefined)

export function RealTimeProvider({ children }: { children: ReactNode }) {
    const params = useParams()
    const projectId = params?.id as string

    const socketData = useSocket(projectId)

    return (
        <RealTimeContext.Provider value={socketData}>
            {children}
        </RealTimeContext.Provider>
    )
}

export function useRealTime() {
    const context = useContext(RealTimeContext)
    if (context === undefined) {
        throw new Error("useRealTime must be used within a RealTimeProvider")
    }
    return context
}
