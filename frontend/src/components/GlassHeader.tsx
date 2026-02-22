"use client"

import * as React from "react"
import Link from "next/link"
import { useSession, signIn, signOut } from "next-auth/react"
import { Menu, Package2, LayoutDashboard, LogOut } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from "@/components/ui/sheet"

export function GlassHeader() {
    const { data: session } = useSession()

    return (
        <div className="sticky top-4 z-50 container mx-auto px-4">
            <header className="w-full border border-slate-800 bg-slate-900/80 backdrop-blur-md supports-[backdrop-filter]:bg-slate-900/60 rounded-2xl shadow-lg shadow-black/20">
                <div className="flex h-16 items-center px-6">
                    <div className="mr-4 hidden md:flex">
                        <Link className="mr-6 flex items-center space-x-2" href="/">
                            <Package2 className="h-6 w-6 text-white" />
                            <span className="hidden font-bold sm:inline-block text-white">
                                Acme Inc
                            </span>
                        </Link>
                        <nav className="flex items-center gap-6 text-sm font-medium">
                            <Link
                                className="transition-colors hover:text-white/80 text-white/60"
                                href="/features"
                            >
                                Features
                            </Link>
                            <Link
                                className="transition-colors hover:text-white/80 text-white/60"
                                href="/pricing"
                            >
                                Pricing
                            </Link>
                            <Link
                                className="transition-colors hover:text-white/80 text-white/60"
                                href="/about"
                            >
                                About
                            </Link>
                        </nav>
                    </div>
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button
                                variant="ghost"
                                className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden text-white"
                            >
                                <Menu className="h-6 w-6" />
                                <span className="sr-only">Toggle Menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="pr-0 bg-slate-900 border-slate-800 text-white">
                            <div className="px-7">
                                <Link
                                    aria-label="Home"
                                    className="flex items-center"
                                    href="/"
                                >
                                    <Package2 className="h-6 w-6 mr-2" />
                                    <span className="font-bold">Acme Inc</span>
                                </Link>
                            </div>
                            <div className="flex flex-col gap-4 py-4 px-7 mt-4">
                                <Link href="/features" className="text-sm font-medium hover:text-indigo-400">
                                    Features
                                </Link>
                                <Link href="/pricing" className="text-sm font-medium hover:text-indigo-400">
                                    Pricing
                                </Link>
                                <Link href="/about" className="text-sm font-medium hover:text-indigo-400">
                                    About
                                </Link>
                                <div className="border-t border-slate-800 my-2 pt-4">
                                    {session ? (
                                        <>
                                            <Link href="/dashboard" className="flex items-center gap-2 text-sm font-medium hover:text-indigo-400 mb-4">
                                                <LayoutDashboard className="h-4 w-4" />
                                                Dashboard
                                            </Link>
                                            <button
                                                onClick={() => signOut()}
                                                className="flex items-center gap-2 text-sm font-medium text-red-400 hover:text-red-300"
                                            >
                                                <LogOut className="h-4 w-4" />
                                                Logout
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={() => signIn()}
                                            className="text-sm font-medium hover:text-indigo-400"
                                        >
                                            Login
                                        </button>
                                    )}
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                    <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
                        <div className="w-full flex-1 md:w-auto md:flex-none">
                            {/* Search placeholder */}
                        </div>
                        <nav className="flex items-center gap-2">
                            {session ? (
                                <>
                                    <Link href="/dashboard">
                                        <Button variant="ghost" className="text-sm font-medium text-white hover:text-white hover:bg-white/10">
                                            <LayoutDashboard className="mr-2 h-4 w-4" />
                                            Dashboard
                                        </Button>
                                    </Link>
                                    <Button
                                        onClick={() => signOut()}
                                        variant="ghost"
                                        className="text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                    >
                                        <LogOut className="mr-2 h-4 w-4" />
                                        Logout
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button
                                        onClick={() => signIn()}
                                        variant="ghost"
                                        className="text-sm font-medium text-white hover:text-white hover:bg-white/10"
                                    >
                                        Login
                                    </Button>
                                    <Button
                                        onClick={() => signIn()}
                                        className="bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white border-0 shadow-lg shadow-indigo-500/20 transition-all hover:scale-105"
                                    >
                                        Get Started
                                    </Button>
                                </>
                            )}
                        </nav>
                    </div>
                </div>
            </header>
        </div>
    )
}
