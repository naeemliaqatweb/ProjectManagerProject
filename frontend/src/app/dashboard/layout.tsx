import { Sidebar } from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import { RealTimeProvider } from '@/components/RealTimeProvider';
import { TimerProvider } from '@/components/kanban/TimerProvider';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex flex-1 flex-col">
                <RealTimeProvider>
                    <TimerProvider>
                        <Navbar />
                        <main className="flex-1 p-4 md:p-8 bg-background">
                            <div className="mx-auto max-w-7xl">
                                {children}
                            </div>
                        </main>
                    </TimerProvider>
                </RealTimeProvider>
            </div>
        </div>
    );
}
