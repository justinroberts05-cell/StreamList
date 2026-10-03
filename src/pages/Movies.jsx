import { useEffect, useRef, useState } from "react";

function Movies() {
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const requestRef = useRef(null);

  useEffect(() => () => requestRef.current?.abort(), []);

  const token = import.meta.env.VITE_TMDB_TOKEN;

  const searchMovies = async (event) => {
    event.preventDefault();

    if (query.trim() === "") {
      return;
    }

    requestRef.current?.abort();
    const controller = new AbortController();
    requestRef.current = controller;
    setError("");
    setMovies([]);
    setSearched(false);
    if (!token) {
      setLoading(false);
      setError("Movie search is not configured. Please check the TMDB token.");
      return;
    }
    setLoading(true);

    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(
          query.trim()
        )}&include_adult=false&language=en-US&page=1`,
        {
          signal: controller.signal,
          headers: {
            Authorization: `Bearer ${token}`,
            accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Unable to retrieve movies from TMDB.");
      }

      const data = await response.json();
      if (!Array.isArray(data.results)) throw new Error("Invalid movie response.");
      if (controller.signal.aborted) return;
      setMovies(data.results);
      setSearched(true);
    } catch (err) {
      if (controller.signal.aborted) return;
      setError(err instanceof TypeError
        ? "Unable to connect to TMDB. Check your connection and try again."
        : "Unable to retrieve movies from TMDB. Please try again.");
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  };

  return (
    <main className="page movies-page">
      <section className="movies-container">
        <h1>Search Movies</h1>

        <p className="description">
          Search for movie information using The Movie Database.
        </p>

        <form className="movie-search-form" onSubmit={searchMovies}>
          <label className="sr-only" htmlFor="movie-query">Movie title</label>
          <input
            id="movie-query"
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Enter a movie title..."
          />

          <button type="submit" disabled={!query.trim()}>Search</button>
        </form>

        {error && <p className="error-message" role="alert">{error}</p>}
        <p role="status">
          {loading ? "Searching movies…" : searched ? (movies.length ? `${movies.length} movies found.` : "No movies found. Try another title.") : ""}
        </p>

        <div className="movie-grid" aria-busy={loading}>
          {movies.map((movie) => (
            <article className="movie-card" key={movie.id}>
              {movie.poster_path ? (
                <img
                  src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                  loading="lazy"
                  alt={`${movie.title} poster`}
                />
              ) : (
                <div className="no-poster">No Poster Available</div>
              )}

              <div className="movie-info">
                <h2>{movie.title}</h2>

                <p>
                  Release Date:{" "}
                  {movie.release_date ? movie.release_date : "Unknown"}
                </p>

                <p>
                  Rating:{" "}
                  {typeof movie.vote_average === "number" && movie.vote_average > 0
                    ? movie.vote_average.toFixed(1)
                    : "Not Rated"}
                </p>

                <p>{movie.overview || "No overview available."}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

export default Movies;