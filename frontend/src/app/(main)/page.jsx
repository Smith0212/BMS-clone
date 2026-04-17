import { getTrending, getNowPlaying, getUpcoming, getTopRated } from '@/lib/tmdb';
import HeroSlider from '@/components/HeroSlider';
import MovieCarousel from '@/components/MovieCarousel';

export const revalidate = 3600; // revalidate at most every hour

export default async function HomePage() {
    const [trendingData, nowPlayingData, upcomingData, topRatedData] = await Promise.all([
        getTrending(),
        getNowPlaying(),
        getUpcoming(),
        getTopRated()
    ]);

    const trending = trendingData?.results?.slice(0, 5) || [];
    const nowPlaying = nowPlayingData?.results || [];
    const upcoming = upcomingData?.results || [];
    const topRated = topRatedData?.results || [];

    return (
        <div className="w-full relative">
            <HeroSlider movies={trending} />

            <div className="mt-8 space-y-10">
                <MovieCarousel title="Now Playing" movies={nowPlaying} />
                <MovieCarousel title="Upcoming Releases" movies={upcoming} />
                <MovieCarousel title="Top Rated Movies" movies={topRated} />
            </div>
        </div>
    );
}
