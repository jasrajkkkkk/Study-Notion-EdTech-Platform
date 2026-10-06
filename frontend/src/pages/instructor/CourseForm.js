import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";

const empty = { title: "", description: "", tags: "", price: 0 };

export default function CourseForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(empty);
  const [lessons, setLessons] = useState([]);
  const [newLesson, setNewLesson] = useState({ title: "", content: "", video_url: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    if (isEdit) {
      api.get(`/courses/${id}/`).then((res) => {
        setForm(res.data);
        setLessons(res.data.lessons || []);
      });
    }
  }, [id, isEdit]);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (isEdit) {
        await api.patch(`/courses/${id}/`, form);
        navigate("/instructor");
      } else {
        const res = await api.post("/courses/", form);
        navigate(`/instructor/courses/${res.data.id}`);
      }
    } catch (err) {
      setError(JSON.stringify(err.response?.data || "Save failed."));
    }
  };

  const addLesson = async () => {
    if (!newLesson.title) return;
    const res = await api.post(`/courses/${id}/lessons/`, { ...newLesson, order: lessons.length });
    setLessons([...lessons, res.data]);
    setNewLesson({ title: "", content: "", video_url: "" });
  };

  const removeLesson = async (lessonId) => {
    await api.delete(`/courses/${id}/lessons/${lessonId}/`);
    setLessons(lessons.filter((l) => l.id !== lessonId));
  };

  return (
    <div className="container" style={{ maxWidth: 600 }}>
      <h2>{isEdit ? "Edit course" : "New course"}</h2>
      <form className="form-stack" onSubmit={handleSubmit}>
        <input placeholder="Title" value={form.title} onChange={update("title")} required />
        <textarea placeholder="Description" rows={4} value={form.description} onChange={update("description")} />
        <input placeholder="Tags (comma-separated, e.g. python, backend, api)" value={form.tags} onChange={update("tags")} />
        <input type="number" step="0.01" placeholder="Price (0 = free)" value={form.price} onChange={update("price")} />
        {error && <span className="error-text">{error}</span>}
        <button className="btn-primary" type="submit">{isEdit ? "Save changes" : "Create course"}</button>
      </form>

      {isEdit && (
        <div style={{ marginTop: 32 }}>
          <h3>Lessons</h3>
          {lessons.map((l) => (
            <div key={l.id} className="card" style={{ marginBottom: 8, display: "flex", justifyContent: "space-between" }}>
              <span>{l.order + 1}. {l.title}</span>
              <button className="btn-danger" onClick={() => removeLesson(l.id)}>Remove</button>
            </div>
          ))}

          <div className="card" style={{ marginTop: 12 }}>
            <strong>Add a lesson</strong>
            <div className="form-stack" style={{ marginTop: 8 }}>
              <input placeholder="Lesson title" value={newLesson.title}
                onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })} />
              <textarea placeholder="Content / notes" rows={2} value={newLesson.content}
                onChange={(e) => setNewLesson({ ...newLesson, content: e.target.value })} />
              <input placeholder="Video URL (optional)" value={newLesson.video_url}
                onChange={(e) => setNewLesson({ ...newLesson, video_url: e.target.value })} />
              <button className="btn-secondary" onClick={addLesson}>+ Add lesson</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
