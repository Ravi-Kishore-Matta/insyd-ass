import { useEffect, useRef, useState } from "react";
import axios from "axios";
import "./App.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function App() {
  const [userId, setUserId] = useState("alice");
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({
    type: "LIKE",
    sourceUserId: "bob",
    targetUserId: "alice",
    data: { postId: "post123", snippet: "Great work!" }
  });
  const polling = useRef(null);

  async function fetchNotifs(reset = false) {
    const res = await axios.get(`${API}/api/notifications`, {
      params: { userId, limit: 20 }
    });
    setItems(res.data.notifications || []);
  }

  async function createEvent() {
    await axios.post(`${API}/api/events`, form);
    setTimeout(fetchNotifs, 300);
  }

  useEffect(() => {
    fetchNotifs(true);
    if (polling.current) clearInterval(polling.current);
    polling.current = setInterval(fetchNotifs, 5000);
    return () => clearInterval(polling.current);
  }, [userId]);

  return (
    <div className="app-container">
      <h1>📣 Insyd Notifications — POC</h1>

      <section className="grid">
        {/* Simulate Event */}
        <div className="card">
          <h2>Simulate Event</h2>
          <label>
            Type:&nbsp;
            <select
              value={form.type}
              onChange={(e) =>
                setForm((f) => ({ ...f, type: e.target.value }))
              }
            >
              <option>LIKE</option>
              <option>COMMENT</option>
              <option>FOLLOW</option>
              <option>POST_CREATE</option>
              <option>MESSAGE</option>
            </select>
          </label>

          <div className="form-group">
            <input
              placeholder="sourceUserId"
              value={form.sourceUserId}
              onChange={(e) =>
                setForm((f) => ({ ...f, sourceUserId: e.target.value }))
              }
            />
            <input
              placeholder="targetUserId"
              value={form.targetUserId}
              onChange={(e) =>
                setForm((f) => ({ ...f, targetUserId: e.target.value }))
              }
            />
            <textarea
              placeholder='data JSON (e.g., {"postId":"p1","snippet":"Nice!"})'
              value={JSON.stringify(form.data)}
              onChange={(e) => {
                try {
                  const val = JSON.parse(e.target.value || "{}");
                  setForm((f) => ({ ...f, data: val }));
                } catch {}
              }}
              rows={4}
            />
          </div>

          <button className="btn primary" onClick={createEvent}>
            Create Event ➜ Notify
          </button>
        </div>

        {/* Notifications */}
        <div className="card">
          <h2>Notifications</h2>
          <div className="form-inline">
            <input
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="userId (e.g., alice)"
            />
            <button className="btn" onClick={() => fetchNotifs(true)}>
              Refresh
            </button>
          </div>

          <ul className="notif-list">
            {items.map((n) => (
              <li key={n._id} className="notif-item">
                <strong>{n.type}</strong> — {n.content?.title || ""}
                <div className="timestamp">
                  {new Date(n.createdAt).toLocaleString()}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <p className="tip">
        Tip: Run <code>npm run seed</code> in backend to create sample users
        (alice, bob, carol).
      </p>
    </div>
  );
}
