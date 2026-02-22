import Link from "next/link"
import { Package2, Github, Linkedin, Youtube, Heart } from "lucide-react"

export function Footer() {
    return (
        <footer className="bg-slate-950 border-t border-slate-800">
            <div className="container px-4 mx-auto py-12 md:py-16">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
                    {/* Column 1: Brand */}
                    <div className="col-span-2 md:col-span-1 space-y-4">
                        <Link className="flex items-center space-x-2" href="/">
                            <Package2 className="h-6 w-6 text-indigo-500" />
                            <span className="font-bold text-slate-100 text-lg">
                                ZenTask AI
                            </span>
                        </Link>
                        <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
                            Built for the next generation of engineers. Automate your workflow and focus on what matters.
                        </p>
                    </div>

                    {/* Column 2: Product */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-slate-100">Product</h4>
                        <ul className="space-y-2 text-sm text-slate-400">
                            <li>
                                <Link href="/features" className="hover:text-indigo-400 transition-colors">Features</Link>
                            </li>
                            <li>
                                <Link href="/ai" className="hover:text-indigo-400 transition-colors">AI Architecture</Link>
                            </li>
                            <li>
                                <Link href="/security" className="hover:text-indigo-400 transition-colors">Security</Link>
                            </li>
                            <li>
                                <Link href="/pricing" className="hover:text-indigo-400 transition-colors">Pricing</Link>
                            </li>
                        </ul>
                    </div>

                    {/* Column 3: Company */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-slate-100">Company</h4>
                        <ul className="space-y-2 text-sm text-slate-400">
                            <li>
                                <Link href="/about" className="hover:text-indigo-400 transition-colors">About</Link>
                            </li>
                            <li>
                                <Link href="/blog" className="hover:text-indigo-400 transition-colors">Blog</Link>
                            </li>
                            <li>
                                <Link href="/careers" className="hover:text-indigo-400 transition-colors">Careers</Link>
                            </li>
                            <li>
                                <Link href="/contact" className="hover:text-indigo-400 transition-colors">Contact</Link>
                            </li>
                        </ul>
                    </div>

                    {/* Column 4: Social */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-slate-100">Connect</h4>
                        <div className="flex gap-4">
                            <Link
                                href="https://github.com"
                                target="_blank"
                                rel="noreferrer"
                                className="p-2 bg-slate-900 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-all hover:scale-110"
                            >
                                <Github className="h-5 w-5" />
                                <span className="sr-only">GitHub</span>
                            </Link>
                            <Link
                                href="https://linkedin.com"
                                target="_blank"
                                rel="noreferrer"
                                className="p-2 bg-slate-900 rounded-full text-slate-400 hover:text-white hover:bg-[#0077b5] transition-all hover:scale-110"
                            >
                                <Linkedin className="h-5 w-5" />
                                <span className="sr-only">LinkedIn</span>
                            </Link>
                            <Link
                                href="https://youtube.com/@FaithfulReflections"
                                target="_blank"
                                rel="noreferrer"
                                className="p-2 bg-slate-900 rounded-full text-slate-400 hover:text-white hover:bg-[#FF0000] transition-all hover:scale-110"
                            >
                                <Youtube className="h-5 w-5" />
                                <span className="sr-only">YouTube</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="pt-8 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-slate-500 text-sm font-medium">
                        © 2026 ZenTask AI. All rights reserved.
                    </p>
                    <div className="flex items-center gap-1 text-slate-500 text-sm font-medium">
                        <span>Made with</span>
                        <Heart className="h-4 w-4 text-rose-500 fill-rose-500 animate-pulse" />
                        <span>in Lahore</span>
                    </div>
                </div>
            </div>
        </footer>
    )
}
