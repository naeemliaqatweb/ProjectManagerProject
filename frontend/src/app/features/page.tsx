"use client"

import { GlassHeader } from "@/components/GlassHeader";
import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";
import { FileCode, ShieldCheck, Zap, Users, Lock, Smartphone } from "lucide-react";

const CodeSnippet = () => (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 font-mono text-xs md:text-sm text-slate-300 shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 left-0 right-0 h-8 bg-slate-800/50 flex items-center px-4 space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500/20"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500/20"></div>
            <div className="w-3 h-3 rounded-full bg-green-500/20"></div>
        </div>
        <div className="mt-6 space-y-1">
            <div className="text-purple-400">{"{"}</div>
            <div className="pl-4">
                <span className="text-indigo-400">"task"</span>: <span className="text-green-400">"Implement Authentication"</span>,
            </div>
            <div className="pl-4">
                <span className="text-indigo-400">"type"</span>: <span className="text-yellow-400">"feature"</span>,
            </div>
            <div className="pl-4">
                <span className="text-indigo-400">"priority"</span>: <span className="text-red-400">"high"</span>,
            </div>
            <div className="pl-4">
                <span className="text-indigo-400">"subtasks"</span>: [
            </div>
            <div className="pl-8">
                <span className="text-slate-400">"Setup NextAuth.js"</span>,
            </div>
            <div className="pl-8">
                <span className="text-slate-400">"Create API routes"</span>,
            </div>
            <div className="pl-8">
                <span className="text-slate-400">"Design login UI"</span>
            </div>
            <div className="pl-4">]</div>
            <div className="text-purple-400">{"}"}</div>
        </div>
        {/* Floating cursor animation */}
        <motion.div
            animate={{ opacity: [1, 0] }}
            transition={{ repeat: Infinity, duration: 0.8 }}
            className="inline-block w-2 h-4 bg-indigo-500 ml-1 align-middle"
        />
    </div>
);

const SecurityVisual = () => (
    <div className="relative w-64 h-64 mx-auto bg-slate-900 rounded-3xl border border-slate-800 flex items-center justify-center p-6 shadow-[0_0_50px_-12px_rgba(99,102,241,0.2)]">
        {/* QR Code Placeholder */}
        <div className="w-full h-full bg-slate-950 rounded-2xl p-4 grid grid-cols-6 gap-1 relative overflow-hidden">
            {[...Array(36)].map((_, i) => (
                <div
                    key={i}
                    className={`rounded-sm ${Math.random() > 0.5 ? "bg-slate-800" : "bg-transparent"
                        }`}
                />
            ))}
            <div className="absolute inset-0 flex items-center justify-center">
                <ShieldCheck className="w-16 h-16 text-indigo-500" />
            </div>

            {/* Scanning Line */}
            <motion.div
                className="absolute left-0 right-0 h-1 bg-indigo-500 shadow-[0_0_15px_2px_rgba(99,102,241,0.8)]"
                animate={{ top: ["0%", "100%", "0%"] }}
                transition={{ duration: 3, ease: "linear", repeat: Infinity }}
            />
        </div>
    </div>
);

export default function FeaturesPage() {
    return (
        <div className="min-h-screen bg-slate-950 font-sans text-slate-100">
            <GlassHeader />

            <main className="pt-32 pb-24">

                {/* Header */}
                <div className="container px-4 mx-auto text-center mb-24">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                        Power under the hood.
                    </h1>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                        Explore the technology that makes ZenTask AI the choice for modern engineering teams.
                    </p>
                </div>

                {/* Section 1: AI Architect */}
                <div className="container px-4 mx-auto mb-32">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                        <div className="lg:sticky lg:top-32 self-start space-y-6">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium">
                                <FileCode className="h-4 w-4" />
                                <span>OpenAI Integration</span>
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold">
                                The AI Task Architect
                            </h2>
                            <p className="text-lg text-slate-400 leading-relaxed">
                                Stop manually breaking down projects. Our fine-tuned GPT-4 model analyzes your high-level project descriptions and architecturally maps them into actionable, dependent tasks.
                            </p>
                            <ul className="space-y-4 text-slate-300">
                                <li className="flex items-center gap-3">
                                    <div className="h-2 w-2 bg-indigo-500 rounded-full" />
                                    Intelligent Label Assignment
                                </li>
                                <li className="flex items-center gap-3">
                                    <div className="h-2 w-2 bg-indigo-500 rounded-full" />
                                    Automated Dependency Graphing
                                </li>
                                <li className="flex items-center gap-3">
                                    <div className="h-2 w-2 bg-indigo-500 rounded-full" />
                                    Time Estimation based on Historical Data
                                </li>
                            </ul>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="relative"
                        >
                            <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full" />
                            <CodeSnippet />
                        </motion.div>
                    </div>
                </div>

                {/* Section 2: Security */}
                <div className="container px-4 mx-auto mb-32">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                        {/* Visual First on Mobile, but Sticky Logic needs to be handled carefully. 
                We swap order visually for Desktop to match "Left scanning QR code" requirement. */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="order-2 lg:order-1 relative lg:sticky lg:top-32 self-start"
                        >
                            <SecurityVisual />
                        </motion.div>

                        <div className="order-1 lg:order-2 space-y-6 self-center">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm font-medium">
                                <Lock className="h-4 w-4" />
                                <span>Enterprise Security</span>
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold">
                                Bank-Grade Protection
                            </h2>
                            <p className="text-lg text-slate-400 leading-relaxed">
                                Your data is yours. We employ industry-standard security protocols to ensure your intellectual property remains safe.
                            </p>
                            <div className="grid gap-6 mt-8">
                                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
                                    <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                                        <Smartphone className="h-5 w-5 text-emerald-500" />
                                        Two-Factor Authentication
                                    </h4>
                                    <p className="text-sm text-slate-400">
                                        TOTP-based 2FA support compatible with Google Authenticator and Authy.
                                    </p>
                                </div>
                                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
                                    <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                                        <ShieldCheck className="h-5 w-5 text-emerald-500" />
                                        JWT Architecture
                                    </h4>
                                    <p className="text-sm text-slate-400">
                                        Stateless, secure session management using short-lived access tokens and secure refresh rotation.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 3: Real-Time (Bento) */}
                <div className="container px-4 mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            Real-Time Collaboration
                        </h2>
                        <p className="text-slate-400 max-w-xl mx-auto">
                            Built on top of WebSocket technology for instant state synchronization across all connected clients.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Bento Card 1: Live Presence */}
                        <div className="md:col-span-2 p-8 rounded-3xl bg-slate-900/50 border border-slate-800 relative overflow-hidden group hover:border-indigo-500/30 transition-colors">
                            <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:opacity-40 transition-opacity">
                                <Users className="w-32 h-32 text-indigo-500" />
                            </div>
                            <div className="relative z-10">
                                <h3 className="text-2xl font-bold text-white mb-2">Live Presence</h3>
                                <p className="text-slate-400 mb-6 max-w-sm">See who's viewing a task in real-time. Avoid collisions and overlapping work.</p>
                                <div className="flex -space-x-4">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className="w-12 h-12 rounded-full border-4 border-slate-900 bg-slate-800 flex items-center justify-center font-bold text-slate-500">
                                            U{i}
                                        </div>
                                    ))}
                                    <div className="w-12 h-12 rounded-full border-4 border-slate-900 bg-emerald-500 flex items-center justify-center text-white font-bold">
                                        +3
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bento Card 2: Instant Headers */}
                        <div className="md:col-span-1 p-8 rounded-3xl bg-slate-900/50 border border-slate-800 flex flex-col justify-between group hover:border-indigo-500/30 transition-colors">
                            <div>
                                <Zap className="w-10 h-10 text-yellow-500 mb-4" />
                                <h3 className="text-xl font-bold text-white mb-2">Instant Updates</h3>
                                <p className="text-slate-400 text-sm"> 50ms latency on task updates.</p>
                            </div>
                            <div className="mt-8 h-20 bg-slate-800/50 rounded-xl w-full relative overflow-hidden">
                                <motion.div
                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                                    animate={{ x: ["-100%", "100%"] }}
                                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                />
                            </div>
                        </div>

                        {/* Bento Card 3: Drag & Drop */}
                        <div className="md:col-span-3 p-8 rounded-3xl bg-slate-900/50 border border-slate-800 relative group hover:border-indigo-500/30 transition-colors">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                                <div className="flex-1">
                                    <h3 className="text-2xl font-bold text-white mb-2">Drag & Drop Workflows</h3>
                                    <p className="text-slate-400">Reorder tasks, move them between columns, or assign members with intuitive drag-and-drop actions.</p>
                                </div>
                                <div className="flex-1 w-full p-4 bg-slate-950/50 rounded-xl border border-slate-800 border-dashed">
                                    <div className="flex gap-4">
                                        <motion.div
                                            className="h-24 w-1/3 bg-slate-800 rounded-lg"
                                            animate={{ scale: [1, 1.05, 1] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                        />
                                        <div className="h-24 w-1/3 bg-slate-800 rounded-lg opacity-50" />
                                        <div className="h-24 w-1/3 bg-slate-800 rounded-lg opacity-50" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </main>
            <Footer />
        </div>
    );
}
