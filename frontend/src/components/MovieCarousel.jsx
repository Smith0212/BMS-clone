import MovieCard from './MovieCard';

export default function MovieCarousel({ title, movies }) {
    if (!movies || movies.length === 0) return null;

    return (
        <div className="py-6 w-full overflow-hidden">
            <div className="flex items-center justify-between mb-4 px-4 sm:px-6 lg:px-8">
                <h2 className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                    {title}
                </h2>
                <button className="text-sm font-medium text-primary-500 hover:text-primary-400">See All &rarr;</button>
            </div>

            {/* Scrollable Container */}
            <div className="flex gap-4 overflow-x-auto pb-4 pt-2 px-4 sm:px-6 lg:px-8 snap-x snap-mandatory hide-scroll">
                {movies.map((movie) => (
                    <div key={movie.id} className="snap-start snap-always">
                        <MovieCard movie={movie} />
                    </div>
                ))}
            </div>
        </div>
    );
}
