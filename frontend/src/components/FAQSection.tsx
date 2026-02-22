"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Minus } from "lucide-react"
import { clsx } from "clsx"

const faqs = [
    {
        question: "How does the AI Task Generator work?",
        answer: "It uses GPT-4 to analyze your project description and context. Then, it intelligently maps out a complete task list, assigning appropriate labels, priorities, and even estimating timeframes based on historical data."
    },
    {
        question: "Is my data secure with 2FA?",
        answer: "Absolutely. We use industry-standard TOTP (Time-based One-Time Password) encryption. Your 2FA secrets are never stored in plain text, and we enforce strict session management to ensure only you can access your account."
    },
    {
        question: "Can I integrate with other tools?",
        answer: "Yes! We currently support incoming Webhooks for automated task creation. We are also actively expanding our API to support deep integrations with GitHub, Slack, and heavy-hitters like Jira in the near future."
    }
]

export function FAQSection() {
    const [openIndex, setOpenIndex] = useState<number | null>(null)

    return (
        <section className="py-24 bg-slate-950">
            <div className="container px-4 mx-auto max-w-3xl">
                <h2 className="text-3xl md:text-4xl font-bold text-center text-slate-100 mb-12">
                    Frequently Answered Questions
                </h2>

                <div className="space-y-4">
                    {faqs.map((faq, index) => {
                        const isOpen = openIndex === index

                        return (
                            <motion.div
                                key={index}
                                initial={false}
                                animate={{
                                    borderColor: isOpen ? "rgb(99 102 241 / 0.5)" : "rgb(30 41 59)",
                                    boxShadow: isOpen ? "0 0 40px -10px rgba(99, 102, 241, 0.2)" : "none"
                                }}
                                className={clsx(
                                    "border rounded-2xl overflow-hidden bg-slate-900/40 transition-colors duration-300",
                                    isOpen ? "bg-slate-900/60" : "hover:border-slate-700"
                                )}
                            >
                                <button
                                    onClick={() => setOpenIndex(isOpen ? null : index)}
                                    className="flex items-center justify-between w-full p-6 text-left"
                                >
                                    <span className={clsx("text-lg font-medium transition-colors", isOpen ? "text-indigo-400" : "text-slate-200")}>
                                        {faq.question}
                                    </span>
                                    <div className={clsx("p-2 rounded-full transition-colors", isOpen ? "bg-indigo-500/20 text-indigo-400" : "bg-slate-800 text-slate-400")}>
                                        {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                                    </div>
                                </button>

                                <AnimatePresence initial={false}>
                                    {isOpen && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3, ease: "easeInOut" }}
                                        >
                                            <div className="px-6 pb-6 text-slate-400 leading-relaxed">
                                                {faq.answer}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
