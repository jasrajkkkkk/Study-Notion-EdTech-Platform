import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Signup() {
  const [form, setForm] = useState({ username: "", email: "", password: "", role: "STUDENT" });
  const [error, setError] = useState("");
  const { signup } = useAuth();
  const navigate = useNavigate();

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const user = await signup(form.username, form.email, form.password, form.role);
      navigate(user.role === "INSTRUCTOR" ? "/instructor" : "/student");
    } catch (err) {
      const data = err.response?.data;
      setError(data ? Object.values(data).flat().join(" ") : "Signup failed.");
    }
  };

  return (
    <div className="container" style={{ maxWidth: 400 }}>
      <h2>Create account</h2>
      <form className="form-stack" onSubmit={handleSubmit}>
        <input placeholder="Username" value={form.username} onChange={update("username")} required />
        <input type="email" placeholder="Email" value={form.email} onChange={update("email")} />
        <input type="password" placeholder="Password" value={form.password} onChange={update("password")} required />
        <select value={form.role} onChange={update("role")}>
          <option value="STUDENT">I'm a Student</option>
          <option value="INSTRUCTOR">I'm an Instructor</option>
        </select>
        {error && <span className="error-text">{error}</span>}
        <button className="btn-primary" type="submit">Sign up</button>
      </form>
      <p>Already have an account? <Link to="/login">Log in</Link></p>
    </div>
  );
}
