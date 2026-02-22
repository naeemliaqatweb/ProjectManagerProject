'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import axios from 'axios';
import { Shield } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import Link from 'next/link';

const formSchema = z.object({
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(8, { message: "Password must be at least 8 characters" }),
});

export function LoginForm() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [show2fa, setShow2fa] = useState(false);
    const [twoFactorToken, setTwoFactorToken] = useState("");

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true);
        setError(null);
        try {
            const result = await signIn('credentials', {
                redirect: false,
                email: values.email,
                password: values.password,
                twoFactorToken: twoFactorToken || undefined,
            });

            if (result?.error) {
                // NextAuth doesn't easily return custom objects from authorize.
                // We'll assume if there's an error but we haven't shown 2FA yet,
                // it might be a 2FA requirement. However, this is tricky.
                // A better way is to catch specific error messages or use axios first.
                setError('Invalid credentials or 2FA token.');
            } else {
                // If login was successful, check if we need 2FA (this is still tricky with next-auth)
                // Let's assume for now the process.env.BACKEND_URL call in authorize handles the logic
                // and we need a way to communicate "requires 2fa" back to the client.
                router.push('/dashboard');
                router.refresh();
            }
        } catch (err) {
            setError('An error occurred. Please try again later.');
        } finally {
            setLoading(false);
        }
    }

    // Since next-auth 'authorize' must return a user or null, 
    // it's easier to use a separate axios call for initial validation if we want a smooth 2FA flow.
    async function handleInitialSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3200'}/users/login`, {
                email: values.email,
                password: values.password,
            });

            if (response.data.requires2fa) {
                setShow2fa(true);
            } else {
                // Use next-auth to start session
                await signIn('credentials', {
                    email: values.email,
                    password: values.password,
                    callbackUrl: '/dashboard',
                });
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Invalid email or password.');
        } finally {
            setLoading(false);
        }
    }

    async function handle2faSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);
        const values = form.getValues();
        try {
            const result = await signIn('credentials', {
                redirect: false,
                email: values.email,
                password: values.password,
                twoFactorToken: twoFactorToken,
            });

            if (result?.error) {
                setError('Invalid 2FA token.');
            } else {
                router.push('/dashboard');
                router.refresh();
            }
        } catch (err) {
            setError('Verification failed.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <Card className="w-full max-w-md border-slate-700 shadow-xl overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-purple-500" />
            <CardHeader className="space-y-1 text-center pb-8">
                <CardTitle className="text-3xl font-extrabold tracking-tight">
                    {show2fa ? 'Verify Identity' : 'Welcome Back'}
                </CardTitle>
                <CardDescription className="text-sm">
                    {show2fa
                        ? 'Enter the 6-digit code from your authenticator app.'
                        : 'Enter your email and password to access your projects.'}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {!show2fa ? (
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleInitialSubmit)} className="space-y-5">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem className="space-y-1.5">
                                        <FormLabel className="text-xs font-bold uppercase text-slate-400">Email Address</FormLabel>
                                        <FormControl>
                                            <Input placeholder="name@example.com" {...field} className="bg-slate-900/50 border-slate-700 focus:ring-primary/20 h-11" />
                                        </FormControl>
                                        <FormMessage className="text-[10px]" />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem className="space-y-1.5">
                                        <FormLabel className="text-xs font-bold uppercase text-slate-400">Password</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="••••••••" {...field} className="bg-slate-900/50 border-slate-700 focus:ring-primary/20 h-11" />
                                        </FormControl>
                                        <FormMessage className="text-[10px]" />
                                    </FormItem>
                                )}
                            />
                            {error && (
                                <div className="text-xs font-semibold text-red-400 bg-red-400/10 p-3 rounded-lg border border-red-400/20 flex items-center gap-2">
                                    <div className="h-1.5 w-1.5 rounded-full bg-red-400" />
                                    {error}
                                </div>
                            )}
                            <Button type="submit" className="w-full h-11 font-bold text-base shadow-lg shadow-primary/20" disabled={loading}>
                                {loading ? 'Checking...' : 'Login Now'}
                            </Button>
                        </form>
                    </Form>
                ) : (
                    <form onSubmit={handle2faSubmit} className="space-y-6">
                        <div className="space-y-4 text-center">
                            <div className="flex justify-center">
                                <Shield className="h-12 w-12 text-primary animate-pulse" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="login-2fa-token" className="text-xs font-bold uppercase text-slate-400">6-Digit Code</Label>
                                <Input
                                    id="login-2fa-token"
                                    value={twoFactorToken}
                                    onChange={(e) => setTwoFactorToken(e.target.value)}
                                    className="h-14 text-center text-3xl font-mono tracking-[0.5em] bg-slate-900/50 border-slate-700 focus:ring-primary/20 max-w-[240px] mx-auto"
                                    placeholder="000000"
                                    maxLength={6}
                                    autoFocus
                                    required
                                />
                            </div>
                        </div>
                        {error && (
                            <div className="text-xs font-semibold text-red-400 bg-red-400/10 p-3 rounded-lg border border-red-400/20 flex items-center gap-2">
                                <div className="h-1.5 w-1.5 rounded-full bg-red-400" />
                                {error}
                            </div>
                        )}
                        <div className="flex gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShow2fa(false)}
                                className="flex-1 h-11 border-slate-700 hover:bg-slate-800"
                            >
                                Back
                            </Button>
                            <Button type="submit" className="flex-[2] h-11 font-bold text-base shadow-lg shadow-primary/20" disabled={loading || twoFactorToken.length !== 6}>
                                {loading ? 'Verifying...' : 'Verify & Log In'}
                            </Button>
                        </div>
                    </form>
                )}
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 text-center text-sm text-slate-400 pb-8">
                <div className="w-full h-px bg-slate-800" />
                {!show2fa && (
                    <div>
                        New to ProManage?{' '}
                        <Link href="/register" className="text-primary font-bold hover:text-primary/80 transition-colors">
                            Create an account
                        </Link>
                    </div>
                )}
            </CardFooter>
        </Card>
    );
}
