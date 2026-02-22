"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    FolderKanban,
    Users,
    Settings,
    ChevronLeft,
    ChevronRight,
    Menu,
    History,
    Sparkles
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { CreateProjectModal } from "./CreateProjectModal"
import { AiTaskGeneratorModal } from "./ai/AiTaskGeneratorModal"
import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from "@/components/ui/sheet"

const sidebarItems = [
    { name: "My Projects", href: "/dashboard", icon: FolderKanban },
    { name: "Shared with me", href: "/dashboard/shared", icon: Users },
    { name: "Activity", href: "/dashboard/activity", icon: History },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
]

export function Sidebar({ className }: { className?: string }) {
    const [isCollapsed, setIsCollapsed] = useState(false)
    const [isAiModalOpen, setIsAiModalOpen] = useState(false)
    const pathname = usePathname()

    const NavContent = () => (
        <div className="flex flex-col h-full py-4 px-3">
            <div className="flex items-center gap-2 px-2 mb-8">
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                    <FolderKanban className="h-5 w-5 text-primary-foreground" />
                </div>
                {!isCollapsed && <span className="font-bold text-xl tracking-tight">ProManage</span>}
            </div>

            <div className="space-y-1">
                {sidebarItems.map((item) => (
                    <Link key={item.name} href={item.href}>
                        <Button
                            variant={pathname === item.href ? "secondary" : "ghost"}
                            className={cn(
                                "w-full justify-start gap-3 px-2 h-10",
                                isCollapsed && "justify-center px-0"
                            )}
                        >
                            <item.icon className="h-5 w-5 shrink-0" />
                            {!isCollapsed && <span>{item.name}</span>}
                        </Button>
                    </Link>
                ))}
            </div>

            <div className="mt-8 space-y-4">
                <Separator className="mx-2" />
                <CreateProjectModal />
                <Button
                    onClick={() => setIsAiModalOpen(true)}
                    className={cn(
                        "w-full justify-start gap-2 px-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-md transition-all hover:shadow-lg hover:scale-[1.02]",
                        isCollapsed && "justify-center px-0"
                    )}
                >
                    <Sparkles className="h-4 w-4 shrink-0" />
                    {!isCollapsed && <span>Generate with AI</span>}
                </Button>
            </div>

            <div className="mt-auto">
                <Button
                    variant="ghost"
                    className={cn(
                        "w-full justify-start gap-3 px-2 h-10 mt-4",
                        isCollapsed && "justify-center px-0"
                    )}
                    onClick={() => setIsCollapsed(!isCollapsed)}
                >
                    {isCollapsed ? (
                        <ChevronRight className="h-5 w-5" />
                    ) : (
                        <>
                            <ChevronLeft className="h-5 w-5" />
                            <span>Collapse Sidebar</span>
                        </>
                    )}
                </Button>
            </div>
        </div>
    )

    return (
        <>
            {/* Desktop Sidebar */}
            <aside
                className={cn(
                    "hidden md:flex flex-col border-r bg-card transition-all duration-300 ease-in-out",
                    isCollapsed ? "w-16" : "w-64",
                    className
                )}
            >
                <NavContent />
                <AiTaskGeneratorModal open={isAiModalOpen} onOpenChange={setIsAiModalOpen} />
            </aside>

            {/* Mobile Sidebar (Hamburger Triggered Sheet) */}
            <div className="md:hidden fixed top-4 left-4 z-50">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="outline" size="icon">
                            <Menu className="h-5 w-5" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 w-72">
                        <SidebarContent onOpenAiModal={() => setIsAiModalOpen(true)} />
                    </SheetContent>
                </Sheet>
            </div>
        </>
    )
}

function SidebarContent({ onOpenAiModal }: { onOpenAiModal?: () => void }) {
    const pathname = usePathname()
    return (
        <div className="flex flex-col h-full py-4 px-3">
            <div className="flex items-center gap-2 px-2 mb-8">
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                    <FolderKanban className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="font-bold text-xl tracking-tight">ProManage</span>
            </div>

            <div className="space-y-1">
                {sidebarItems.map((item) => (
                    <Link key={item.name} href={item.href}>
                        <Button
                            variant={pathname === item.href ? "secondary" : "ghost"}
                            className="w-full justify-start gap-3 px-2 h-10"
                        >
                            <item.icon className="h-5 w-5 shrink-0" />
                            <span>{item.name}</span>
                        </Button>
                    </Link>
                ))}
            </div>

            <div className="mt-8 space-y-4">
                <Separator className="mx-2" />
                <CreateProjectModal />
                <Button
                    onClick={onOpenAiModal}
                    className="w-full justify-start gap-2 px-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-md"
                >
                    <Sparkles className="h-4 w-4 shrink-0" />
                    <span>Generate with AI</span>
                </Button>
            </div>
        </div>
    )
}
