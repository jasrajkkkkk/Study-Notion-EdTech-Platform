import { useEffect, useState } from "react";
import api from "../../api/axios";
import CourseCard from "../../components/CourseCard";

export default function StudentDashboard() {
  const [courses, setCourses] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const loadCourses = (query = "") => {
    api.get("/courses/", { params: query ? { search: query } : {} }).then((res) => {
      setCourses(res.data.results || res.data);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadCourses();
    api.get("/recommendations/").then((res) => setRecommended(res.data)).catch(() => {});
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    loadCourses(search);
  };

  return (
    <div className="container">
      <form onSubmit={handleSearch} style={{ marginBottom: 24, display: "flex", gap: 8 }}>
        <input
          style={{ flex: 1 }}
          placeholder="Search courses by title, tag, or topic…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="btn-primary" type="submit">Search</button>
      </form>

      {recommended.length > 0 && (
        <section style={{ marginBottom: 32 }}>
          <h2>Recommended for you</h2>
          <div className="grid">
            {recommended.map((c) => <CourseCard key={c.id} course={c} />)}
          </div>
        </section>
      )}

      <section>
        <h2>All courses</h2>
        {loading ? <p>Loading…</p> : (
          <div className="grid">
            {courses.map((c) => <CourseCard key={c.id} course={c} />)}
            {courses.length === 0 && <p>No courses found.</p>}
          </div>
        )}
      </section>
    </div>
  );
}
