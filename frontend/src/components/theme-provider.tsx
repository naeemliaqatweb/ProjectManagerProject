"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

export function ThemeProvider({
    children,
    ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
    React.useEffect(() => {
        const savedColor = localStorage.getItem("accent-color")
        if (savedColor) {
            const root = document.documentElement
            root.style.setProperty("--primary", savedColor)
            root.style.setProperty("--ring", savedColor)
        }
    }, [])

    return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
