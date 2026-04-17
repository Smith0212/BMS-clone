'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import Image from 'next/image';
import useBookingStore from '@/store/useBookingStore';
import { bmsApi } from '@/lib/bmsApi';
import { posterUrl } from '@/lib/tmdb';

const cardSchema = z.object({
    cardNumber: z.string().min(19, 'Card must be 16 digits').max(19),
    cardHolder: z.string().min(3, 'Name must be at least 3 characters'),
    expiry: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Invalid MM/YY format'),
    cvv: z.string().length(3, 'CVV must be 3 digits'),
});

const CONVENIENCE_FEE = 30;

export default function PaymentPage() {
    const router = useRouter();
    const { data: session } = useSession();
    const { selectedSeats, showInfo, totalAmount } = useBookingStore();
    const [activeTab, setActiveTab] = useState('Card');
    const [isProcessing, setIsProcessing] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;
        if (!showInfo || selectedSeats.length === 0) router.replace('/');
    }, [showInfo, selectedSeats, router, mounted]);

    const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({
        resolver: zodResolver(cardSchema),
    });

    const cardNumber = watch('cardNumber', '');
    useEffect(() => {
        const formatted = cardNumber.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();
        if (formatted !== cardNumber) setValue('cardNumber', formatted);
    }, [cardNumber, setValue]);

    if (!mounted || !showInfo) return null;

    const convenienceFee = selectedSeats.length * CONVENIENCE_FEE;
    const grandTotal = totalAmount + convenienceFee;

    const handlePayment = async () => {
        if (!session?.user?.backendToken) {
            toast.error('Session expired — please sign in again');
            router.push('/login');
            return;
        }

        setIsProcessing(true);
        const token = session.user.backendToken;
        const seatIds = selectedSeats.map((s) => s.id);

        try {
            // 1 — Initiate payment (creates a pending record)
            const initRes = await bmsApi.initiatePayment(
                {
                    showtime_id: showInfo.showtimeId,
                    seat_ids: seatIds,
                    payment_method: activeTab.toLowerCase().replace(' ', '_'),
                    amount: grandTotal,
                },
                token
            );
            if (initRes.code !== 1) throw new Error(initRes.message || 'Payment initiation failed');

            const paymentId = initRes.data.id;

            // 2 — Process payment (dummy — always succeeds)
            const procRes = await bmsApi.processPayment(
                {
                    payment_id: paymentId,
                    payment_meta: { method: activeTab, gateway: 'dummy' },
                    should_fail: false,
                },
                token
            );
            if (procRes.code !== 1) throw new Error('Payment processing failed');

            // 3 — Confirm booking
            const confRes = await bmsApi.confirmBooking(
                {
                    showtime_id: showInfo.showtimeId,
                    seat_ids: seatIds,
                    payment_id: paymentId,
                },
                token
            );
            if (confRes.code !== 1) throw new Error(confRes.message || 'Booking confirmation failed');

            toast.success('Payment Successful!');
            router.push(`/booking/confirmation?id=${confRes.data.booking_id}`);
        } catch (err) {
            toast.error(err.message || 'Payment failed — please try again');
            setIsProcessing(false);
        }
    };

    const onSubmitCard = () => handlePayment();

    return (
        <div className="min-h-screen bg-gray-950 pt-8 pb-20">
            <div className="max-w-6xl mx-auto px-4 flex flex-col lg:flex-row gap-8">

                {/* Payment form */}
                <div className="flex-1 bg-gray-900 border border-gray-800 rounded-xl p-6">
                    <h2 className="text-2xl font-bold text-white mb-6">Payment Options</h2>

                    {/* Tabs */}
                    <div className="flex bg-gray-800 p-1 rounded-lg mb-8 overflow-x-auto hide-scrollbar">
                        {['Card', 'UPI', 'Net Banking', 'Wallet'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`flex-1 min-w-[90px] text-sm font-medium py-2 px-3 rounded-md transition-colors ${activeTab === tab
                                        ? 'bg-primary-500 text-white shadow-md'
                                        : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    <div className="min-h-[300px]">
                        {activeTab === 'Card' && (
                            <form onSubmit={handleSubmit(onSubmitCard)} className="space-y-5">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Card Number</label>
                                    <input
                                        type="text"
                                        maxLength={19}
                                        {...register('cardNumber')}
                                        placeholder="4111 1111 1111 1111"
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary-500"
                                    />
                                    {errors.cardNumber && <p className="text-primary-500 text-xs mt-1">{errors.cardNumber.message}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Card Holder Name</label>
                                    <input
                                        type="text"
                                        {...register('cardHolder')}
                                        placeholder="John Doe"
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary-500"
                                    />
                                    {errors.cardHolder && <p className="text-primary-500 text-xs mt-1">{errors.cardHolder.message}</p>}
                                </div>

                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <label className="block text-sm text-gray-400 mb-1">Expiry</label>
                                        <input
                                            type="text"
                                            {...register('expiry')}
                                            placeholder="MM/YY"
                                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary-500"
                                        />
                                        {errors.expiry && <p className="text-primary-500 text-xs mt-1">{errors.expiry.message}</p>}
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-sm text-gray-400 mb-1">CVV</label>
                                        <input
                                            type="password"
                                            maxLength={3}
                                            {...register('cvv')}
                                            placeholder="•••"
                                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary-500"
                                        />
                                        {errors.cvv && <p className="text-primary-500 text-xs mt-1">{errors.cvv.message}</p>}
                                    </div>
                                </div>

                                <p className="text-xs text-gray-500">Demo: use any valid-looking card details (e.g. 4111 1111 1111 1111)</p>

                                <button
                                    type="submit"
                                    disabled={isProcessing}
                                    className="w-full py-4 mt-4 bg-primary-500 hover:bg-primary-600 rounded-lg text-white font-bold transition-all disabled:opacity-75 disabled:cursor-wait flex justify-center items-center gap-2 shadow-[0_0_15px_rgba(229,9,20,0.3)]"
                                >
                                    {isProcessing
                                        ? <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                                        : `Pay ₹${grandTotal}`}
                                </button>
                            </form>
                        )}

                        {activeTab === 'UPI' && (
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Enter UPI ID</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="username@upi"
                                            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary-500"
                                        />
                                        <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                                            Verify
                                        </button>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500">Demo: any UPI ID works</p>
                                <button
                                    onClick={handlePayment}
                                    disabled={isProcessing}
                                    className="w-full py-4 bg-primary-500 hover:bg-primary-600 rounded-lg text-white font-bold transition-all disabled:opacity-75"
                                >
                                    {isProcessing ? 'Processing…' : `Pay ₹${grandTotal}`}
                                </button>
                            </div>
                        )}

                        {(activeTab === 'Net Banking' || activeTab === 'Wallet') && (
                            <div className="flex flex-col items-center justify-center py-16 gap-4 text-gray-400">
                                <p>Demo mode — click below to complete payment</p>
                                <button
                                    onClick={handlePayment}
                                    disabled={isProcessing}
                                    className="px-8 py-3 bg-primary-500 hover:bg-primary-600 rounded-lg text-white font-bold transition-all disabled:opacity-75"
                                >
                                    {isProcessing ? 'Processing…' : `Pay ₹${grandTotal}`}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Booking summary */}
                <div className="w-full lg:w-[400px]">
                    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden sticky top-24 shadow-2xl">
                        <div className="p-6">
                            <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider border-b border-gray-800 pb-2">
                                Booking Summary
                            </h3>

                            <div className="flex gap-4 items-start pb-6 border-b border-gray-800 mb-6">
                                {showInfo.posterPath && (
                                    <div className="w-20 rounded bg-gray-800 flex-shrink-0 overflow-hidden relative aspect-[2/3]">
                                        <Image
                                            src={posterUrl(showInfo.posterPath, 'w185')}
                                            alt="Movie"
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                )}
                                <div>
                                    <h4 className="font-bold text-lg leading-tight mb-1">{showInfo.movieTitle}</h4>
                                    <p className="text-sm text-gray-400">{showInfo.theater}</p>
                                    <p className="text-sm text-primary-500 mt-2 font-medium">
                                        {showInfo.displayDate} · {showInfo.time}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between text-gray-300">
                                    <span>Format</span>
                                    <span className="font-semibold text-white">{showInfo.format}</span>
                                </div>
                                <div className="flex justify-between text-gray-300 items-start">
                                    <span>Seats ({selectedSeats.length})</span>
                                    <span className="font-semibold text-white text-right break-words max-w-[60%]">
                                        {selectedSeats.map((s) => s.label).join(', ')}
                                    </span>
                                </div>
                                <div className="flex justify-between text-gray-300 pt-3 border-t border-gray-800">
                                    <span>Tickets</span>
                                    <span className="font-semibold text-white">₹{totalAmount}</span>
                                </div>
                                <div className="flex justify-between text-gray-300">
                                    <span>Convenience Fee</span>
                                    <span className="font-semibold text-white">₹{convenienceFee}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-primary-500/10 p-6 border-t border-primary-500/20">
                            <div className="flex justify-between items-center text-lg font-bold text-white">
                                <span>Amount Payable</span>
                                <span className="text-primary-500 text-2xl">₹{grandTotal}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
