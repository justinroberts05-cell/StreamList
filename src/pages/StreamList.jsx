import { useState } from "react";
import StreamForm from "../components/StreamForm";

function StreamList() {
  const [title, setTitle] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    if (title.trim() === "") {
      return;
    }

    console.log("Added to StreamList:", title);

    setTitle("");
  };

  return (
    <main className="page">
      <section className="hero">
        <p className="eyebrow">Your personal watch list</p>

        <h1>What do you want to watch next?</h1>

        <p className="description">
          Keep track of the movies and shows you do not want to miss.
        </p>

        <StreamForm
          title={title}
          onTitleChange={setTitle}
          onSubmit={handleSubmit}
        />
      </section>
    </main>
  );
}

export default StreamList;