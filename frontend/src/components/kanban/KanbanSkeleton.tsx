import { Skeleton } from "@/components/ui/skeleton"

export function KanbanSkeleton() {
    return (
        <div className="flex gap-6 overflow-x-hidden pb-4">
            {[1, 2, 3].map((i) => (
                <div key={i} className="w-80 shrink-0 space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <Skeleton className="h-6 w-24" />
                        <Skeleton className="h-8 w-8 rounded-md" />
                    </div>
                    <div className="space-y-3">
                        {[1, 2, 3].map((j) => (
                            <Skeleton key={j} className="h-24 w-full rounded-xl" />
                        ))}
                    </div>
                    <Skeleton className="h-10 w-full rounded-md" />
                </div>
            ))}
        </div>
    )
}
