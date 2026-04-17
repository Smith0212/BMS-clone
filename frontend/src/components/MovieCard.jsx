import Image from 'next/image';
import Link from 'next/link';
import { posterUrl } from '@/lib/tmdb';

export default function MovieCard({ movie, genres = [] }) {
    // Try to map genre IDs to names if possible, else just show count or top 1
    return (
        <div className="flex-shrink-0 w-40 sm:w-48 lg:w-56 overflow-hidden rounded-xl bg-gray-900 border border-gray-800 transition-transform hover:scale-105 group relative flex flex-col justify-between">
            <Link href={`/movies/${movie.id}`}>
                <div className="relative aspect-[2/3] w-full">
                    <Image
                        src={posterUrl(movie.poster_path, 'w500')}
                        alt={movie.title}
                        fill
                        className="object-cover"
                    />
                    <div className="absolute top-2 right-2 flex items-center gap-1 rounded bg-black/60 px-2 py-1 text-xs font-medium backdrop-blur">
                        <span className="text-yellow-500">⭐</span>
                        {movie.vote_average?.toFixed(1) || '0.0'}
                    </div>
                </div>
                <div className="p-3">
                    <h3 className="truncate text-sm font-semibold text-white group-hover:text-primary-500 transition-colors">
                        {movie.title}
                    </h3>
                    <p className="mt-1 text-xs text-gray-400 truncate">
                        {new Date(movie.release_date).getFullYear()}
                    </p>
                </div>
            </Link>
            <div className="p-3 pt-0 mt-auto">
                <Link
                    href={`/movies/${movie.id}/book`}
                    className="block w-full text-center rounded bg-gray-800 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-primary-500 hover:text-white"
                >
                    Book Now
                </Link>
            </div>
        </div>
    );
}
