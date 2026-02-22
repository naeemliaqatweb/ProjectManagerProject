"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, Check, UserPlus, Mail } from "lucide-react"

export function SharingSection() {
    const [email, setEmail] = useState("")
    const [inviteStatus, setInviteStatus] = useState<"idle" | "sending" | "sent">("idle")

    const handleInvite = (e: React.FormEvent) => {
        e.preventDefault()
        if (!email) return

        setInviteStatus("sending")
        // Simulate network request
        setTimeout(() => {
            setInviteStatus("sent")
            setEmail("")
            // Reset after showing success for a while
            setTimeout(() => setInviteStatus("idle"), 3000)
        }, 1500)
    }

    return (
        <section className="py-20 bg-slate-950/50 border-y border-slate-900 overflow-hidden">
            <div className="container px-4 mx-auto">
                <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24">

                    {/* Text Content */}
                    <div className="flex-1 text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm font-medium mb-6">
                            <UserPlus className="h-4 w-4" />
                            <span>Real-time Collaboration</span>
                        </div>
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
                            Share projects with <br className="hidden lg:block" />
                            <span className="text-emerald-400">one click.</span>
                        </h2>
                        <p className="text-lg text-slate-400 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                            Onboard your team in seconds, not days. Send an email invite and they're instantly synced to your workspace with role-based access.
                        </p>

                        <div className="flex flex-wrap justify-center lg:justify-start gap-4 text-sm text-slate-500 font-medium">
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                                No account needed to view
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-indigo-500" />
                                Instant sync
                            </div>
                        </div>
                    </div>

                    {/* Interactive Demo */}
                    <div className="flex-1 w-full max-w-md lg:max-w-xl relative">
                        {/* Glow Effect */}
                        <div className="absolute inset-0 bg-emerald-500/20 blur-[100px] rounded-full opacity-30" />

                        <div className="relative bg-slate-900 rounded-2xl border border-slate-800 p-6 md:p-8 shadow-2xl">
                            <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-4">
                                <div>
                                    <h3 className="text-white font-semibold flex items-center gap-2">
                                        <Mail className="h-5 w-5 text-indigo-400" />
                                        Invite Team
                                    </h3>
                                    <p className="text-slate-400 text-sm">Add members to 'Q1 Roadmap'</p>
                                </div>
                                <div className="flex -space-x-2">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="h-8 w-8 rounded-full border-2 border-slate-900 bg-slate-700 flex items-center justify-center text-xs text-white">
                                            U{i}
                                        </div>
                                    ))}
                                    <div className="h-8 w-8 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-xs text-slate-400">
                                        +
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={handleInvite} className="relative">
                                <div className="relative flex items-center">
                                    <Mail className="absolute left-3 h-5 w-5 text-slate-500" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="colleague@example.com"
                                        disabled={inviteStatus !== "idle"}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-4 pl-10 pr-32 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!email || inviteStatus !== "idle"}
                                        className="absolute right-2 top-2 bottom-2 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                                    >
                                        <AnimatePresence mode="wait">
                                            {inviteStatus === "idle" && (
                                                <motion.div
                                                    key="idle"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    className="flex items-center gap-2"
                                                >
                                                    <span>Send</span>
                                                    <Send className="h-3 w-3" />
                                                </motion.div>
                                            )}
                                            {inviteStatus === "sending" && (
                                                <motion.div
                                                    key="sending"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                >
                                                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                </motion.div>
                                            )}
                                            {inviteStatus === "sent" && (
                                                <motion.div
                                                    key="sent"
                                                    initial={{ scale: 0.5, opacity: 0 }}
                                                    animate={{ scale: 1, opacity: 1 }}
                                                    className="flex items-center gap-2"
                                                >
                                                    <span>Sent</span>
                                                    <Check className="h-3 w-3" />
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </button>
                                </div>
                            </form>

                            <AnimatePresence>
                                {inviteStatus === "sent" && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-3"
                                    >
                                        <div className="h-6 w-6 rounded-full bg-emerald-500 flex items-center justify-center">
                                            <Check className="h-3 w-3 text-white" />
                                        </div>
                                        <p className="text-sm text-emerald-200">
                                            Invitation sent successfully! They'll receive an email shortly.
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                        </div>
                    </div>

                </div>
            </div>
        </section>
    )
}
