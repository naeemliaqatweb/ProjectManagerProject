"use client"

import React, { createContext, useContext, useState, useEffect, useRef } from 'react'
import { useRealTime } from '@/components/RealTimeProvider'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface ActiveTask {
    id: string
    title: string
    startTime: number // timestamp
}

interface TimerContextType {
    activeTask: ActiveTask | null
    startTimer: (taskId: string, title: string) => void
    stopTimer: () => void
    elapsedSeconds: number
}

const TimerContext = createContext<TimerContextType | undefined>(undefined)

export const TimerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [activeTask, setActiveTask] = useState<ActiveTask | null>(null)
    const [elapsedSeconds, setElapsedSeconds] = useState(0)
    const [showPopup, setShowPopup] = useState(false)
    const { emitTaskTimeUpdate } = useRealTime()
    const lastEmitRef = useRef<number>(0)

    // Load from local storage on mount
    useEffect(() => {
        const saved = localStorage.getItem('active_timer')
        if (saved) {
            try {
                const parsed = JSON.parse(saved)
                setActiveTask(parsed)
                const now = Date.now()
                const totalElapsedSeconds = Math.floor((now - parsed.startTime) / 1000)
                setElapsedSeconds(totalElapsedSeconds % 60)
                lastEmitRef.current = Math.floor(totalElapsedSeconds / 60)
            } catch (e) {
                console.error("Failed to parse saved timer", e)
                localStorage.removeItem('active_timer')
            }
        }
    }, [])

    useEffect(() => {
        let interval: NodeJS.Timeout
        if (activeTask) {
            interval = setInterval(() => {
                const now = Date.now()
                const totalElapsed = Math.floor((now - activeTask.startTime) / 1000)
                const minutes = Math.floor(totalElapsed / 60)
                const seconds = totalElapsed % 60

                setElapsedSeconds(seconds)

                // Sync minutes to backend
                if (minutes > lastEmitRef.current) {
                    const diff = minutes - lastEmitRef.current
                    emitTaskTimeUpdate(activeTask.id, diff)
                    lastEmitRef.current = minutes
                }

                // Check for 5-minute idle popup (every 300 seconds)
                if (totalElapsed > 0 && totalElapsed % 300 === 0) {
                    setShowPopup(true)
                }
            }, 1000)
        }
        return () => {
            if (interval) clearInterval(interval)
        }
    }, [activeTask, emitTaskTimeUpdate])

    const startTimer = (taskId: string, title: string) => {
        // If there's an existing timer, stop it first
        if (activeTask && activeTask.id !== taskId) {
            stopTimer()
        }

        const timerData = { id: taskId, title, startTime: Date.now() }
        setActiveTask(timerData)
        setElapsedSeconds(0)
        lastEmitRef.current = 0
        localStorage.setItem('active_timer', JSON.stringify(timerData))
    }

    const stopTimer = () => {
        if (activeTask) {
            // Final sync of partial minutes
            const totalElapsed = Math.floor((Date.now() - activeTask.startTime) / 1000)
            const secondsSinceLastEmit = totalElapsed - (lastEmitRef.current * 60)
            if (secondsSinceLastEmit > 0) {
                emitTaskTimeUpdate(activeTask.id, secondsSinceLastEmit / 60)
            }
        }
        setActiveTask(null)
        setElapsedSeconds(0)
        lastEmitRef.current = 0
        localStorage.removeItem('active_timer')
        setShowPopup(false)
    }

    return (
        <TimerContext.Provider value={{ activeTask, startTimer, stopTimer, elapsedSeconds }}>
            {children}
            <Dialog open={showPopup} onOpenChange={setShowPopup}>
                <DialogContent showCloseButton={false}>
                    <DialogHeader>
                        <DialogTitle>Timer Check-in</DialogTitle>
                        <DialogDescription>
                            Your timer for <span className="font-bold text-foreground">"{activeTask?.title}"</span> has been running for 5 minutes.
                            Would you like to keep it running?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-4">
                        <Button variant="outline" onClick={() => stopTimer()}>
                            Stop Timer
                        </Button>
                        <Button onClick={() => setShowPopup(false)}>
                            Continue Tracking
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </TimerContext.Provider>
    )
}

export const useTimer = () => {
    const context = useContext(TimerContext)
    if (!context) throw new Error("useTimer must be used within a TimerProvider")
    return context
}
