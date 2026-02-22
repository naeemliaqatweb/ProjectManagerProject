"use client"

import { GlassHeader } from "@/components/GlassHeader"
import { Footer } from "@/components/Footer"
import { motion } from "framer-motion"
import { Github, Linkedin, Youtube, Layers, Database, Server, Code2, Globe } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

const TechCard = ({ icon: Icon, name, role }: { icon: any, name: string, role: string }) => (
    <motion.div
        whileHover={{ y: -5 }}
        className="flex flex-col items-center justify-center p-6 bg-slate-900/50 border border-slate-800 rounded-2xl backdrop-blur-sm"
    >
        <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center mb-4 text-indigo-400">
            <Icon className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-1">{name}</h3>
        <p className="text-sm text-slate-500">{role}</p>
    </motion.div>
)

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-slate-950 font-sans text-slate-100">
            <GlassHeader />

            <main className="pt-32 pb-24">

                {/* Mission Section */}
                <div className="container px-4 mx-auto text-center mb-32">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium mb-6">
                            <Globe className="h-4 w-4" />
                            <span>Our Mission</span>
                        </div>
                        <h1 className="text-4xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-white via-slate-200 to-slate-500 bg-clip-text text-transparent leading-tight tracking-tight">
                            Building tools that think <br />
                            <span className="text-indigo-500">as fast as you do.</span>
                        </h1>
                        <p className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
                            We believe project management shouldn't be a project in itself. By fusing advanced AI with intuitive design, we're empowering engineers to focus on what they do best: building the future.
                        </p>
                    </motion.div>
                </div>

                {/* The Tech Stack */}
                <div className="container px-4 mx-auto mb-32">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">The Stack</h2>
                        <p className="text-slate-400">Built with the modern MERN stack ecosystem.</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
                        <TechCard icon={Layers} name="Next.js" role="Frontend Framework" />
                        <TechCard icon={Server} name="NestJS" role="Backend API" />
                        <TechCard icon={Database} name="MongoDB Atlas" role="Cloud Database" />
                        <TechCard icon={Code2} name="TypeScript" role="Type Safety" />
                    </div>
                </div>

                {/* The Architect Profile */}
                <div className="container px-4 mx-auto">
                    <div className="max-w-5xl mx-auto bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden relative">
                        {/* Background Decoration */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full" />

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 p-8 md:p-12 items-center relative z-10">
                            {/* Image / Avatar Placeholder */}
                            <div className="md:col-span-4 flex justify-center md:justify-start">
                                <div className="w-48 h-48 md:w-full md:max-w-xs md:h-auto aspect-square rounded-2xl bg-gradient-to-br from-slate-800 to-slate-700 border border-slate-600 flex items-center justify-center relative overflow-hidden group">
                                    {/* Using a placeholder gradient or potentially an image if available. 
                             For now, a stylized initial or user icon. */}
                                    <div className="text-6xl font-bold text-slate-500 select-none">NL</div>
                                    {/* <Image src="/path/to/profile.jpg" alt="Naim Liaqat" fill className="object-cover" /> */}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="md:col-span-8 space-y-6 text-center md:text-left">
                                <div>
                                    <h2 className="text-3xl font-bold text-white mb-2">Naim Liaqat</h2>
                                    <p className="text-indigo-400 font-medium">Senior Software Engineer & Architect</p>
                                </div>

                                <p className="text-slate-300 leading-relaxed text-lg">
                                    With over 4+ years of experience in full-stack development, I've journeyed from building robust PHP/Laravel monoliths to architecting scalable, modern MERN applications driven by AI.
                                </p>
                                <p className="text-slate-400 leading-relaxed">
                                    My passion lies in clean code, intuitive architectures, and teaching others through content creation. ZenTask AI represents the culmination of my expertise in building systems that solve real-world engineering problems.
                                </p>

                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-4">
                                    <Link href="https://github.com" target="_blank">
                                        <Button variant="outline" className="gap-2 border-slate-700 hover:bg-slate-800 hover:text-white">
                                            <Github className="w-4 h-4" />
                                            GitHub
                                        </Button>
                                    </Link>
                                    <Link href="https://linkedin.com" target="_blank">
                                        <Button variant="outline" className="gap-2 border-slate-700 hover:bg-slate-800 hover:text-white">
                                            <Linkedin className="w-4 h-4" />
                                            LinkedIn
                                        </Button>
                                    </Link>
                                    <Link href="https://youtube.com" target="_blank">
                                        <Button variant="outline" className="gap-2 border-slate-700 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/50">
                                            <Youtube className="w-4 h-4" />
                                            Faithful Reflections
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </main>
            <Footer />
        </div>
    )
}

// Simple Button component re-declaration to avoid import issues if the path is complex or customized differently in this file context, 
// though typically we import from ui/button.
// Let's import proper UI button actually.
import { Button } from "@/components/ui/button"
