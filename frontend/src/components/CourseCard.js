import { Link } from "react-router-dom";
import RatingStars from "./RatingStars";

export default function CourseCard({ course }) {
  return (
    <Link to={`/student/courses/${course.id}`} className="card">
      <h3 style={{ margin: "0 0 6px" }}>{course.title}</h3>
      <p style={{ color: "#6b7280", fontSize: 13, minHeight: 36 }}>
        {course.description?.slice(0, 90)}{course.description?.length > 90 ? "…" : ""}
      </p>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span>
          <RatingStars value={course.average_rating} />{" "}
          <small style={{ color: "#6b7280" }}>({course.rating_count})</small>
        </span>
        <strong>{course.price > 0 ? `₹${course.price}` : "Free"}</strong>
      </div>
      <div style={{ marginTop: 6, fontSize: 12, color: "#6b7280" }}>by {course.instructor_name}</div>
    </Link>
  );
}
