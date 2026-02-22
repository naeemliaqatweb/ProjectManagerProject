"use client"

import { useEffect, useState } from "react"
import { Bell, Check, Loader2 } from "lucide-react"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { useRealTime } from "@/components/RealTimeProvider"
import { useSession } from "next-auth/react"
import axios from "axios"
import { formatDistanceToNow } from "date-fns"
import { Separator } from "@/components/ui/separator"

export function NotificationBell() {
    const { data: session } = useSession()
    const { notifications, unreadCount, setNotifications, setUnreadCount } = useRealTime()
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const userId = (session?.user as any)?.id
        if (userId) {
            fetchNotifications(userId)
        }
    }, [session?.user])

    const fetchNotifications = async (userId: string) => {
        try {
            setLoading(true)
            const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3200'}/notifications/user/${userId}`)
            setNotifications(res.data)

            const unreadRes = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3200'}/notifications/unread/count/${userId}`)
            setUnreadCount(unreadRes.data)
        } catch (error) {
            console.error("Failed to fetch notifications:", error)
        } finally {
            setLoading(false)
        }
    }

    const markAllAsRead = async () => {
        const userId = (session?.user as any)?.id
        if (!userId) return

        try {
            await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3200'}/notifications/read-all/${userId}`)
            setNotifications(prev => prev.map(n => ({ ...n, readStatus: true })))
            setUnreadCount(0)
        } catch (error) {
            console.error("Failed to mark all as read:", error)
        }
    }

    const markAsRead = async (id: string) => {
        try {
            await axios.patch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3200'}/notifications/${id}/read`)
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, readStatus: true } : n))
            setUnreadCount(prev => Math.max(0, prev - 1))
        } catch (error) {
            console.error("Failed to mark as read:", error)
        }
    }

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative hover:bg-primary/5">
                    <Bell className="h-5 w-5 text-muted-foreground" />
                    {unreadCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 flex items-center justify-center p-0 text-[10px] font-bold border-2 border-background animate-in zoom-in"
                        >
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </Badge>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="font-semibold text-sm">Notifications</h3>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-[11px] font-medium text-primary hover:text-primary hover:bg-primary/5 px-2"
                            onClick={markAllAsRead}
                        >
                            <Check className="mr-1 h-3 w-3" />
                            Mark all read
                        </Button>
                    )}
                </div>
                <ScrollArea className="h-[350px]">
                    {loading ? (
                        <div className="flex h-full items-center justify-center p-8">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : notifications.length > 0 ? (
                        <div className="flex flex-col">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`flex flex-col gap-1 p-4 hover:bg-muted/30 transition-colors cursor-pointer border-b last:border-0 ${!notification.readStatus ? 'bg-primary/5 border-l-2 border-l-primary' : ''}`}
                                    onClick={() => !notification.readStatus && markAsRead(notification.id)}
                                >
                                    <p className="text-sm leading-tight font-medium text-foreground">
                                        {notification.message}
                                    </p>
                                    <span className="text-[10px] text-muted-foreground font-medium">
                                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex h-[300px] flex-col items-center justify-center text-center p-8">
                            <div className="bg-muted/50 rounded-full p-4 mb-4">
                                <Bell className="h-8 w-8 text-muted-foreground/50" />
                            </div>
                            <p className="text-sm font-medium text-muted-foreground">No notifications yet</p>
                            <p className="text-xs text-muted-foreground/60 mt-1">We'll alert you when tasks are assigned to you.</p>
                        </div>
                    )}
                </ScrollArea>
                <div className="p-2 border-t text-center">
                    <Button variant="ghost" className="w-full text-[11px] h-8 text-muted-foreground" size="sm">
                        View All Activity
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    )
}
