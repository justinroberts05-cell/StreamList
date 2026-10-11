function About() {
  return (
    <main className="page">
      <section className="about-container" aria-labelledby="about-heading">
        <p className="eyebrow">An EZTechMovie experience</p>
        <h1 id="about-heading">About StreamList</h1>
        <p className="about-intro">
          Spend less time keeping track and more time enjoying what you watch.
          StreamList brings your personal watchlist, movie discovery, and
          EZTechMovie offerings together in one place.
        </p>

        <section className="about-section" aria-labelledby="features-heading">
          <h2 id="features-heading">Make your next movie night easier</h2>
          <ul className="about-features">
            <li><strong>Organize your watchlist.</strong> Add movies or shows,
              edit titles, mark them watched, and remove entries you no longer need.</li>
            <li><strong>Discover movies.</strong> Search The Movie Database for
              movie descriptions, release dates, ratings, and available posters.</li>
            <li><strong>Explore EZTechMovie.</strong> Browse subscriptions and
              accessories, adjust accessory quantities, and review your cart total.</li>
          </ul>
        </section>

        <section className="about-section" aria-labelledby="access-heading">
          <h2 id="access-heading">Your list on this device</h2>
          <p>Your watchlist and cart are saved in this browser on this device.
            They remain available after a refresh, but are not synced between
            devices. Clearing browser storage removes these saved selections.</p>
          <p>StreamList supports desktop installation in compatible browsers.
            After an initial online visit finishes caching the app, its core
            interface is designed to load offline. New movie searches and
            online movie images require an internet connection.</p>
        </section>

        <section className="about-section" aria-labelledby="project-heading">
          <h2 id="project-heading">About this project</h2>
          <p>Created by Justin Roberts as an individual INT499 project for
            EZTechMovie, StreamList demonstrates a customer experience built
            with React and Progressive Web App support.</p>
          <p>The subscription and accessory catalog is a prototype. Adding an
            item to the cart does not process a payment or activate a subscription.</p>
        </section>

        <p className="about-credit">Movie information and posters are provided by
          {' '}<a href="https://www.themoviedb.org/">The Movie Database (TMDB)</a>.
          {' '}This product uses the TMDB API but is not endorsed or certified by TMDB.</p>
      </section>
    </main>
  );
}

export default About;
