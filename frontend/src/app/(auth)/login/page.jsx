'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    remember: z.boolean().optional()
});

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl') || '/';
    const [loading, setLoading] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(loginSchema),
        defaultValues: { remember: false }
    });

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            const res = await signIn('credentials', {
                redirect: false,
                email: data.email,
                password: data.password
            });

            if (res?.error) {
                toast.error("Invalid email or password");
            } else {
                toast.success("Logged in successfully!");
                router.push(callbackUrl);
                router.refresh();
            }
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen w-full items-center justify-center bg-gray-950 px-4">
            <div className="w-full max-w-md rounded-xl bg-gray-900 border border-gray-800 p-8 shadow-2xl">
                <h2 className="mb-6 text-center text-3xl font-bold text-white">Sign In</h2>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                        <input
                            type="email"
                            {...register('email')}
                            className="w-full rounded-md border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                            placeholder="name@example.com"
                        />
                        {errors.email && <p className="mt-1 text-sm text-primary-500">{errors.email.message}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
                        <input
                            type="password"
                            {...register('password')}
                            className="w-full rounded-md border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                            placeholder="••••••••"
                        />
                        {errors.password && <p className="mt-1 text-sm text-primary-500">{errors.password.message}</p>}
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input
                                id="remember"
                                type="checkbox"
                                {...register('remember')}
                                className="h-4 w-4 rounded border-gray-700 bg-gray-800 text-primary-500 focus:ring-primary-500 focus:ring-offset-gray-900"
                            />
                            <label htmlFor="remember" className="ml-2 block text-sm text-gray-400">Remember me</label>
                        </div>
                        <div className="text-sm">
                            <a href="#" className="font-medium text-primary-500 hover:text-primary-400">Forgot password?</a>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center rounded-md border border-transparent bg-primary-500 py-3 px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50"
                    >
                        {loading ? "Signing in..." : "Sign in"}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-gray-400">
                    Not registered yet?{' '}
                    <Link href="/register" className="font-medium text-primary-500 hover:text-primary-400">
                        Create an account
                    </Link>
                </p>
            </div>
        </div>
    );
}
