const BASE_URL = process.env.NEXT_PUBLIC_TMDB_BASE_URL || 'https://api.themoviedb.org/3';
const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;

const fetchFromTMDB = async (endpoint, params = {}) => {
    const url = new URL(`${BASE_URL}${endpoint}`);
    url.searchParams.append('api_key', API_KEY);
    url.searchParams.append('language', 'en-US');

    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

    try {
        const res = await fetch(url.toString(), {
            next: { revalidate: 3600 }
        });
        if (!res.ok) throw new Error('Failed to fetch from TMDB');
        return res.json();
    } catch (error) {
        console.error(`TMDB API Error: ${endpoint}`, error);
        return null;
    }
};

export const getNowPlaying = () => fetchFromTMDB('/movie/now_playing');
export const getUpcoming = () => fetchFromTMDB('/movie/upcoming');
export const getTrending = () => fetchFromTMDB('/trending/movie/day');
export const getTopRated = () => fetchFromTMDB('/movie/top_rated');
export const getMovieDetail = (id) => fetchFromTMDB(`/movie/${id}`);
export const getMovieCredits = (id) => fetchFromTMDB(`/movie/${id}/credits`);
export const getMovieVideos = (id) => fetchFromTMDB(`/movie/${id}/videos`);
export const getSimilar = (id) => fetchFromTMDB(`/movie/${id}/similar`);
export const getGenres = () => fetchFromTMDB('/genre/movie/list');
export const getDiscoverMovies = (genreId) => fetchFromTMDB('/discover/movie', { with_genres: genreId });
export const searchMovies = (query) => fetchFromTMDB('/search/movie', { query, include_adult: false });

const IMAGE_BASE = process.env.NEXT_PUBLIC_TMDB_IMAGE_BASE || 'https://image.tmdb.org/t/p';

export const posterUrl = (path, size = 'w500') => {
    if (!path) return '/placeholder-poster.png';
    return `${IMAGE_BASE}/${size}${path}`;
};

export const backdropUrl = (path, size = 'original') => {
    if (!path) return '/placeholder-backdrop.png';
    return `${IMAGE_BASE}/${size}${path}`;
};
