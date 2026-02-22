"use client"

import { motion } from "framer-motion"
import { Check, Star, User } from "lucide-react"

// Placeholder logos (using text/icons for now as we don't have SVGs)
const logos = [
    "Acme Corp",
    "Global Tech",
    "Nebula Systems",
    "CyberDyne",
    "Stark Ind",
    "Wayne Ent",
    "Massive Dynamic",
    "Hooli",
]

const testimonials = [
    {
        name: "Sarah Chen",
        role: "Product Manager @ TechFlow",
        content: "ZenTask AI completely revolutionized how we handle our sprint planning. The AI Architect is like having a senior PM on call 24/7.",
        avatar: "SC"
    },
    {
        name: "Marcus Rodriguez",
        role: "CTO @ StartupX",
        content: "Finally, a project management tool that doesn't feel like a spreadsheet from 1999. The real-time sync is buttery smooth.",
        avatar: "MR"
    },
    {
        name: "Emily Watson",
        role: "Engineering Lead @ DevCo",
        content: "The specialized workflows for engineering teams are spot on. It cuts through the noise and lets us focus on shipping code.",
        avatar: "EW"
    },
    {
        name: "David Kim",
        role: "Founder @ IndieHacker",
        content: "I was skeptical about AI in PM tools, but ZenTask proves it's the future. It automated 80% of my administrative work.",
        avatar: "DK"
    },
    {
        name: "Jessica Alverez",
        role: "Director of Ops @ ScaleUp",
        content: "Security was our #1 concern. ZenTask's enterprise-grade features and 2FA implementation gave us the peace of mind we needed.",
        avatar: "JA"
    },
    {
        name: "Tom Baker",
        role: "Senior Dev @ CodeWorks",
        content: "The dark mode implementation is flawless. A tool built by developers, for developers. Absolutely love the keyboard shortcuts.",
        avatar: "TB"
    }
]

export function SocialProofSection() {
    return (
        <section className="py-24 bg-slate-950 overflow-hidden">
            <div className="container px-4 mx-auto mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-center text-slate-100 mb-12">
                    Trusted by forward-thinking teams.
                </h2>

                {/* Logo Marquee */}
                <div className="relative flex overflow-hidden mask-linear-fade">
                    <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-slate-950 to-transparent z-10" />
                    <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-slate-950 to-transparent z-10" />

                    <motion.div
                        className="flex gap-16 whitespace-nowrap py-4"
                        animate={{ x: [0, -1000] }}
                        transition={{
                            x: {
                                repeat: Infinity,
                                repeatType: "loop",
                                duration: 30,
                                ease: "linear",
                            },
                        }}
                    >
                        {[...logos, ...logos, ...logos].map((logo, i) => (
                            <div key={i} className="flex items-center gap-2 grayscale opacity-40 hover:opacity-80 hover:grayscale-0 transition-all duration-300 cursor-pointer">
                                <div className="h-8 w-8 bg-slate-800 rounded-full flex items-center justify-center">
                                    <div className="h-4 w-4 bg-slate-600 rounded-sm" />
                                </div>
                                <span className="text-xl font-bold text-slate-300">{logo}</span>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </div>

            {/* Testimonials Grid */}
            <div className="container px-4 mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {testimonials.map((t, i) => (
                        <div
                            key={i}
                            className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 hover:border-indigo-500/30 hover:bg-slate-900/60 transition-all duration-300 hover:scale-[1.02] group"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-sm border border-indigo-500/30">
                                        {t.avatar}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-1">
                                            <h4 className="font-semibold text-slate-200 text-sm">{t.name}</h4>
                                            <Check className="h-3 w-3 text-blue-500" />
                                        </div>
                                        <p className="text-xs text-slate-500">{t.role}</p>
                                    </div>
                                </div>
                                <div className="text-indigo-500/20">
                                    <Star className="h-5 w-5 fill-current" />
                                </div>
                            </div>
                            <p className="text-slate-400 text-sm leading-relaxed group-hover:text-slate-300 transition-colors">
                                "{t.content}"
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
