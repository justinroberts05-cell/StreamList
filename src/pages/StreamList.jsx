import { useState } from "react";
import StreamForm from "../components/StreamForm";

function StreamList({ items, setItems }) {
  const [title, setTitle] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!title.trim()) return;
    setItems((current) => [
      ...current,
      { id: crypto.randomUUID(), title: title.trim(), completed: false },
    ]);
    setTitle("");
    setMessage("Added to your StreamList.");
  };

  const saveEdit = (event, id) => {
    event.preventDefault();
    if (!editText.trim()) return;
    setItems((current) => current.map((item) =>
      item.id === id ? { ...item, title: editText.trim() } : item
    ));
    setEditingId(null);
    setMessage("Title updated.");
  };

  const toggleComplete = (id) => {
    setItems((current) => current.map((item) =>
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
    setMessage("Completion status updated.");
  };

  const deleteItem = (id) => {
    setItems((current) => current.filter((item) => item.id !== id));
    if (editingId === id) setEditingId(null);
    setMessage("Item deleted.");
  };

  return (
    <main className="page">
      <section className="hero">
        <p className="eyebrow">Your personal watch list</p>
        <h1>What do you want to watch next?</h1>
        <p className="description">
          Keep track of the movies and shows you do not want to miss.
        </p>
        <StreamForm title={title} onTitleChange={setTitle} onSubmit={handleSubmit} />
        <p className="status-message" role="status">{message}</p>
        <section className="watch-list" aria-labelledby="list-heading">
          <h2 id="list-heading">Your StreamList</h2>
          <p className="list-summary">
            {items.length} total · {items.filter((item) => item.completed).length} complete
          </p>
          {items.length === 0 ? (
            <p className="empty-list">Your list is ready. Add a movie or show above to get started.</p>
          ) : (
            <ul className="stream-items">
              {items.map((item) => (
                <li key={item.id} className={item.completed ? "stream-item completed" : "stream-item"}>
                  {editingId === item.id ? (
                    <form className="edit-form" onSubmit={(event) => saveEdit(event, item.id)}>
                      <label className="sr-only" htmlFor={`edit-${item.id}`}>Edit title</label>
                      <input id={`edit-${item.id}`} autoFocus value={editText}
                        onChange={(event) => setEditText(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Escape") setEditingId(null);
                        }} maxLength={200} required />
                      <button type="submit" disabled={!editText.trim()}>
                        <span className="material-symbols-outlined" aria-hidden="true">save</span>Save
                      </button>
                      <button type="button" onClick={() => setEditingId(null)}>Cancel</button>
                    </form>
                  ) : (
                    <>
                      <span className="item-title">{item.title}</span>
                      <div className="item-actions">
                        <button type="button" aria-pressed={item.completed}
                          aria-label={`${item.completed ? "Mark incomplete" : "Mark complete"}: ${item.title}`}
                          onClick={() => toggleComplete(item.id)}>
                          <span className="material-symbols-outlined" aria-hidden="true">
                            {item.completed ? "check_circle" : "radio_button_unchecked"}
                          </span>{item.completed ? "Completed" : "Complete"}
                        </button>
                        <button type="button" aria-label={`Edit ${item.title}`}
                          onClick={() => { setEditingId(item.id); setEditText(item.title); }}>
                          <span className="material-symbols-outlined" aria-hidden="true">edit</span>Edit
                        </button>
                        <button type="button" className="delete-button" aria-label={`Delete ${item.title}`}
                          onClick={() => deleteItem(item.id)}>
                          <span className="material-symbols-outlined" aria-hidden="true">delete</span>Delete
                        </button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
          <p className="list-note">Your list stays while navigating. Refreshing the page starts a new list.</p>
        </section>
      </section>
    </main>
  );
}

export default StreamList;
