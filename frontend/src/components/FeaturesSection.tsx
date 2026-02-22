"use client"

import { motion } from "framer-motion"
import { Shield, Zap, QrCode, Bot } from "lucide-react"

export function FeaturesSection() {
    return (
        <section className="py-24 bg-slate-950">
            <div className="container px-4 mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">

                    {/* Card 1: AI Architect (Large) */}
                    <div className="md:col-span-2 group relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/50 p-8 hover:border-indigo-500/50 transition-colors duration-500">
                        <div className="relative z-10 h-full flex flex-col justify-between">
                            <div>
                                <div className="p-3 bg-indigo-500/10 w-fit rounded-xl mb-4">
                                    <Bot className="h-6 w-6 text-indigo-400" />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-100 mb-2">AI Architect</h3>
                                <p className="text-slate-400 max-w-sm">
                                    Transform vague ideas into actionable project plans instantly.
                                </p>
                            </div>

                            {/* Animation: Text transforming to Task Card */}
                            <div className="relative h-24 w-full">
                                <motion.div
                                    initial={{ opacity: 1, y: 0 }}
                                    whileInView={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.5, delay: 2, repeat: Infinity, repeatDelay: 3 }}
                                    className="absolute inset-0 flex items-center"
                                >
                                    <span className="text-lg font-mono text-indigo-300">"Build a marketing plan..."</span>
                                </motion.div>
                                <motion.div
                                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{ duration: 0.5, delay: 2.5, repeat: Infinity, repeatDelay: 3 }}
                                    className="absolute inset-0 flex items-center"
                                >
                                    <div className="w-full max-w-xs bg-slate-800 rounded-lg p-3 border border-slate-700 shadow-lg flex items-center gap-3">
                                        <div className="h-4 w-4 bg-indigo-500 rounded-full" />
                                        <div className="h-2 w-24 bg-slate-600 rounded" />
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                        <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Bot className="h-64 w-64 text-indigo-500 rotate-12" />
                        </div>
                    </div>

                    {/* Card 2: Military Grade Security */}
                    <div className="md:col-span-1 group relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/50 p-8 hover:border-indigo-500/50 transition-colors duration-500">
                        <div className="relative z-10 h-full flex flex-col justify-between">
                            <div>
                                <div className="p-3 bg-indigo-500/10 w-fit rounded-xl mb-4">
                                    <Shield className="h-6 w-6 text-indigo-400" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-100 mb-2">Military Grade Security</h3>
                                <p className="text-slate-400 text-sm">
                                    Enterprise-ready with 2FA and encryption.
                                </p>
                            </div>
                            <div className="flex justify-center items-center py-4">
                                <div className="relative">
                                    <Shield className="h-24 w-24 text-slate-800" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <QrCode className="h-12 w-12 text-indigo-500" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl group-hover:bg-indigo-500/30 transition-colors" />
                    </div>

                    {/* Card 3: Real-time Sync */}
                    <div className="md:col-span-1 group relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/50 p-8 hover:border-indigo-500/50 transition-colors duration-500">
                        <div className="relative z-10 h-full flex flex-col justify-between">
                            <div>
                                <div className="p-3 bg-indigo-500/10 w-fit rounded-xl mb-4">
                                    <Zap className="h-6 w-6 text-indigo-400" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-100 mb-2">Real-time Sync</h3>
                                <p className="text-slate-400 text-sm">
                                    Socket.io powered instant updates.
                                </p>
                            </div>
                            <div className="flex items-end justify-center gap-1 h-20 pb-4">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <motion.div
                                        key={i}
                                        animate={{ height: ["20%", "80%", "20%"] }}
                                        transition={{
                                            duration: 1,
                                            repeat: Infinity,
                                            delay: i * 0.1,
                                            ease: "easeInOut"
                                        }}
                                        className="w-3 bg-indigo-500/80 rounded-full"
                                    />
                                ))}
                            </div>
                        </div>
                        <div className="absolute -top-6 -left-6 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl group-hover:bg-indigo-500/30 transition-colors" />
                    </div>

                    {/* Placeholder for future card to balance grid if needed, or keeping it empty for now as per prompt (3 cards specified) */}

                </div>
            </div>
        </section>
    )
}
