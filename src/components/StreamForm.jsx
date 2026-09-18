function StreamForm({ title, onTitleChange, onSubmit }) {
  return (
    <form className="stream-form" onSubmit={onSubmit}>
      <label className="sr-only" htmlFor="stream-title">Movie or show title</label>
      <input
        id="stream-title"
        type="text"
        value={title}
        onChange={(event) => onTitleChange(event.target.value)}
        placeholder="Enter a movie or show..."
        maxLength={200}
        required
      />
      <button type="submit" disabled={!title.trim()}>
        <span className="material-symbols-outlined" aria-hidden="true">add</span>
        Add to StreamList
      </button>
    </form>
  );
}

export default StreamForm;
