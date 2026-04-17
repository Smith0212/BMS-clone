'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { backdropUrl } from '@/lib/tmdb';

export default function HeroSlider({ movies }) {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (!movies || movies.length === 0) return;
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % movies.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [movies]);

    if (!movies || movies.length === 0) return <div className="h-[50vh] bg-gray-900 animate-pulse w-full"></div>;

    const currentMovie = movies[currentIndex];

    return (
        <div className="relative w-full h-[50vh] md:h-[70vh] overflow-hidden bg-gray-950">
            <AnimatePresence mode="popLayout">
                <motion.div
                    key={currentMovie.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1 }}
                    className="absolute inset-0"
                >
                    <div className="absolute inset-0 z-0">
                        <Image
                            src={backdropUrl(currentMovie.backdrop_path)}
                            alt={currentMovie.title}
                            fill
                            className="object-cover"
                            priority
                        />
                        {/* Gradient Overlays */}
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/60 to-transparent"></div>
                        <div className="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-950/80 to-transparent"></div>
                    </div>

                    <div className="relative z-10 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-start pt-20 md:pt-0">
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="max-w-xl"
                        >
                            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 line-clamp-2">
                                {currentMovie.title}
                            </h1>
                            <p className="text-gray-300 text-sm md:text-base mb-8 line-clamp-3">
                                {currentMovie.overview}
                            </p>
                            <Link
                                href={`/movies/${currentMovie.id}/book`}
                                className="px-8 py-3 rounded-lg bg-primary-500 text-white font-semibold hover:bg-primary-600 transition-colors shadow-[0_4px_20px_rgba(229,9,20,0.4)]"
                            >
                                Book Now
                            </Link>
                        </motion.div>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
