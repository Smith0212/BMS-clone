import Image from 'next/image';
import Link from 'next/link';
import { getMovieDetail, getMovieCredits, getMovieVideos, posterUrl, backdropUrl } from '@/lib/tmdb';
import { formatDuration, formatDate } from '@/utils/formatters';
import Showtimes from '@/components/Showtimes';

export const revalidate = 3600;

export default async function MovieDetailPage({ params }) {
    const { id } = await params;

    const [movie, credits, videosData] = await Promise.all([
        getMovieDetail(id),
        getMovieCredits(id),
        getMovieVideos(id),
    ]);

    if (!movie) {
        return <div className="text-center py-20 text-white">Movie not found</div>;
    }

    const cast = credits?.cast?.slice(0, 10) || [];
    const trailer = videosData?.results?.find(v => v.type === 'Trailer' && v.site === 'YouTube');

    return (
        <div className="w-full flex-1 bg-gray-950 pb-20">
            {/* Backdrop Header */}
            <div className="relative w-full h-[50vh] md:h-[60vh]">
                <div className="absolute inset-0">
                    <Image
                        src={backdropUrl(movie.backdrop_path)}
                        alt={movie.title}
                        fill
                        className="object-cover opacity-30"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-gray-950/50"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-950/80 to-transparent"></div>
                </div>

                <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center md:items-end pb-0 md:pb-12 pt-24 md:pt-0">
                    <div className="flex flex-col md:flex-row gap-8 items-start md:items-end">
                        <div className="w-32 md:w-56 flex-shrink-0 shadow-2xl rounded-xl overflow-hidden border border-gray-800 hidden md:block">
                            <Image
                                src={posterUrl(movie.poster_path, 'w500')}
                                alt={movie.title} width={300} height={450}
                                className="w-full h-auto"
                            />
                        </div>

                        <div className="flex flex-col max-w-3xl">
                            <h1 className="text-3xl md:text-5xl font-bold text-white mb-3">
                                {movie.title}
                            </h1>

                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300 font-medium mb-6">
                                <span className="flex items-center gap-1 bg-gray-800 px-3 py-1 rounded">
                                    <span className="text-yellow-500">⭐</span> {movie.vote_average?.toFixed(1)}
                                </span>
                                <span>{formatDuration(movie.runtime)}</span>
                                <span>•</span>
                                <span>{movie.genres?.map(g => g.name).join(', ')}</span>
                                <span>•</span>
                                <span>{formatDate(movie.release_date, 'MMM d, yyyy')}</span>
                                <span className="uppercase border border-gray-600 px-2 rounded text-xs leading-5">
                                    {movie.original_language}
                                </span>
                            </div>

                            <Link
                                href={`/movies/${id}/book`}
                                className="w-full md:w-48 text-center rounded-lg bg-primary-500 py-3 text-sm font-semibold text-white shadow-lg hover:bg-primary-600 transition-colors"
                            >
                                Book Tickets
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-12">
                {/* Left Column */}
                <div className="space-y-12">
                    {/* Synopsis */}
                    <section>
                        <h2 className="text-xl font-bold text-white mb-4">About the Movie</h2>
                        <p className="text-gray-300 leading-relaxed text-sm md:text-base">
                            {movie.overview}
                        </p>
                    </section>

                    {/* Cast */}
                    <section>
                        <h2 className="text-xl font-bold text-white mb-4">Cast</h2>
                        <div className="flex overflow-x-auto gap-4 pb-4 hide-scrollbar">
                            {cast.map(person => (
                                <div key={person.id} className="flex-shrink-0 w-24 md:w-28 text-center">
                                    <div className="w-24 h-24 md:w-28 md:h-28 mx-auto relative rounded-full overflow-hidden bg-gray-800 mb-2 border-2 border-transparent hover:border-primary-500 transition-all">
                                        <Image
                                            src={posterUrl(person.profile_path, 'w185')}
                                            alt={person.name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <h4 className="text-sm font-medium text-white truncate">{person.name}</h4>
                                    <p className="text-xs text-gray-400 truncate">{person.character}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Right Column - Trailer */}
                <div className="space-y-6">
                    {trailer && (
                        <section className="bg-gray-900 rounded-2xl overflow-hidden border border-gray-800">
                            <div className="aspect-video w-full">
                                <iframe
                                    width="100%"
                                    height="100%"
                                    src={`https://www.youtube.com/embed/${trailer.key}?rel=0`}
                                    title="YouTube video player"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            </div>
                        </section>
                    )}
                </div>
            </div>

            {/* Showtimes Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 pt-10 border-t border-gray-800">
                <Showtimes
                    movieId={id}
                    movieTitle={movie.title}
                    posterPath={movie.poster_path}
                />
            </div>
        </div>
    );
}
