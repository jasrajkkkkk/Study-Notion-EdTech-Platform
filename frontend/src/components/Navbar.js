import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const home = user?.role === "INSTRUCTOR" ? "/instructor" : "/student";

  return (
    <nav style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "12px 24px", background: "#fff", borderBottom: "1px solid #e5e7eb",
    }}>
      <Link to={user ? home : "/"} style={{ fontWeight: 700 }}>EdTech Platform</Link>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        {user ? (
          <>
            <span className="badge">{user.role}</span>
            <span>{user.username}</span>
            <button className="btn-secondary" onClick={() => { logout(); navigate("/login"); }}>
              Log out
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Log in</Link>
            <Link to="/signup"><button className="btn-primary">Sign up</button></Link>
          </>
        )}
      </div>
    </nav>
  );
}
