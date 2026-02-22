"use client"

import { motion } from "framer-motion"
import { Bot, Plus, MoreHorizontal, Calendar, Users } from "lucide-react"

export function HeroSection() {
    return (
        <section className="relative overflow-hidden pt-20 pb-32">
            <div className="container px-4 mx-auto text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="max-w-4xl mx-auto mb-12"
                >
                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-6">
                        <span className="bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                            Project Management,
                        </span>
                        <br />
                        <span className="bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                            Reimagined with AI.
                        </span>
                    </h1>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                        Stop manual entry. Let ZenTask AI architect your workflow while you focus on building.
                    </p>
                </motion.div>

                {/* Product Mockup Container */}
                <motion.div
                    initial={{ opacity: 0, y: 60, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                    className="relative max-w-5xl mx-auto"
                >
                    {/* Glow Effect */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur-3xl opacity-20 pointer-events-none" />

                    <div className="relative rounded-2xl border border-slate-800 bg-slate-900/50 shadow-2xl overflow-hidden aspect-[16/9] md:aspect-[21/9]">

                        {/* Blurred Kanban Background */}
                        <div className="absolute inset-0 p-6 grid grid-cols-3 gap-6 opacity-50 blur-[2px] scale-[1.02] pointer-events-none select-none">
                            {/* Column 1 */}
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center justify-between text-sm font-medium text-slate-400 px-2">
                                    <span>To Do</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                </div>
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50 space-y-3">
                                        <div className="h-2 w-2/3 bg-slate-700 rounded" />
                                        <div className="h-2 w-full bg-slate-700/50 rounded" />
                                        <div className="flex items-center justify-between">
                                            <div className="h-6 w-6 rounded-full bg-indigo-500/20" />
                                            <div className="h-4 w-12 bg-slate-700/30 rounded" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {/* Column 2 */}
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center justify-between text-sm font-medium text-slate-400 px-2">
                                    <span>In Progress</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                </div>
                                {[1, 2].map((i) => (
                                    <div key={i} className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50 space-y-3">
                                        <div className="h-2 w-3/4 bg-slate-700 rounded" />
                                        <div className="flex items-center gap-2 mt-2">
                                            <div className="h-5 w-5 rounded bg-green-500/20" />
                                            <div className="h-2 w-16 bg-slate-700/50 rounded" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {/* Column 3 */}
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center justify-between text-sm font-medium text-slate-400 px-2">
                                    <span>Done</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                </div>
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50 opacity-60">
                                        <div className="h-2 w-1/2 bg-slate-700 rounded" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Floating AI Generator Modal */}
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.8, type: "spring", stiffness: 200, damping: 20 }}
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md"
                        >
                            <div className="bg-slate-900 border border-indigo-500/30 rounded-xl shadow-[0_0_50px_-12px_rgba(139,92,246,0.3)] overflow-hidden">
                                <div className="p-4 border-b border-indigo-500/20 bg-indigo-500/5 flex items-center gap-3">
                                    <div className="p-2 bg-indigo-500/20 rounded-lg">
                                        <Bot className="h-5 w-5 text-indigo-400" />
                                    </div>
                                    <span className="font-semibold text-indigo-100">AI Task Architect</span>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div className="space-y-2">
                                        <div className="text-sm text-slate-400 uppercase tracking-wider font-medium">Prompt</div>
                                        <div className="text-lg text-slate-200 font-light">
                                            "Build a launch plan for the Q3 marketing campaign..."
                                            <span className="animate-pulse duration-1000 inline-block w-[2px] h-5 bg-indigo-400 ml-1 align-middle" />
                                        </div>
                                    </div>
                                    <div className="pt-4 flex gap-3">
                                        <button className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                                            <Bot className="h-4 w-4" />
                                            Generate Tasks
                                        </button>
                                        <button className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium transition-colors">
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                                {/* Abstract data processing visual */}
                                <div className="h-1 w-full bg-slate-800 overflow-hidden">
                                    <motion.div
                                        className="h-full bg-indigo-500 w-1/3"
                                        animate={{ x: ["-100%", "300%"] }}
                                        transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                                    />
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
