import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const user = await login(username, password);
      navigate(user.role === "INSTRUCTOR" ? "/instructor" : "/student");
    } catch {
      setError("Invalid username or password.");
    }
  };

  return (
    <div className="container" style={{ maxWidth: 400 }}>
      <h2>Log in</h2>
      <form className="form-stack" onSubmit={handleSubmit}>
        <input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        {error && <span className="error-text">{error}</span>}
        <button className="btn-primary" type="submit">Log in</button>
      </form>
      <p>No account? <Link to="/signup">Sign up</Link></p>
    </div>
  );
}
