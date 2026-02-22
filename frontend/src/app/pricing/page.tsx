"use client"

import { useState } from "react"
import { GlassHeader } from "@/components/GlassHeader"
import { Footer } from "@/components/Footer"
import { motion } from "framer-motion"
import { Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function PricingPage() {
    const [isYearly, setIsYearly] = useState(false)

    const tiers = [
        {
            name: "Free",
            price: "$0",
            description: "Perfect for individuals and hobbyists.",
            features: [
                "3 Projects",
                "Basic AI Task Generation",
                "Community Support",
                "1 GB Storage",
            ],
            notIncluded: [
                "Real-time Collaboration",
                "Advanced Analytics",
                "SSO Integration",
            ],
            cta: "Get Started",
            popular: false,
        },
        {
            name: "Pro",
            price: isYearly ? "$15" : "$19",
            period: "/mo",
            description: "For growing teams that need power.",
            features: [
                "Unlimited Projects",
                "Unlimited AI Tasks",
                "Real-time Collaboration",
                "Advanced Analytics",
                "2FA Security",
                "Priority Support",
            ],
            notIncluded: [
                "SSO Integration",
                "Dedicated Success Manager",
            ],
            cta: "Start Free Trial",
            popular: true,
        },
        {
            name: "Enterprise",
            price: "Custom",
            description: "For large organizations with specific needs.",
            features: [
                "Everything in Pro",
                "SSO & SAML Integration",
                "Dedicated Success Manager",
                "Custom Contracts",
                "Unlimited History",
                "On-premise Deployment Option",
            ],
            notIncluded: [],
            cta: "Contact Sales",
            popular: false,
        },
    ]

    return (
        <div className="min-h-screen bg-slate-950 font-sans text-slate-100 selection:bg-indigo-500/30">
            <GlassHeader />

            <main className="pt-32 pb-24">

                {/* Header */}
                <div className="container px-4 mx-auto text-center mb-16">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                        Simple, Transparent Pricing.
                    </h1>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-12">
                        No credit card required to start. Cancel anytime.
                    </p>

                    {/* Toggle */}
                    <div className="flex items-center justify-center gap-4 mb-8">
                        <span className={`text-sm font-medium ${!isYearly ? "text-white" : "text-slate-500"}`}>It's Monthly</span>
                        <button
                            onClick={() => setIsYearly(!isYearly)}
                            className="relative w-16 h-8 rounded-full bg-slate-800 border border-slate-700 p-1 transition-colors hover:border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                        >
                            <motion.div
                                className="w-6 h-6 rounded-full bg-indigo-500 shadow-lg"
                                animate={{ x: isYearly ? 32 : 0 }}
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            />
                        </button>
                        <span className={`text-sm font-medium ${isYearly ? "text-white" : "text-slate-500"}`}>
                            It's Yearly <span className="text-emerald-400 text-xs ml-1 font-bold">(-20%)</span>
                        </span>
                    </div>
                </div>

                {/* Pricing Cards */}
                <div className="container px-4 mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {tiers.map((tier) => (
                            <div
                                key={tier.name}
                                className={`relative p-8 rounded-3xl bg-slate-900/50 backdrop-blur-sm flex flex-col ${tier.popular
                                        ? "border-2 border-indigo-500 shadow-[0_0_50px_-12px_rgba(99,102,241,0.3)]"
                                        : "border border-slate-800"
                                    }`}
                            >
                                {tier.popular && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full text-xs font-bold text-white shadow-lg uppercase tracking-wider">
                                        Most Popular
                                    </div>
                                )}

                                <div className="mb-8">
                                    <h3 className="text-xl font-bold text-white mb-2">{tier.name}</h3>
                                    <p className="text-slate-400 text-sm mb-6 h-10">{tier.description}</p>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-bold text-white">{tier.price}</span>
                                        {tier.period && <span className="text-slate-500">{tier.period}</span>}
                                    </div>
                                    {isYearly && tier.period && (
                                        <div className="text-xs text-emerald-400 mt-2 font-medium">
                                            Billed ${parseInt(tier.price.replace('$', '')) * 12} yearly
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 mb-8 space-y-4">
                                    {tier.features.map((feature) => (
                                        <div key={feature} className="flex items-start gap-3 text-sm text-slate-300">
                                            <div className="rounded-full p-1 bg-indigo-500/20 text-indigo-400 mt-0.5">
                                                <Check className="w-3 h-3" />
                                            </div>
                                            {feature}
                                        </div>
                                    ))}
                                    {tier.notIncluded.map((feature) => (
                                        <div key={feature} className="flex items-start gap-3 text-sm text-slate-600">
                                            <div className="rounded-full p-1 bg-slate-800/50 text-slate-600 mt-0.5">
                                                <X className="w-3 h-3" />
                                            </div>
                                            {feature}
                                        </div>
                                    ))}
                                </div>

                                <Button
                                    variant={tier.popular ? "default" : "outline"}
                                    className={`w-full py-6 text-base font-semibold transition-all ${tier.popular
                                            ? "bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 border-0 shadow-lg shadow-indigo-500/20"
                                            : "border-slate-700 text-white hover:bg-slate-800 hover:text-white"
                                        }`}
                                >
                                    {tier.cta}
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* FAQ Teaser */}
                <div className="container px-4 mx-auto mt-32 text-center">
                    <h3 className="text-2xl font-bold mb-4">Have specific questions?</h3>
                    <p className="text-slate-400 mb-8">
                        Check out our FAQ section on the home page or contact our support team.
                    </p>
                    <a href="/#faq" className="text-indigo-400 hover:text-indigo-300 font-medium underline underline-offset-4">
                        View FAQs &rarr;
                    </a>
                </div>

            </main>
            <Footer />
        </div>
    )
}
