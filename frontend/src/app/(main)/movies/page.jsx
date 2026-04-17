import { getNowPlaying, getGenres, getDiscoverMovies } from '@/lib/tmdb';
import MovieCard from '@/components/MovieCard';
import Link from 'next/link';

export const revalidate = 3600;

export default async function BrowseMoviesPage({ searchParams }) {
    const params = await searchParams;
    const activeGenre = params?.genre || null;

    const [moviesData, genresData] = await Promise.all([
        activeGenre ? getDiscoverMovies(activeGenre) : getNowPlaying(),
        getGenres()
    ]);

    const movies = moviesData?.results || [];
    const genres = genresData?.genres || [];

    return (
        <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
            <h1 className="text-3xl font-bold mb-6 text-white text-center md:text-left">Browse Movies</h1>

            {/* Genre Pills Overlay */}
            {genres.length > 0 && (
                <div className="flex gap-3 overflow-x-auto pb-4 mb-8 hide-scroll hide-scrollbar items-center">
                    <Link
                        href="/movies"
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${!activeGenre ? 'bg-primary-500 text-white' : 'bg-gray-800 hover:bg-gray-700'}`}
                    >
                        All
                    </Link>
                    {genres.map(genre => (
                        <Link
                            key={genre.id}
                            href={`/movies?genre=${genre.id}`}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${activeGenre === String(genre.id) ? 'bg-primary-500 text-white' : 'bg-gray-800 hover:bg-gray-700'}`}
                        >
                            {genre.name}
                        </Link>
                    ))}
                </div>
            )}

            {/* Grid */}
            <div className="grid grid-cols-2 min-[500px]:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 justify-items-center">
                {movies.map(movie => (
                    <MovieCard key={movie.id} movie={movie} />
                ))}
            </div>
        </div>
    );
}
