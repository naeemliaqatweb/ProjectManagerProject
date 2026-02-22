'use client';

import { useEffect, useState } from 'react';
import api from '@/utils/api';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { CreateProjectModal } from '@/components/CreateProjectModal';

// Extend the Session User type to include 'id'
interface AuthenticatedUser {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
}

interface Project {
    id: string;
    name: string;
    description: string;
    createdAt: string;
}

export default function DashboardPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
            return;
        }

        const loadDashboard = async () => {
            const authUser = session?.user as AuthenticatedUser;
            if (!authUser?.id) return;

            try {
                const response = await api.get(`/projects/user/${authUser.id}`);
                setProjects(response.data);
            } catch (err: any) {
                console.error('Failed to load dashboard data', err);
                setError(err.response?.data?.message || 'Failed to load projects. Please ensure backend is running.');
            } finally {
                setLoading(false);
            }
        };

        if (status === 'authenticated') {
            loadDashboard();
        }
    }, [status, session, router]);

    if (status === 'loading' || (status === 'authenticated' && loading)) {
        return <div className="p-4 text-muted-foreground animate-pulse">Loading your workspace...</div>;
    }

    if (error) return <div className="p-4 text-red-500 bg-red-500/10 rounded-md border border-red-500/20">{error}</div>;

    const user = session?.user;

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Welcome, {user?.name || 'User'}!</h1>
                <p className="text-muted-foreground">Manage your projects and collaborate with your team.</p>
            </div>

            <div className="flex justify-between items-center bg-card p-6 rounded-xl border shadow-sm">
                <div>
                    <h2 className="text-xl font-semibold">My Projects</h2>
                    <p className="text-sm text-muted-foreground">You have {projects.length} active projects</p>
                </div>
                <CreateProjectModal>
                    <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        New Project
                    </Button>
                </CreateProjectModal>
            </div>

            {projects.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-card rounded-xl border border-dashed text-center">
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                        <Plus className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium">No projects yet</h3>
                    <p className="text-muted-foreground mb-6">Create your first project to get started!</p>
                    <CreateProjectModal>
                        <Button variant="outline">Create a Project</Button>
                    </CreateProjectModal>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project: any) => (
                        <Link
                            href={`/dashboard/projects/${project.id}`}
                            key={project.id}
                            className="group"
                        >
                            <Card className="h-full transition-all duration-200 hover:shadow-md hover:border-primary/50 group-hover:-translate-y-1">
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors">
                                            {project.name}
                                        </CardTitle>
                                    </div>
                                    <CardDescription className="line-clamp-2">
                                        {project.description || 'No description provided.'}
                                    </CardDescription>
                                </CardHeader>
                                <CardFooter className="pt-4 border-t text-xs text-muted-foreground flex justify-between">
                                    <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                                    <span className="text-primary font-medium group-hover:underline">Manage Tasks</span>
                                </CardFooter>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
