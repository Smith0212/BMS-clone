'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

const registerSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

export default function RegisterPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(registerSchema)
    });

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            // Dummy registration: Just simulate delay and push to users array locally (using api)
            // Since it's a dummy app, we can just hit an api endpoint if we had one or just redirect and toast
            await new Promise(res => setTimeout(res, 1000));

            toast.success("Registration successful! Please login.");
            router.push('/login');
        } catch (error) {
            toast.error("Registration failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-gray-950 px-4 py-12">
            <div className="w-full max-w-md rounded-xl bg-gray-900 border border-gray-800 p-8 shadow-2xl">
                <h2 className="mb-6 text-center text-3xl font-bold text-white">Create Account</h2>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Full Name</label>
                        <input
                            type="text"
                            {...register('name')}
                            className="w-full rounded-md border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                            placeholder="John Doe"
                        />
                        {errors.name && <p className="mt-1 text-sm text-primary-500">{errors.name.message}</p>}
                    </div>

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

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Confirm Password</label>
                        <input
                            type="password"
                            {...register('confirmPassword')}
                            className="w-full rounded-md border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                            placeholder="••••••••"
                        />
                        {errors.confirmPassword && <p className="mt-1 text-sm text-primary-500">{errors.confirmPassword.message}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center rounded-md border border-transparent bg-primary-500 py-3 px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50"
                    >
                        {loading ? "Creating Account..." : "Register"}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-gray-400">
                    Already have an account?{' '}
                    <Link href="/login" className="font-medium text-primary-500 hover:text-primary-400">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}
