import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

export default function InstructorDashboard() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    api.get("/courses/").then((res) => {
      const all = res.data.results || res.data;
      setCourses(all.filter((c) => c.instructor === user.id));
      setLoading(false);
    });
  };

  useEffect(load, [user.id]);

  const togglePublish = async (course) => {
    await api.patch(`/courses/${course.id}/`, { is_published: !course.is_published });
    load();
  };

  const remove = async (course) => {
    if (!window.confirm(`Delete "${course.title}"?`)) return;
    await api.delete(`/courses/${course.id}/`);
    load();
  };

  if (loading) return <div className="container">Loading…</div>;

  return (
    <div className="container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Your courses</h2>
        <Link to="/instructor/courses/new"><button className="btn-primary">+ New course</button></Link>
      </div>

      {courses.length === 0 && <p>You haven't created any courses yet.</p>}

      <div className="grid" style={{ marginTop: 16 }}>
        {courses.map((c) => (
          <div className="card" key={c.id}>
            <h3 style={{ margin: "0 0 6px" }}>{c.title}</h3>
            <span className="badge">{c.is_published ? "Published" : "Draft"}</span>
            <p style={{ color: "#6b7280", fontSize: 13 }}>
              ★ {c.average_rating} ({c.rating_count}) · ₹{c.price}
            </p>
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <Link to={`/instructor/courses/${c.id}`}><button className="btn-secondary">Edit</button></Link>
              <button className="btn-secondary" onClick={() => togglePublish(c)}>
                {c.is_published ? "Unpublish" : "Publish"}
              </button>
              <button className="btn-danger" onClick={() => remove(c)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
