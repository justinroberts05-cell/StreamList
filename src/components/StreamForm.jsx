function StreamForm({ title, onTitleChange, onSubmit }) {
  return (
    <form className="stream-form" onSubmit={onSubmit}>
      <input
        type="text"
        value={title}
        onChange={(event) => onTitleChange(event.target.value)}
        placeholder="Enter a movie or show..."
      />

      <button type="submit">Add to StreamList</button>
    </form>
  );
}

export default StreamForm;