"use client"

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

interface User {
    id: string
    name: string
    email: string
    image?: string
}

interface PresenceBarProps {
    users: User[]
}

export function PresenceBar({ users }: PresenceBarProps) {
    if (users.length === 0) return null

    const getImageUrl = (imagePath: string | null | undefined) => {
        if (!imagePath) return ""
        if (imagePath.startsWith("http")) return imagePath
        return `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3200'}${imagePath}`
    }

    return (
        <TooltipProvider>
            <div className="flex -space-x-2 overflow-hidden items-center">
                {users.map((user) => (
                    <Tooltip key={user.id}>
                        <TooltipTrigger asChild>
                            <Avatar className="inline-block h-8 w-8 rounded-full ring-2 ring-background hover:z-10 transition-all cursor-pointer">
                                <AvatarImage src={getImageUrl(user.image)} alt={user.name} />
                                <AvatarFallback className="bg-primary text-primary-foreground text-[10px]">
                                    {user.name?.[0]?.toUpperCase() || "U"}
                                </AvatarFallback>
                            </Avatar>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p className="text-xs">{user.name}</p>
                        </TooltipContent>
                    </Tooltip>
                ))}
                {users.length > 5 && (
                    <span className="flex items-center justify-center h-8 w-8 rounded-full ring-2 ring-background bg-muted text-[10px] font-medium text-muted-foreground ml-1">
                        +{users.length - 5}
                    </span>
                )}
            </div>
        </TooltipProvider>
    )
}
