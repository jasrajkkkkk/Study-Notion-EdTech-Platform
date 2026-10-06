import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";
import RatingStars from "../../components/RatingStars";

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [myScore, setMyScore] = useState(0);
  const [myComment, setMyComment] = useState("");
  const [busy, setBusy] = useState(false);

  const load = () => {
    api.get(`/courses/${id}/`).then((res) => setCourse(res.data));
    api.get("/enrollments/").then((res) => {
      const list = res.data.results || res.data;
      setEnrollment(list.find((e) => e.course === Number(id)) || null);
    });
    api.get("/ratings/", { params: { course: id } }).then((res) =>
      setRatings(res.data.results || res.data)
    );
  };

  useEffect(load, [id]);

  const enrollFree = async () => {
    setBusy(true);
    await api.post("/enrollments/", { course: id });
    setBusy(false);
    load();
  };

  const submitRating = async (e) => {
    e.preventDefault();
    await api.post("/ratings/", { course: id, score: myScore, comment: myComment });
    setMyComment("");
    load();
  };

  if (!course) return <div className="container">Loading…</div>;

  const unlocked = enrollment?.has_paid;

  return (
    <div className="container" style={{ maxWidth: 800 }}>
      <h2>{course.title}</h2>
      <p style={{ color: "#6b7280" }}>by {course.instructor_name}</p>
      <p>{course.description}</p>
      <p><RatingStars value={course.average_rating} /> ({course.rating_count} ratings)</p>

      {!unlocked && (
        <div className="card" style={{ marginBottom: 24 }}>
          <strong>{course.price > 0 ? `₹${course.price}` : "Free"}</strong>
          <div style={{ marginTop: 8 }}>
            {course.price > 0 ? (
              <button className="btn-primary" disabled={busy}
                onClick={() => navigate(`/student/checkout/${course.id}`)}>
                Buy now
              </button>
            ) : (
              <button className="btn-primary" disabled={busy} onClick={enrollFree}>
                Enroll for free
              </button>
            )}
          </div>
        </div>
      )}

      {unlocked && (
        <div style={{ marginBottom: 24 }}>
          <h3>Lessons</h3>
          {course.lessons?.length === 0 && <p>No lessons added yet.</p>}
          {course.lessons?.map((l) => (
            <div key={l.id} className="card" style={{ marginBottom: 8 }}>
              <strong>{l.order + 1}. {l.title}</strong>
              <p>{l.content}</p>
              {l.video_url && <a href={l.video_url} target="_blank" rel="noreferrer">Watch video ↗</a>}
            </div>
          ))}

          <h3 style={{ marginTop: 24 }}>Rate this course</h3>
          <form className="form-stack" onSubmit={submitRating}>
            <RatingStars value={myScore} onChange={setMyScore} />
            <textarea placeholder="Optional comment" value={myComment}
              onChange={(e) => setMyComment(e.target.value)} rows={2} />
            <button className="btn-secondary" type="submit" disabled={myScore === 0}>Submit rating</button>
          </form>
        </div>
      )}

      <h3>Reviews</h3>
      {ratings.length === 0 && <p>No reviews yet.</p>}
      {ratings.map((r) => (
        <div key={r.id} className="card" style={{ marginBottom: 8 }}>
          <strong>{r.student_name}</strong> <RatingStars value={r.score} />
          <p>{r.comment}</p>
        </div>
      ))}
    </div>
  );
}
