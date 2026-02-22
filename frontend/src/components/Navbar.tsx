"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import {
    Plus,
    LogOut,
    User as UserIcon,
    Settings,
    Clock,
    Square
} from "lucide-react"
import { useTimer } from "./kanban/TimerProvider"
import { NotificationBell } from "./notifications/NotificationBell"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { PresenceBar } from "@/components/PresenceBar"
import { useRealTime } from "@/components/RealTimeProvider"

export default function Navbar() {
    const { data: session } = useSession()
    const { onlineUsers } = useRealTime()
    const { activeTask, stopTimer, elapsedSeconds } = useTimer()
    const router = useRouter()

    const getImageUrl = (imagePath: string | null | undefined) => {
        if (!imagePath) return ""
        if (imagePath.startsWith("http")) return imagePath
        return `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3200'}${imagePath}`
    }

    return (
        <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
            <div className="flex flex-1 items-center gap-4">
                <h1 className="text-lg font-semibold md:text-xl shrink-0">
                    All Projects
                </h1>

                {activeTask && (
                    <div className="hidden md:flex items-center gap-3 px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full animate-in fade-in slide-in-from-left-4 duration-500">
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Clock className="h-4 w-4 text-primary animate-pulse" />
                                <div className="absolute -top-1 -right-1 h-2 w-2 bg-rose-500 rounded-full animate-ping" />
                            </div>
                            <span className="text-sm font-medium text-primary/80 truncate max-w-[200px]">
                                {activeTask.title}
                            </span>
                        </div>
                        <div className="h-4 w-[1px] bg-primary/20" />
                        <span className="text-xs font-mono font-bold text-primary tabular-nums">
                            {activeTask ? (
                                `${Math.floor((Date.now() - activeTask.startTime) / 60000)}m ${elapsedSeconds}s`
                            ) : ""}
                        </span>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 rounded-full hover:bg-rose-500/20 hover:text-rose-500 transition-colors"
                            onClick={() => stopTimer()}
                        >
                            <Square className="h-3 w-3 fill-current" />
                        </Button>
                    </div>
                )}
            </div>

            <div className="flex items-center gap-4">
                <PresenceBar users={onlineUsers} />
                <NotificationBell />

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                            <Avatar key={session?.user?.image || 'default'} className="h-10 w-10 border shadow-sm">
                                <AvatarImage src={getImageUrl(session?.user?.image)} alt={session?.user?.name || "User"} />
                                <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                                    {session?.user?.name?.[0]?.toUpperCase() || "U"}
                                </AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">{session?.user?.name}</p>
                                <p className="text-xs leading-none text-muted-foreground">
                                    {session?.user?.email}
                                </p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => router.push('/dashboard/settings')}>
                            <UserIcon className="mr-2 h-4 w-4" />
                            <span>Profile</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push('/dashboard/settings')}>
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Settings</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                            onClick={() => signOut({ callbackUrl: '/' })}
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Log out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    )
}
