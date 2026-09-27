import { useState } from "react";

function Movies() {
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [error, setError] = useState("");

  const token = import.meta.env.VITE_TMDB_TOKEN;

  const searchMovies = async (event) => {
    event.preventDefault();

    if (query.trim() === "") {
      return;
    }

    setError("");

    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(
          query
        )}&include_adult=false&language=en-US&page=1`,
        {
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
      setMovies(data.results);
    } catch (err) {
      console.error(err);
      setError("Something went wrong while searching for movies.");
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
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Enter a movie title..."
          />

          <button type="submit">Search</button>
        </form>

        {error && <p className="error-message">{error}</p>}

        <div className="movie-grid">
          {movies.map((movie) => (
            <article className="movie-card" key={movie.id}>
              {movie.poster_path ? (
                <img
                  src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
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
                  {movie.vote_average
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