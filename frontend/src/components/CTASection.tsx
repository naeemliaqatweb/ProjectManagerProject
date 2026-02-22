"use client"

import { ArrowRight, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

export function CTASection() {
    return (
        <section className="py-24 bg-slate-950">
            <div className="container px-4 mx-auto">
                <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-indigo-500/30">

                    {/* Gradient Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-slate-900/50 to-violet-900/20" />

                    {/* Glowing Orb Effects */}
                    <div className="absolute -top-24 -right-24 h-96 w-96 bg-indigo-500/20 rounded-full blur-3xl" />
                    <div className="absolute -bottom-24 -left-24 h-96 w-96 bg-violet-500/20 rounded-full blur-3xl" />

                    <div className="relative z-10 px-6 py-24 md:py-32 text-center">

                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium mb-8">
                            <Sparkles className="h-4 w-4" />
                            <span>Join the future of project management</span>
                        </div>

                        <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-6">
                            Ready to architect <br className="hidden md:block" />
                            <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                                your next big project?
                            </span>
                        </h2>

                        <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                            Join 1,000+ developers using ZenTask AI to ship faster.
                            Stop managing tasks and start building products.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Button
                                size="lg"
                                className="h-14 px-8 text-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_20px_-5px_rgba(79,70,229,0.5)] transition-all hover:scale-105"
                            >
                                Get Started for Free
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>

                            <Button
                                size="lg"
                                variant="outline"
                                className="h-14 px-8 text-lg border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white transition-all"
                            >
                                Book a Demo
                            </Button>
                        </div>

                        <p className="mt-6 text-sm text-slate-500">
                            No credit card required. Free for teams up to 5.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    )
}
